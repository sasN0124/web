import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { Toaster } from "@/components/ui/sonner";
import SearchPage from "@/pages/SearchPage";
import PlaylistPage from "@/pages/PlaylistPage";
import PlayerPage from "@/pages/PlayerPage";
import { toast } from "sonner";

function AdminRoute({ children }) {
  const { isAdmin } = useRole();
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acceso solo para admin", {
        description: "Ingresa con el código de administrador para entrar al reproductor.",
      });
    }
  }, [isAdmin]);
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="App">
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/lista" element={<PlaylistPage />} />
            <Route
              path="/reproductor"
              element={
                <AdminRoute>
                  <PlayerPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </RoleProvider>
    </div>
  );
}

export default App;
