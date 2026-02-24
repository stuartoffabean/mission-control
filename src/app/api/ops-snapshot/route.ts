import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function safeFetchJson(url: string) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) return { ok: false, status: res.status };
    return await res.json();
  } catch {
    return null;
  }
}

function safeReadJson(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export async function GET() {
  const base = "/data/workspace/weather-trader/data";

  const [executor, ws] = await Promise.all([
    safeFetchJson("http://localhost:3002/health"),
    safeFetchJson("http://localhost:3003/health"),
  ]);

  const freshness = safeReadJson(path.join(base, "source-freshness-report.json"));
  const anomalies = safeReadJson(path.join(base, "execution-anomaly-report.json"));
  const evidence = safeReadJson(path.join(base, "evidence-pack.json"));
  const recommendation = safeReadJson(path.join(base, "promotion-recommendation.json"));

  return NextResponse.json({
    now: new Date().toISOString(),
    executor,
    ws,
    freshness,
    anomalies,
    evidence,
    recommendation,
  });
}
