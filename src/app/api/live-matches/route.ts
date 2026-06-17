import { NextResponse } from "next/server";

import { getAllMatches } from "@/lib/data/matches";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const matches = await getAllMatches();
  return NextResponse.json(
    { matches, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
