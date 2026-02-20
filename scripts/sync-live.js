#!/usr/bin/env node
// Syncs live OpenClaw state → Convex Mission Control
// Run via cron or after each scanner run
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
const fs = require("fs");

const CONVEX_URL = "https://gallant-cormorant-222.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Parse OpenClaw cron data from stdin or file
async function syncCrons(cronJobs) {
  let synced = 0;
  for (const job of cronJobs) {
    const state = job.state || {};
    await client.mutation(api.cronJobs.upsert, {
      name: job.name,
      schedule: job.schedule?.expr || job.schedule?.kind || "",
      description: job.payload?.message?.slice(0, 100) || "",
      status: !job.enabled ? "paused" : state.consecutiveErrors > 0 ? "error" : "active",
      lastRun: state.lastRunAtMs || undefined,
      nextRun: state.nextRunAtMs || undefined,
    });
    synced++;
  }
  return synced;
}

// Generate a stable trade ID from trade data (for dedup)
function tradeId(t) {
  const key = `${t.city || t.market || ""}|${t.date || ""}|${t.bucket || ""}|${t.action || t.side || ""}|${t.timestamp || t.entryTime || ""}|${t.entryPrice || t.price || 0}`;
  // Simple hash
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  return `trade_${Math.abs(h).toString(36)}`;
}

// Sync paper trades from weather + directional scanners
async function syncPaperTrades() {
  let synced = 0;

  // Get ALL existing trades from Convex for ID-based dedup
  const existing = await client.query(api.trading.getTrades);
  const existingIds = new Set((existing || []).map(t => t.externalId).filter(Boolean));

  // Weather paper trades
  const weatherPath = "/data/workspace/polymarket-bot/weather-v2-paper.json";
  if (fs.existsSync(weatherPath)) {
    const data = JSON.parse(fs.readFileSync(weatherPath, "utf8"));
    // Support both formats: paperTrades[] (new) and runs[].recommendations[] (old)
    let trades = [];
    if (data.paperTrades) {
      trades = data.paperTrades;
    } else if (data.runs) {
      for (const run of data.runs) {
        for (const rec of run.recommendations || []) {
          if (rec.action?.startsWith("BUY")) trades.push(rec);
        }
      }
    }

    for (const t of trades) {
      const id = tradeId(t);
      if (existingIds.has(id)) continue; // Already in Convex — skip
      await client.mutation(api.trading.addTrade, {
        externalId: id,
        market: t.question || `${t.city} ${t.date} ${t.bucket}${t.unit}`,
        side: (t.action === "BUY_YES" || t.side === "yes") ? "yes" : "no",
        shares: t.shares || Math.floor((t.paperTradeSize || t.totalCost || 10) / Math.max(t.entryPrice || t.marketPrice || 0.5, 0.001)),
        price: t.entryPrice || t.marketPrice || 0,
        amount: t.paperTradeSize || t.totalCost || 10,
        type: "buy",
      });
      existingIds.add(id);
      synced++;
    }
  }

  // Directional paper trades
  const dirPath = "/data/workspace/polymarket-bot/directional-paper.json";
  if (fs.existsSync(dirPath)) {
    const data = JSON.parse(fs.readFileSync(dirPath, "utf8"));
    const paperTrades = data.paperTrades || [];
    for (const t of paperTrades) {
      const id = tradeId(t);
      if (existingIds.has(id)) continue; // Already in Convex — skip
      await client.mutation(api.trading.addTrade, {
        externalId: id,
        market: t.question || "Unknown",
        side: t.action === "BUY_YES" ? "yes" : t.action === "BUY_NO" ? "no" : "yes",
        shares: t.shares || Math.floor((t.totalCost || 10) / Math.max(t.entryPrice || 0.5, 0.001)),
        price: t.entryPrice || 0,
        amount: t.totalCost || 10,
        type: "buy",
      });
      existingIds.add(id);
      synced++;
    }
  }

  return synced;
}

// Sync wallet/portfolio
async function syncPortfolio() {
  // Try to read from TRADING-STATE.json
  const statePath = "/data/workspace/polymarket-bot/TRADING-STATE.json";
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    await client.mutation(api.trading.addSnapshot, {
      totalValue: state.totalValue || state.cashBalance || 325.40,
      cashBalance: state.cashBalance || 325.40,
      unrealizedPnl: state.unrealizedPnl || 0,
      realizedPnl: state.realizedPnl || -123.18,
    });
    return true;
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const results = {};

  // If cron data is passed as argument (JSON file path)
  if (args.includes("--crons")) {
    const idx = args.indexOf("--crons");
    const cronFile = args[idx + 1];
    if (cronFile && fs.existsSync(cronFile)) {
      const cronData = JSON.parse(fs.readFileSync(cronFile, "utf8"));
      results.crons = await syncCrons(cronData.jobs || cronData);
    }
  }

  // If --stdin, read cron JSON from stdin
  if (args.includes("--stdin")) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const cronData = JSON.parse(Buffer.concat(chunks).toString());
    results.crons = await syncCrons(cronData.jobs || cronData);
  }

  if (args.includes("--trades") || args.includes("--all")) {
    results.trades = await syncPaperTrades();
  }

  if (args.includes("--portfolio") || args.includes("--all")) {
    results.portfolio = await syncPortfolio();
  }

  if (args.includes("--all")) {
    // Also sync agents based on subagent activity
    // Stuart is always working if this script is running
    await client.mutation(api.agents.updateByName, {
      name: "Stuart",
      status: "working",
      lastActive: Date.now(),
    });
    await client.mutation(api.agents.updateByName, {
      name: "Scanner",
      status: "working",
      lastActive: Date.now(),
    });
    results.agents = true;
  }

  console.log(JSON.stringify({ ok: true, ...results }));
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
