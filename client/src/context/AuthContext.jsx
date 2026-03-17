import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

// Restore user from localStorage
useEffect(() => {
const stored = localStorage.getItem("collabboard_user");
if (stored) setUser(JSON.parse(stored));
setLoading(false);
}, []);

const login = async (email, password) => {
const data = await authService.login(email, password);

```
setUser(data);
localStorage.setItem("collabboard_user", JSON.stringify(data));

return data;
```

};

const register = async (name, email, password) => {
const data = await authService.register(name, email, password);

```
setUser(data);
localStorage.setItem("collabboard_user", JSON.stringify(data));

return data;
```

};

const logout = () => {
setUser(null);
localStorage.removeItem("collabboard_user");
};

const updateUser = (updated) => {
setUser(updated);
localStorage.setItem("collabboard_user", JSON.stringify(updated));
};

// Handle Google OAuth callback
useEffect(() => {
const urlParams = new URLSearchParams(window.location.search);

const token = urlParams.get("token");
const name = urlParams.get("name");
const email = urlParams.get("email");
const avatar = urlParams.get("avatar");

if (token && !user) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userData = {
      _id: payload.id,
      token,
      name,
      email,
      avatar,
    };

    updateUser(userData);

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);

  } catch (err) {
    console.error("Invalid Google token", err);
  }
}

}, [user]);

return (
<AuthContext.Provider
value={{ user, loading, login, register, logout, updateUser }}
>
{children}
</AuthContext.Provider>
);
};

// Custom hook
export const useAuth = () => {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
return ctx;
};
