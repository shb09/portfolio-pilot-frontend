import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const isAdmin = (user) => user?.role === "ADMIN";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pp_user") || "null");
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  // Re-validate a saved session on load (role included).
  useEffect(() => {
    const token = localStorage.getItem("pp_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("pp_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("pp_token");
        localStorage.removeItem("pp_user");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  /** Registration creates an active session immediately (no verification gate). */
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, ready, isAdmin: isAdmin(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
