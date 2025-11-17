import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(undefined); // undefined => initializing
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setToken(storedToken);
      setUser({}); // optionally fetch profile
    } else {
      delete api.defaults.headers.common["Authorization"];
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  // login: store token and update state (no navigation here)
  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    setToken(jwtToken);
    setUser({});
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
