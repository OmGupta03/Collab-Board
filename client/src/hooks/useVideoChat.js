import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

// Configuration for RTCPeerConnection
const rtcConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
    ]
};

export default function useVideoChat({ roomId, user, socket, emit, on, off }) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }
    const [isVideoOn, setIsVideoOn] = useState(false);
    
    // Keep a ref of localStream for cleanup
    const localStreamRef = useRef(null);
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // Store RTCPeerConnections
    const peersRef = useRef({}); 
    // Store pending ICE candidates if remote description isn't set yet
    const pendingCandidatesRef = useRef({}); 

    const cleanupPeer = useCallback((socketId) => {
        if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
        }
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[socketId];
            return next;
        });
    }, []);

    const createPeer = useCallback((targetSocketId, stream, initiator) => {
        const peer = new RTCPeerConnection(rtcConfig);
        
        const currentStream = stream || localStreamRef.current;

        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                peer.addTrack(track, currentStream);
            });
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                emit("video:signal", {
                    userToSignal: targetSocketId,
                    callerID: socket.id,
                    signalData: { type: 'candidate', candidate: event.candidate }
                });
            }
        };

        peer.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setRemoteStreams(prev => ({
                ...prev,
                [targetSocketId]: remoteStream
            }));
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed' || peer.connectionState === 'closed') {
                cleanupPeer(targetSocketId);
            }
        };

        if (initiator) {
            peer.createOffer().then(offer => {
                return peer.setLocalDescription(offer);
            }).then(() => {
                emit("video:signal", {
                    userToSignal: targetSocketId,
                    callerID: socket.id,
                    signalData: { type: 'offer', offer: peer.localDescription }
                });
            }).catch(e => console.error("Error creating offer:", e));
        }

        return peer;
    }, [emit, socket, cleanupPeer]);

    const handleSignal = useCallback(async ({ callerID, signalData }) => {
        if (callerID === socket?.id) return; // Ignore own signals

        let peer = peersRef.current[callerID];

        // If receiving an offer and we don't have a peer connection yet, create one
        if (signalData.type === 'offer') {
            if (!peer) {
                peer = createPeer(callerID, localStreamRef.current, false);
                peersRef.current[callerID] = peer;
            }
            
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(signalData.offer));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                emit("video:signal", {
                    userToSignal: callerID,
                    callerID: socket.id,
                    signalData: { type: 'answer', answer: peer.localDescription }
                });

                // Add pending candidates
                if (pendingCandidatesRef.current[callerID]) {
                    for (const candidate of pendingCandidatesRef.current[callerID]) {
                        await peer.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    delete pendingCandidatesRef.current[callerID];
                }
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        } 
        else if (signalData.type === 'answer') {
            if (peer) {
                try {
                    await peer.setRemoteDescription(new RTCSessionDescription(signalData.answer));
                } catch (error) {
                    console.error("Error handling answer:", error);
                }
            }
        } 
        else if (signalData.type === 'candidate') {
            if (peer && peer.remoteDescription) {
                try {
                    await peer.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                } catch (error) {
                    console.error("Error adding ice candidate:", error);
                }
            } else {
                if (!pendingCandidatesRef.current[callerID]) {
                    pendingCandidatesRef.current[callerID] = [];
                }
                pendingCandidatesRef.current[callerID].push(signalData.candidate);
            }
        }
    }, [createPeer, socket, emit]);

    const toggleVideo = async () => {
        if (isVideoOn) {
            // Stop video
            localStream?.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setIsVideoOn(false);
            emit("video:stop", { roomId, userId: user._id });
            
            // Close all peers
            Object.keys(peersRef.current).forEach(cleanupPeer);
        } else {
            // Start video
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                // Also set ref immediately to avoid any race condition before effect runs
                localStreamRef.current = stream;
                setIsVideoOn(true);
                emit("video:start", { roomId, userId: user._id });
                
                // If there are already peers connected (e.g. they initiated connection when we joined, 
                // but we didn't have video), we should renegotiate. For simplicity in a mesh network,
                // we can just tell the room we started our video, and they will send us new offers.
                // Wait, if peers already exist, we need to add tracks and renegotiate.
                // It's safer to just close existing peers and let them be recreated by the offers
                // generated in response to video:start.
                Object.keys(peersRef.current).forEach(cleanupPeer);
            } catch (err) {
                console.error("Failed to get media:", err);
                toast.error("Could not access camera/microphone");
            }
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleUserStarted = ({ socketId }) => {
            if (socketId === socket.id) return;
            const peer = createPeer(socketId, localStreamRef.current, true);
            peersRef.current[socketId] = peer;
        };

        const handleUserStopped = ({ socketId }) => {
            cleanupPeer(socketId);
        };

        on("video:user_started", handleUserStarted);
        on("video:user_stopped", handleUserStopped);
        on("video:signal", handleSignal);

        return () => {
            off("video:user_started", handleUserStarted);
            off("video:user_stopped", handleUserStopped);
            off("video:signal", handleSignal);
        };
    }, [on, off, createPeer, handleSignal, socket, cleanupPeer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            Object.keys(peersRef.current).forEach(socketId => {
                peersRef.current[socketId].close();
            });
            peersRef.current = {};
        };
    }, []);

    return {
        localStream,
        remoteStreams,
        isVideoOn,
        toggleVideo
    };
}
