import { useState, useMemo } from "react";
import { authService } from "../services/authService.js";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("collabboard_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading] = useState(false);

const login = async (email, password) => {
  const data = await authService.login(email, password);
  setUser(data);
  localStorage.setItem("collabboard_user", JSON.stringify(data));
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

const register = async (name, email, password) => {
  const data = await authService.register(name, email, password);
  setUser(data);
  localStorage.setItem("collabboard_user", JSON.stringify(data));
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

const logout = () => {
  setUser(null);
  localStorage.removeItem("collabboard_user");
  localStorage.removeItem("token");
};

const updateUser = (updated) => {
  console.log("💾 AuthContext: Updating user:", updated?.name);
  setUser(updated);
  localStorage.setItem("collabboard_user", JSON.stringify(updated));
  if (updated?.token) {
    localStorage.setItem("token", updated.token);
  }
};

const value = useMemo(() => ({
  user, loading, login, register, logout, updateUser
}), [user, loading]);

  // No global URL token check. Centralized in GoogleCallbackPage for performance.


return (
<AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
