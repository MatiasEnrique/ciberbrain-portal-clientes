import { NextRequest, NextResponse } from "next/server";
import { getProvincias } from "../../data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pais = searchParams.get("pais");

  if (!pais) {
    return NextResponse.json({ error: "Pais is required" }, { status: 400 });
  }

  const provincias = await getProvincias(pais);

  return NextResponse.json(provincias);
}
