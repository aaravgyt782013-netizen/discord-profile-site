import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d{15,22}$/.test(id)) return NextResponse.json({ error: "Invalid Discord user ID." }, { status: 400 });
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (response.status === 404) return NextResponse.json({ error: "Discord user is not currently monitored by Lanyard." }, { status: 404 });
    if (!response.ok) return NextResponse.json({ error: "Discord presence service unavailable." }, { status: 503 });
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load Discord presence." }, { status: 503 });
  }
}
