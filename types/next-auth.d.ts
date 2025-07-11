import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";

export type ExtendedUser =
  | (DefaultSession["user"] & {
      id: string;
      firstname: string;
      lastname: string;
      perfil: number;
      id_consumidor: number;
    })
  | null;

declare module "next-auth/jwt" {
  interface JWT {
    user: ExtendedUser;
  }
}

declare module "next-auth" {
  interface User extends DefaultSession["user"] {
    firstname: string;
    lastname: string;
    perfil: number;
    id_consumidor: number;
  }

  interface Session {
    user: ExtendedUser;
  }
}
