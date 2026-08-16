import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRole } from "@/context/RoleContext";
import { LoginDialog } from "@/components/LoginDialog";
import { Mic2, Search, ListMusic, MonitorPlay, Menu, LogIn, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  }`;

export const Layout = ({ children }) => {
  const { isAdmin, logout } = useRole();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast("Sesión de admin cerrada", { description: "Vuelves a ser usuario." });
    navigate("/");
  };

  const Links = ({ onClick }) => (
    <>
      <NavLink to="/" end className={navItemClass} onClick={onClick} data-testid="nav-buscar">
        <Search className="h-4 w-4" /> Buscar
      </NavLink>
      <NavLink to="/lista" className={navItemClass} onClick={onClick} data-testid="nav-lista">
        <ListMusic className="h-4 w-4" /> Lista compartida
      </NavLink>
      {isAdmin && (
        <NavLink to="/reproductor" className={navItemClass} onClick={onClick} data-testid="nav-reproductor">
          <MonitorPlay className="h-4 w-4" /> Reproductor
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2" data-testid="brand-logo">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mic2 className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
              Karaoke <span className="text-primary">Compartido</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            <Links />
          </nav>

          <div className="flex items-center gap-2">
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className={`hidden gap-1 sm:inline-flex ${isAdmin ? "bg-accent text-accent-foreground" : ""}`}
              data-testid="role-badge"
            >
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {isAdmin ? "Admin" : "Usuario"}
            </Badge>

            {isAdmin ? (
              <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-1" data-testid="header-logout-button">
                <LogOut className="h-4 w-4" /> Salir
              </Button>
            ) : (
              <Button size="sm" onClick={() => setLoginOpen(true)} className="gap-1" data-testid="header-login-button">
                <LogIn className="h-4 w-4" /> Ingresar
              </Button>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-button" aria-label="Menú">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-display">Navegación</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  <Links onClick={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};
