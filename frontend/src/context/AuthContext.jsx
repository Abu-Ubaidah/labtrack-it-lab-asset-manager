import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("labtrack_token");
    if (!t) { setReady(true); return; }
    api.me()
      .then((j) => setUser(j.user))
      .catch(() => localStorage.removeItem("labtrack_token"))
      .finally(() => setReady(true));
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem("labtrack_token", token);
    setUser(user);
  };
  const logout = () => {
    localStorage.removeItem("labtrack_token");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
