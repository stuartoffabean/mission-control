"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function TradingPage() {
  const positions = useQuery(api.trading.getPositions) || [];
  const trades = useQuery(api.trading.getTrades) || [];
  const portfolio = useQuery(api.trading.getPortfolio);

  const isLoading = positions === undefined || trades === undefined || portfolio === undefined;

  // Calculate some derived values
  const totalUnrealizedPnl = positions.reduce((sum: number, pos: any) => sum + pos.unrealizedPnl, 0);
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading trading data...</span>
        </div>
      </div>
    );
  }

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
              <div className="text-2xl font-bold">
                ${portfolio ? portfolio.totalValue.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolio ? portfolio.cashBalance.toFixed(2) : '0.00'}
              </div>
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
              <div className={`text-2xl font-bold ${
                (portfolio?.unrealizedPnl || totalUnrealizedPnl) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${(portfolio?.unrealizedPnl || totalUnrealizedPnl).toFixed(2)}
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
              <div className={`text-2xl font-bold ${
                (portfolio?.realizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${portfolio ? portfolio.realizedPnl.toFixed(2) : '0.00'}
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
            {positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active positions
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position: any) => (
                  <div key={position._id} className="flex items-center justify-between p-4 border rounded-lg">
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
            )}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent trades
              </div>
            ) : (
              <div className="space-y-3">
                {trades.map((trade: any) => (
                  <div key={trade._id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{trade.market}</h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className={trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                          {trade.type.toUpperCase()}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}