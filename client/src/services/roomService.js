import api from "./api.js";

export const roomService = {
  // Get all rooms for logged in user
  getUserRooms: async () => {
    const { data } = await api.get("/rooms");
    return data;
  },

  // Create a new room
  createRoom: async (name, isPrivate = false, password = null, maxParticipants = 10) => {
    const { data } = await api.post("/rooms", { name, isPrivate, password, maxParticipants });
    return data;
  },

  // Get a single room by roomId (e.g. CB-7X2K9)
  getRoomById: async (roomId) => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
  },

  // Join a room by roomId
  joinRoom: async (roomId, password = null) => {
    const { data } = await api.post("/rooms/join", { roomId, password });
    return data;
  },

  // Delete a room
  deleteRoom: async (roomId) => {
    const { data } = await api.delete(`/rooms/${roomId}`);
    return data;
  },

  // Get chat messages for a room
  getMessages: async (roomId) => {
    const { data } = await api.get(`/messages/${roomId}`);
    return data;
  },

  // Upload a file
  uploadFile: async (roomId, file, tag = "General", remark = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);
    formData.append("tag", tag);
    formData.append("remark", remark);
    const { data } = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Get user's materials (Notes & Assignments)
  getUserMaterials: async () => {
    const { data } = await api.get("/files/user/materials");
    return data;
  },

  // Get files for a room
  getRoomFiles: async (roomId) => {
    const { data } = await api.get(`/files/${roomId}`);
    return data;
  },

  // Delete a file
  deleteFile: async (fileId) => {
    const { data } = await api.delete(`/files/${fileId}`);
    return data;
  },
};