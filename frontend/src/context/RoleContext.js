import React, { createContext, useContext, useState } from "react";

const RoleContext = createContext(null);

const ADMIN_CODE = "admin123";
const STORAGE_KEY = "karaoke_role";

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "admin" ? "admin" : "user";
    } catch (e) {
      return "user";
    }
  });

  const login = (code) => {
    if (String(code).trim() === ADMIN_CODE) {
      setRole("admin");
      localStorage.setItem(STORAGE_KEY, "admin");
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole("user");
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = { role, isAdmin: role === "admin", login, logout };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
