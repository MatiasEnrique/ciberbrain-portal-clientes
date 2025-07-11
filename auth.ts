import { ExtendedUser } from "./types/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { CredentialsSignin } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "./lib/schemas";

class InvalidLoginError extends CredentialsSignin {
  code = "custom";
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Se requiere email y contraseña");
          }

          const { email, password } = signInSchema.parse(credentials);

          const dbUser = await prisma.user.findFirst({
            where: {
              EMail: email,
              Password: password,
            },
          });

          if (!dbUser) {
            throw new Error("Credenciales invalidas");
          }

          if (dbUser?.EstadoRegistracion == 0) {
            throw new Error(
              "Para poder iniciar sesion, debes verificar tu correo electronico"
            );
          }

          const logon = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`EXEC WP_LOGON ${
              dbUser.ID
            }, ${crypto.randomUUID()}`;

            const id_consumidor: { id_consumidor: number }[] =
              await tx.$queryRaw`select COALESCE(dbo.WP_GetUsuarioConsumidor(1), 0) as id_consumidor
              `;

            return id_consumidor;
          });

          return {
            id: dbUser.ID.toString(),
            email: dbUser.EMail || "",
            firstname: dbUser.Nombre || "",
            lastname: dbUser.Apellido || "",
            perfil: dbUser.Perfil || 0,
            id_consumidor: logon[0].id_consumidor,
          };
        } catch (error) {
          throw new InvalidLoginError((error as { message: string }).message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          perfil: user.perfil || 0,
          id_consumidor: user.id_consumidor || 0,
        } as ExtendedUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        const userFromToken = token.user as ExtendedUser;
        session.user = {
          id: userFromToken?.id || "",
          email: userFromToken?.email || "",
          emailVerified: null,
          firstname: userFromToken?.firstname || "",
          lastname: userFromToken?.lastname || "",
          perfil: userFromToken?.perfil || 0,
          id_consumidor: userFromToken?.id_consumidor || 0,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 3000,
  },
});
