"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Loader2, BarChart3, Target, Zap } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Mode = "live" | "paper";

function StatsCards({ mode }: { mode: Mode }) {
  const portfolio = useQuery(api.trading.getPortfolio, { mode });
  const stats = useQuery(api.trading.getTradeStats, { mode });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {mode === "live" ? "Cash Balance" : "Paper Balance"}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${portfolio?.cashBalance?.toFixed(2) || (mode === "live" ? "325.40" : "10,000.00")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${(stats?.totalPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(stats?.totalPnl || 0) >= 0 ? '+' : ''}${(stats?.totalPnl || 0).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.winRate || "N/A"}%</div>
          <p className="text-xs text-muted-foreground">
            {stats?.wins || 0}W / {stats?.losses || 0}L
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.pending || 0} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(stats?.totalInvested || 0).toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StrategyBreakdown({ mode }: { mode: Mode }) {
  const stats = useQuery(api.trading.getTradeStats, { mode });
  const strategies = stats?.byStrategy || {};

  if (Object.keys(strategies).length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Strategy Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(strategies).map(([name, data]: [string, any]) => (
            <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="font-medium capitalize">{name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {data.count} trades • {data.wins}W/{data.losses}L
                </span>
              </div>
              <div className={`font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TradeList({ mode }: { mode: Mode }) {
  const trades = useQuery(api.trading.getTrades, { mode }) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {mode === "live" ? "Trade History" : "Paper Trade History"}
          <Badge variant="secondary" className="ml-2">{trades.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {mode} trades yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-auto">
            {trades.map((trade: any) => (
              <div key={trade._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{trade.market}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant={trade.type === "buy" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                      {trade.type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {trade.side.toUpperCase()}
                    </Badge>
                    {trade.strategy && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {trade.strategy}
                      </Badge>
                    )}
                    <span>{trade.shares} shares @ ${trade.price.toFixed(4)}</span>
                    <span>{new Date(trade.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold">${trade.amount.toFixed(2)}</div>
                  {trade.result && trade.result !== "pending" && (
                    <div className={`text-xs font-medium ${trade.result === "win" ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.result === "win" ? "✅" : "❌"} {trade.pnl != null ? `$${trade.pnl.toFixed(2)}` : ""}
                    </div>
                  )}
                  {(!trade.result || trade.result === "pending") && (
                    <div className="text-xs text-yellow-400">⏳ pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TradingPage() {
  const [mode, setMode] = useState<Mode>("paper");

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground">
              {mode === "live" ? "Real money positions and P&L" : "Paper trade testing and strategy validation"}
            </p>
          </div>
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={mode === "live" ? "default" : "ghost"}
              className={`rounded-none ${mode === "live" ? "" : "text-muted-foreground"}`}
              onClick={() => setMode("live")}
            >
              <Zap className="h-4 w-4 mr-1" />
              Live
            </Button>
            <Button
              variant={mode === "paper" ? "default" : "ghost"}
              className={`rounded-none ${mode === "paper" ? "" : "text-muted-foreground"}`}
              onClick={() => setMode("paper")}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Paper
            </Button>
          </div>
        </div>

        <StatsCards mode={mode} />
        <StrategyBreakdown mode={mode} />
        <TradeList mode={mode} />
      </div>
    </div>
  );
}
