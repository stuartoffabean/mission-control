"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const liveStats = useQuery(api.trading.getTradeStats, { mode: "live" });
  const livePortfolio = useQuery(api.trading.getPortfolio, { mode: "live" });
  const cronJobs = useQuery(api.cronJobs.list);

  const activeCrons = (cronJobs || []).filter((c: any) => c.status === "active").length;
  const errorCrons = (cronJobs || []).filter((c: any) => c.status === "error").length;

  return (
    <div className="h-full overflow-auto px-4 md:px-8 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Clean operator view (single source: Convex sync)</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Live P&L</div><div className="text-xl font-semibold">${(liveStats?.totalPnl || 0).toFixed(2)}</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Win Rate</div><div className="text-xl font-semibold">{liveStats?.winRate || "N/A"}%</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Active Crons</div><div className="text-xl font-semibold">{activeCrons}</div></CardContent></Card>
          <Card className="notion-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Cron Errors</div><div className="text-xl font-semibold">{errorCrons}</div></CardContent></Card>
        </div>

        <Card className="notion-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Portfolio</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span>Total Value</span><span>${(livePortfolio?.totalValue || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Cash</span><span>${(livePortfolio?.cashBalance || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Unrealized</span><span>${(livePortfolio?.unrealizedPnl || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Last Snapshot</span><Badge variant="secondary">{livePortfolio?.timestamp ? new Date(livePortfolio.timestamp).toLocaleString() : "n/a"}</Badge></div>
          </CardContent>
        </Card>

        <Card className="notion-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Cron Health</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(cronJobs || []).slice(0, 8).map((c: any) => (
              <div key={c._id} className="flex justify-between border-b border-border/50 pb-1">
                <span>{c.name}</span>
                <Badge variant={c.status === "error" ? "destructive" : "secondary"}>{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
