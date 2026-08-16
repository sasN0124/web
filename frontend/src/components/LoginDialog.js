import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const LoginDialog = ({ open, onOpenChange }) => {
  const { login } = useRole();
  const [code, setCode] = useState("");

  const submit = (e) => {
    e?.preventDefault();
    const ok = login(code);
    if (ok) {
      toast.success("Ahora eres administrador", {
        description: "Tienes acceso al reproductor compartido.",
      });
      setCode("");
      onOpenChange?.(false);
    } else {
      toast.error("Código incorrecto", { description: "Inténtalo de nuevo." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="login-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" /> Ingresar como admin
          </DialogTitle>
          <DialogDescription>
            Introduce el código de administrador para desbloquear el reproductor
            compartido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input
            type="password"
            placeholder="Código de admin"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            data-testid="login-code-input"
            autoFocus
          />
          <Button type="submit" className="w-full" data-testid="login-submit-button">
            Ingresar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
