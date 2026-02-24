"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TradingPage() {
  const trades = useQuery(api.trading.getTrades, { mode: "live" }) || [];

  return (
    <div className="h-full overflow-auto px-4 md:px-8 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Live Trades</h1>
          <p className="text-muted-foreground">Single-source live trade feed from Convex sync</p>
        </div>

        <Card className="notion-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Trades ({trades.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {trades.length === 0 && <div className="text-sm text-muted-foreground">No live trades available.</div>}
            {trades.slice(0, 50).map((t: any) => (
              <div key={t._id} className="rounded-md border p-2 text-sm">
                <div className="font-medium">{t.market}</div>
                <div className="text-xs text-muted-foreground flex gap-2 items-center mt-1">
                  <Badge variant={t.type === "buy" ? "secondary" : "destructive"}>{t.type}</Badge>
                  <Badge variant="outline">{t.side}</Badge>
                  <span>{t.shares} @ ${Number(t.price || 0).toFixed(4)}</span>
                  <span>${Number(t.amount || 0).toFixed(2)}</span>
                  <span>{new Date(t.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
