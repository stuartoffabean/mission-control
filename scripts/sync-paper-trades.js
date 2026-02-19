#!/usr/bin/env node
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
const fs = require("fs");

const client = new ConvexHttpClient("https://gallant-cormorant-222.convex.cloud");
const MIN_PRICE = 0.02;

async function main() {
  // --- Weather paper trades ---
  const weatherPath = "/data/workspace/polymarket-bot/weather-v2-paper.json";
  let weatherCount = 0;
  if (fs.existsSync(weatherPath)) {
    const data = JSON.parse(fs.readFileSync(weatherPath, "utf8"));
    const paperTrades = data.paperTrades || [];
    
    for (const t of paperTrades) {
      // Paper trades use gammaMid or marketPrice as entry reference
      // For BUY_NO, actual entry = 1 - marketPrice (we're buying the NO side)
      let rawPrice = t.entryPrice || t.gammaMid || t.marketPrice || 0;
      const price = t.action === "BUY_NO" ? (1 - rawPrice) : rawPrice;
      if (price < MIN_PRICE) continue;
      
      const shares = t.shares || (t.totalCost ? Math.floor(t.totalCost / Math.max(price, 0.001)) : Math.floor(10 / Math.max(price, 0.001)));
      if (shares <= 0) continue;
      const totalCost = t.totalCost || shares * price;

      // Resolution
      let result = "pending";
      let pnl = undefined;
      if (t.resolution === "WIN") {
        result = "win";
        // Win = shares * $1 payout - cost
        pnl = Math.round((shares * 1.0 - totalCost) * 100) / 100;
      } else if (t.resolution === "LOSS") {
        result = "loss";
        pnl = -Math.round(totalCost * 100) / 100;
      }

      const tokenId = t.action === "BUY_YES" ? t.yesToken : t.noToken;
      const market = t.question || `${t.city} ${t.bucket}${t.unit} ${t.date}`;

      await client.mutation(api.trading.addTrade, {
        market,
        side: t.action === "BUY_YES" ? "yes" : "no",
        shares,
        price,
        amount: Math.round(totalCost * 100) / 100,
        type: "buy",
        mode: "paper",
        strategy: "weather-v2",
        result,
        pnl,
      });
      weatherCount++;
    }
  }

  // --- Directional paper trades ---
  const dirPath = "/data/workspace/polymarket-bot/directional-paper.json";
  let dirCount = 0;
  if (fs.existsSync(dirPath)) {
    const data = JSON.parse(fs.readFileSync(dirPath, "utf8"));
    for (const t of data.paperTrades || []) {
      const price = t.entryPrice || 0;
      if (price < MIN_PRICE) continue;

      let result = "pending";
      let pnl = undefined;
      if (t.dollarPnl != null) {
        result = t.dollarPnl >= 0 ? "win" : "loss";
        pnl = t.dollarPnl;
      }

      await client.mutation(api.trading.addTrade, {
        market: t.question || "Unknown",
        side: t.action === "BUY_YES" ? "yes" : "no",
        shares: t.shares || Math.floor((t.totalCost || 30) / Math.max(price, 0.001)),
        price,
        amount: t.totalCost || 30,
        type: "buy",
        mode: "paper",
        strategy: "directional",
        result,
        pnl,
      });
      dirCount++;
    }
  }

  console.log(JSON.stringify({ ok: true, weather: weatherCount, directional: dirCount }));
}

main().catch(console.error);
