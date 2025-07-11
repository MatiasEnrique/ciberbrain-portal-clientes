"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
export function LogoutButton() {
  return (
    <Button
      variant={"ghost"}
      onClick={async () => await signOut({ redirectTo: "/auth/login" })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar sesion
    </Button>
  );
}
