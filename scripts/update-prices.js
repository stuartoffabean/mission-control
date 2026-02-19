#!/usr/bin/env node
// Fetches current prices for all open paper trades and updates Convex
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
const https = require("https");

const client = new ConvexHttpClient("https://gallant-cormorant-222.convex.cloud");

function fetchPrice(tokenId) {
  return new Promise((resolve) => {
    const url = `https://clob.polymarket.com/price?token_id=${tokenId}&side=buy`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const d = JSON.parse(data);
          resolve(parseFloat(d.price || 0));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

async function main() {
  // Get all paper trades
  const trades = await client.query(api.trading.getTrades, { mode: "paper" });
  const pending = trades.filter((t) => !t.result || t.result === "pending");
  console.log(`${pending.length} pending trades to price-check`);

  if (pending.length === 0) return;

  // We need tokenIds. If trades don't have them, we need to match from paper trade files
  const fs = require("fs");
  const weatherData = JSON.parse(
    fs.readFileSync("/data/workspace/polymarket-bot/weather-v2-paper.json", "utf8")
  );
  const paperTrades = weatherData.paperTrades || [];

  // Build lookup: market name -> tokenId + resolution
  const lookup = {};
  for (const pt of paperTrades) {
    const key = pt.question || `${pt.city} ${pt.bucket}${pt.unit} ${pt.date}`;
    lookup[key] = {
      tokenId: pt.action === "BUY_YES" ? pt.yesToken : pt.noToken,
      resolution: pt.resolution,
      pl: pt.pl,
    };
  }

  let updated = 0;
  let resolved = 0;
  for (const trade of pending) {
    const match = lookup[trade.market];
    if (!match) continue;

    // If resolved in paper log, update result
    if (match.resolution) {
      const won = match.resolution === "WIN";
      const pnl = won ? trade.amount * (1 / trade.price - 1) : -trade.amount;
      await client.mutation(api.trading.updateTradePrice, {
        id: trade._id,
        result: won ? "win" : "loss",
        pnl: Math.round(pnl * 100) / 100,
        currentPrice: won ? 1.0 : 0.0,
      });
      resolved++;
      continue;
    }

    // Fetch live price
    if (match.tokenId) {
      const price = await fetchPrice(match.tokenId);
      if (price != null && price > 0) {
        const unrealizedPnl = (price - trade.price) * trade.shares;
        await client.mutation(api.trading.updateTradePrice, {
          id: trade._id,
          currentPrice: price,
          pnl: Math.round(unrealizedPnl * 100) / 100,
        });
        updated++;
      }
    }

    // Rate limit - don't hammer the CLOB API
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(JSON.stringify({ ok: true, updated, resolved, total: pending.length }));
}

main().catch(console.error);
