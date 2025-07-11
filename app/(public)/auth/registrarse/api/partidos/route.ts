import { NextRequest, NextResponse } from "next/server";
import { getPartidos } from "../../data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provincia = searchParams.get("provincia");

  if (!provincia) {
    return NextResponse.json(
      { error: "Provincia is required" },
      { status: 400 }
    );
  }

  const partidos = await getPartidos(provincia);

  return NextResponse.json(partidos);
}
