"use client";
import { ChevronDown, User, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data } = useSession();

  const navLinks = [
    { href: "/contacto", label: "Contacto" },
    { href: "/servicio-tecnico", label: "Servicio Técnico" },
    { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  ];

  if (data?.user) {
    navLinks.unshift({ href: "/productos", label: "Productos" });
    navLinks.unshift({ href: "/perfil", label: "Mi Perfil" });
  } else {
    navLinks.push({ href: "/auth/login", label: "Iniciar Sesión" });
  }

  return (
    <div className="w-full bg-background">
      <div className="sticky top-4 z-50 px-6 pt-4">
        <nav className="relative mx-auto max-w-6xl rounded-2xl shadow-lg shadow-gray-900/5">
          <div className="absolute inset-0 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md" />
          <div className="relative flex items-center justify-between px-8 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  CB
                </span>
              </div>
              <span className="text-xl font-semibold text-foreground">
                {process.env.NEXT_PUBLIC_CLIENT_NAME}
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-card/50 border-border/50 hover:bg-card/80 rounded-xl px-4 py-2 text-foreground"
                    >
                      <User className="h-4 w-4" />
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-popover/95 border-border/50 text-foreground"
                  >
                    <DropdownMenuItem>
                      <Link href={"/perfil"} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive p-0">
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-popover/95 border-border/50 text-foreground"
                  >
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href}>{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive p-0">
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ModeToggle />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
