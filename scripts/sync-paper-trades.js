#!/usr/bin/env node
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
const fs = require("fs");

const client = new ConvexHttpClient("https://gallant-cormorant-222.convex.cloud");

async function main() {
  const weatherData = JSON.parse(
    fs.readFileSync("/data/workspace/polymarket-bot/weather-v2-paper.json", "utf8")
  );

  let trades = [];
  for (const run of weatherData.runs || []) {
    for (const rec of run.recommendations || []) {
      if (!rec.action?.startsWith("BUY")) continue;
      trades.push({
        market: rec.question || `${rec.city} ${rec.date} ${rec.bucket}${rec.unit}`,
        side: rec.action === "BUY_YES" ? "yes" : "no",
        shares: Math.floor(10 / Math.max(rec.marketPrice || 0.5, 0.001)),
        price: rec.marketPrice || 0,
        amount: 10,
        type: "buy",
      });
    }
  }

  console.log(`Syncing ${trades.length} paper trades...`);

  // Portfolio snapshot
  await client.mutation(api.trading.addSnapshot, {
    totalValue: 325.40,
    cashBalance: 325.40,
    unrealizedPnl: 0,
    realizedPnl: -123.18,
  });
  console.log("Portfolio snapshot added");

  let count = 0;
  for (const trade of trades) {
    try {
      await client.mutation(api.trading.addTrade, trade);
      count++;
      if (count % 20 === 0) console.log(`  ${count}/${trades.length}`);
    } catch (e) {
      console.error(`Failed: ${trade.market.slice(0,40)} — ${e.message.slice(0,80)}`);
    }
  }
  console.log(`Done: ${count}/${trades.length} trades synced`);
}

main().catch(console.error);
