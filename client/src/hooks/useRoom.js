import { useState, useCallback, useEffect } from "react";
import { roomService } from "../services/roomService.js";
import { useSocket } from "./useSocket.js";
import toast from "react-hot-toast";

export const useRoom = () => {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(false);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleRoomDeletedGlobal = (roomId) => {
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
    };
    on("room:deleted_global", handleRoomDeletedGlobal);
    return () => off("room:deleted_global", handleRoomDeletedGlobal);
  }, [on, off]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomService.getUserRooms();
      setRooms(data);
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = async (name, isPrivate, password) => {
    try {
      const room = await roomService.createRoom(name, isPrivate, password);
      setRooms(prev => [room, ...prev]);
      toast.success("Board created!");
      return room;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = async (roomId, password) => {
    try {
      const room = await roomService.joinRoom(roomId, password);
      toast.success(`Joined ${room.name}!`);
      return room;
    } catch (err) {
      toast.error(err.response?.data?.message || "Room not found or incorrect password");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      toast.success("Board deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return { rooms, loading, fetchRooms, createRoom, joinRoom, deleteRoom };
};