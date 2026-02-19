"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from "lucide-react";

// Mock trading data
const portfolioData = {
  totalValue: 12847.32,
  cashBalance: 3245.67,
  unrealizedPnl: +542.18,
  realizedPnl: +1204.45,
  dayChange: +234.56,
  dayChangePercent: +1.87,
};

const positions = [
  {
    id: 1,
    market: "Trump wins 2024 Election",
    side: "yes" as const,
    shares: 150,
    entryPrice: 0.64,
    currentPrice: 0.72,
    unrealizedPnl: +12.00,
  },
  {
    id: 2,
    market: "Bitcoin above $100k by EOY",
    side: "no" as const,
    shares: 89,
    entryPrice: 0.23,
    currentPrice: 0.18,
    unrealizedPnl: +4.45,
  },
  {
    id: 3,
    market: "Lakers make playoffs",
    side: "yes" as const,
    shares: 200,
    entryPrice: 0.78,
    currentPrice: 0.71,
    unrealizedPnl: -14.00,
  },
];

const recentTrades = [
  {
    id: 1,
    market: "Fed cuts rates in March",
    side: "sell" as const,
    shares: 75,
    price: 0.45,
    amount: 33.75,
    timestamp: Date.now() - 3600000,
  },
  {
    id: 2,
    market: "OpenAI releases GPT-5",
    side: "buy" as const,
    shares: 120,
    price: 0.82,
    amount: 98.40,
    timestamp: Date.now() - 7200000,
  },
  {
    id: 3,
    market: "Tesla stock above $300",
    side: "buy" as const,
    shares: 200,
    price: 0.34,
    amount: 68.00,
    timestamp: Date.now() - 14400000,
  },
];

export default function TradingPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Portfolio overview, positions, and recent trading activity
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioData.totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +${portfolioData.dayChange.toFixed(2)} ({portfolioData.dayChangePercent}%) today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioData.cashBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available for trading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioData.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${portfolioData.unrealizedPnl.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realized P&L</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioData.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${portfolioData.realizedPnl.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Closed trades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{position.market}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Side: <span className={position.side === 'yes' ? 'text-green-400' : 'text-red-400'}>{position.side.toUpperCase()}</span></span>
                      <span>Shares: {position.shares}</span>
                      <span>Entry: ${position.entryPrice.toFixed(2)}</span>
                      <span>Current: ${position.currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={`text-right font-bold ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{trade.market}</h4>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                        {trade.side.toUpperCase()}
                      </span>
                      <span>{trade.shares} shares</span>
                      <span>@${trade.price.toFixed(2)}</span>
                      <span>{new Date(trade.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="font-bold">${trade.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}