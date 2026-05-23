import { useState, useRef, useEffect, useCallback } from 'react';

export default function useTimer({ roomId, emit, on, off }) {
    const [timerSecs, setTimerSecs] = useState(300);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerInput, setTimerInput] = useState("5");
    const timerRef = useRef(null);

    const broadcastTimer = useCallback((secs, running) => {
        if (emit && roomId) {
            emit("room:timer_sync", { roomId, secs, running });
        }
    }, [emit, roomId]);


    // Listen for remote timer events
    useEffect(() => {
        if (!on || !off) return;
        const handleTimerSync = ({ secs, running }) => {
            setTimerSecs(secs);
            setTimerRunning(running);
        };
        on("room:timer_sync", handleTimerSync);

        const handleUserJoined = () => {
            // Re-broadcast our state so the new user gets it
            setTimerSecs(currentSecs => {
                setTimerRunning(currentRunning => {
                    if (currentRunning) {
                        broadcastTimer(currentSecs, currentRunning);
                    }
                    return currentRunning;
                });
                return currentSecs;
            });
        };
        on("room:user_joined", handleUserJoined);

        return () => {
            off("room:timer_sync", handleTimerSync);
            off("room:user_joined", handleUserJoined);
        };
    }, [on, off]);

    // Local interval when running
    useEffect(() => {
        if (!timerRunning) {
            clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setTimerSecs(s => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    setTimerRunning(false);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timerRunning]);


    const startTimer = () => {
        const m = parseInt(timerInput) || 5;
        const secs = m * 60;
        setTimerSecs(secs);
        setTimerRunning(true);
        broadcastTimer(secs, true);
    };

    const resetTimer = () => {
        const m = parseInt(timerInput) || 5;
        const secs = m * 60;
        setTimerSecs(secs);
        setTimerRunning(false);
        broadcastTimer(secs, false);
    };

    const pauseTimer = () => {
        setTimerRunning(false);
        // We need the current timerSecs, which is available in state.
        // However, React state might be slightly stale in a closure, but here it's okay because pauseTimer is called directly.
        setTimerSecs(currentSecs => {
            broadcastTimer(currentSecs, false);
            return currentSecs;
        });
    };

    return { timerSecs, timerRunning, timerInput, setTimerInput, pauseTimer, startTimer, resetTimer };
}
