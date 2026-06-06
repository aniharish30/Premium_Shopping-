import { createContext, useContext, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shopverse_user")); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = (token, userData) => {
    localStorage.setItem("shopverse_token", token);
    localStorage.setItem("shopverse_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Login failed" };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveAuth(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Registration failed" };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("shopverse_token");
    localStorage.removeItem("shopverse_user");
    setUser(null);
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    localStorage.setItem("shopverse_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
