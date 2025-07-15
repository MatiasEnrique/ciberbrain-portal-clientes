import { PrismaClient } from "@/prisma/@/generated/prisma";
import { Sql } from "@/prisma/@/generated/prisma/runtime/library";
import { auth } from "@/auth";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const executeWithUserValidation = async (
  query: TemplateStringsArray | Sql
) => {
  const session = await auth();

  try {
    const transaction = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`
            delete FROM CC_UsuarioActual WHERE IDProceso = @@SPID;
            insert into CC_UsuarioActual(IDProceso, IDUsuario, Sistema, Sucursal, SubUser) values (@@SPID,${
              session?.user?.id_consumidor
            }, 'WP', 0, ${parseInt(session?.user?.id || "0")})
      `;

        const queryResult = await tx.$queryRaw(query);

        return queryResult;
      },
      {
        timeout: 10000,
      }
    );

    return transaction;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
