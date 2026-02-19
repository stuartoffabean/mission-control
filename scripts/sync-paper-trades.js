#!/usr/bin/env node
// Sync paper trades from weather-v2 + directional into Convex
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
const fs = require("fs");

const client = new ConvexHttpClient("https://gallant-cormorant-222.convex.cloud");
const MIN_PRICE = 0.02; // Skip dust trades

async function main() {
  // First: clear all existing trades (they were synced from recommendations, not real paperTrades)
  const clearExisting = process.argv.includes("--reset");

  // --- Weather paper trades (from root paperTrades array) ---
  const weatherPath = "/data/workspace/polymarket-bot/weather-v2-paper.json";
  let weatherCount = 0;
  if (fs.existsSync(weatherPath)) {
    const data = JSON.parse(fs.readFileSync(weatherPath, "utf8"));
    const paperTrades = data.paperTrades || [];
    
    for (const t of paperTrades) {
      const price = t.entryPrice || t.gammaMid || 0;
      if (price < MIN_PRICE) continue; // skip dust
      
      const shares = t.shares || (t.totalCost ? Math.floor(t.totalCost / Math.max(price, 0.001)) : 0);
      if (shares <= 0) continue;

      await client.mutation(api.trading.addTrade, {
        market: t.question || `${t.city} ${t.bucket}${t.unit} ${t.date}`,
        side: (t.action === "BUY_YES" ? "yes" : "no"),
        shares,
        price,
        amount: t.totalCost || shares * price,
        type: "buy",
        mode: "paper",
        strategy: "weather-v2",
        result: t.resolution === "WIN" ? "win" : t.resolution === "LOSS" ? "loss" : "pending",
        pnl: t.resolution === "WIN" ? (t.totalCost ? (t.totalCost / price) - t.totalCost : undefined) : t.resolution === "LOSS" ? -(t.totalCost || 0) : undefined,
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

      await client.mutation(api.trading.addTrade, {
        market: t.question || "Unknown",
        side: t.action === "BUY_YES" ? "yes" : "no",
        shares: t.shares || Math.floor((t.totalCost || 10) / Math.max(price, 0.001)),
        price,
        amount: t.totalCost || 10,
        type: "buy",
        mode: "paper",
        strategy: "directional",
        result: t.resolved ? (t.won ? "win" : "loss") : "pending",
        pnl: t.dollarPnl || undefined,
      });
      dirCount++;
    }
  }

  console.log(JSON.stringify({ ok: true, weather: weatherCount, directional: dirCount }));
}

main().catch(console.error);
