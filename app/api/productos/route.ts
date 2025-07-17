import { getUserProducts } from "@/app/productos/data";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await getUserProducts(session.user.id);

  return NextResponse.json(products);
}
