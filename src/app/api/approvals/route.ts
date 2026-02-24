import { NextResponse } from "next/server";

// Placeholder in clean mode (approval actions now handled in weather-trader ops layer)
export async function GET() {
  return NextResponse.json({ pendingCount: 0, pending: [] });
}

export async function POST() {
  return NextResponse.json({ ok: false, error: "approval actions not wired in clean mode" }, { status: 501 });
}
