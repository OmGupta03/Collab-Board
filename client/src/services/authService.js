import api from "./api.js";

export const authService = {
  // Register new user
  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
  },

  // Login
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  // Get current user info
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};