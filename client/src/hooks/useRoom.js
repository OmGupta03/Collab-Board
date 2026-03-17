import { useState, useEffect } from "react";
import { roomService } from "../services/roomService.js";
import toast from "react-hot-toast";

export const useRoom = () => {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getUserRooms();
      setRooms(data);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name, isPrivate) => {
    try {
      const room = await roomService.createRoom(name, isPrivate);
      setRooms(prev => [room, ...prev]);
      toast.success("Board created!");
      return room;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const room = await roomService.joinRoom(roomId);
      toast.success(`Joined ${room.name}!`);
      return room;
    } catch (err) {
      toast.error(err.response?.data?.message || "Room not found");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      toast.success("Board deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return { rooms, loading, fetchRooms, createRoom, joinRoom, deleteRoom };
};