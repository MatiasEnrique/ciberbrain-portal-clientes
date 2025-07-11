import { getMarcas, getModelos } from "@/app/(protected)/productos/data";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marca = request.nextUrl.searchParams.get("marca");
  const modelo = request.nextUrl.searchParams.get("modelo");

  const modelos = await getModelos(marca as string, modelo as string);

  return NextResponse.json(modelos);
}
