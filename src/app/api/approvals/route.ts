import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = "/data/workspace/weather-trader";
const DECISIONS = path.join(ROOT, "data", "approval-decisions.json");

function readJson(filePath: string, fallback: any) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const list = readJson(DECISIONS, []);
  const pending = Array.isArray(list)
    ? list
        .map((item: any, idx: number) => ({ ...item, _idx: idx }))
        .filter((i: any) => i.status === "pending-human-approval")
    : [];
  return NextResponse.json({ pendingCount: pending.length, pending });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  const idx = Number(body?.idx);
  const reason = body?.reason || null;

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const list = readJson(DECISIONS, []);
  if (!Array.isArray(list) || !Number.isInteger(idx) || idx < 0 || idx >= list.length) {
    return NextResponse.json({ error: "invalid idx" }, { status: 400 });
  }

  if (list[idx]?.status !== "pending-human-approval") {
    return NextResponse.json({ error: "item not pending" }, { status: 409 });
  }

  list[idx].status = action === "approve" ? "approved" : "rejected";
  list[idx].action_ts = new Date().toISOString();
  if (reason) list[idx].action_reason = reason;

  list.push({
    ts: new Date().toISOString(),
    type: "ui-manual-action",
    target_index: idx,
    action,
    reason,
  });

  writeJson(DECISIONS, list);
  return NextResponse.json({ ok: true, idx, action });
}
