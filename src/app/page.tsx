"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Activity, Brain, AlertTriangle } from "lucide-react";

type Snap = any;

export default function HomePage() {
  const [snap, setSnap] = useState<Snap | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/ops-snapshot", { cache: "no-store" }),
        fetch("/api/approvals", { cache: "no-store" }),
      ]);
      setSnap(await r1.json());
      const a = await r2.json();
      setApprovals(a?.pending || []);
    } finally {
      setLoading(false);
    }
  };

  const doApproval = async (idx: number, action: "approve" | "reject") => {
    const reason = window.prompt(`${action.toUpperCase()} reason (optional):`) || "";
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idx, action, reason }),
    });
    await load();
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  if (loading && !snap) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const mode = snap?.executor?.ok ? "LIVE" : "DEGRADED";
  const anomalyCount = snap?.anomalies?.count ?? 0;
  const staleMin = snap?.freshness?.latest_run_age_min ?? null;

  return (
    <div className="h-full overflow-auto px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Notion-style operator view · mobile-first · auto-refresh 15s</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Mode</div><div className="text-lg font-semibold">{mode}</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Executor</div><div className="text-lg font-semibold">{snap?.executor?.ok ? "Online" : "Offline"}</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">WS Feed</div><div className="text-lg font-semibold">{snap?.ws?.ok ? "Online" : "Offline"}</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Anomalies (6h)</div><div className="text-lg font-semibold">{anomalyCount}</div></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="notion-card">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4"/> Safety</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Forecast freshness</span><Badge variant="secondary">{staleMin == null ? "n/a" : `${Math.round(staleMin)} min`}</Badge></div>
              <div className="flex items-center justify-between"><span>Anomaly stream</span><Badge variant={anomalyCount > 0 ? "destructive" : "secondary"}>{anomalyCount > 0 ? "Attention" : "Clean"}</Badge></div>
              <div className="flex items-center justify-between"><span>Evidence pack</span><Badge variant="secondary">{snap?.evidence?.ready_for_review ? "Ready" : "Pending"}</Badge></div>
            </CardContent>
          </Card>

          <Card className="notion-card">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4"/> Learning</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Recommendation</span><Badge variant="secondary">{snap?.recommendation?.final_recommendation || snap?.evidence?.recommendation || "hold"}</Badge></div>
              <div className="flex items-center justify-between"><span>Reason</span><span className="text-muted-foreground text-xs text-right max-w-[60%]">{snap?.recommendation?.reason || "-"}</span></div>
            </CardContent>
          </Card>
        </div>

        <Card className="notion-card">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4"/> Approvals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">Pending approvals: {approvals.length}</div>
            {approvals.length === 0 && <div className="text-xs text-muted-foreground">No pending items.</div>}
            {approvals.slice(0, 3).map((a: any) => (
              <div key={a._idx} className="rounded-md bg-muted/40 p-2 space-y-2">
                <div className="text-xs">{a.reason || "Pending decision"}</div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => doApproval(a._idx, "approve")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => doApproval(a._idx, "reject")}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="notion-card">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4"/> System details</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>Now: {snap?.now || "-"}</div>
            <div>WS connected: {String(snap?.ws?.wsConnected ?? false)}</div>
            <div>Tracked assets: {snap?.ws?.trackedAssets ?? "-"}</div>
            <div>If anything turns red, use Hard Halt from CLI: <code>npm run halt:hard</code></div>
          </CardContent>
        </Card>

        {anomalyCount > 0 && (
          <Card className="border-red-500/40 notion-card">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400"/> Recent anomalies</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(snap?.anomalies?.anomalies || []).slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="rounded-md bg-muted/40 p-2">
                  <div className="font-medium">{a.endpoint || "unknown"} · {a.status || "n/a"}</div>
                  <div className="text-xs text-muted-foreground">{a.time} {a.error ? `· ${a.error}` : ""}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
