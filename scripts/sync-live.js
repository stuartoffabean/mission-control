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

// Sync paper trades from weather + directional scanners
async function syncPaperTrades() {
  let synced = 0;

  // Weather paper trades
  const weatherPath = "/data/workspace/polymarket-bot/weather-v2-paper.json";
  if (fs.existsSync(weatherPath)) {
    const data = JSON.parse(fs.readFileSync(weatherPath, "utf8"));
    // Get existing trade count to avoid duplicates
    const existing = await client.query(api.trading.getTrades);
    const existingCount = existing?.length || 0;

    let newTrades = [];
    for (const run of data.runs || []) {
      for (const rec of run.recommendations || []) {
        if (!rec.action?.startsWith("BUY")) continue;
        newTrades.push({
          market: rec.question || `${rec.city} ${rec.date} ${rec.bucket}${rec.unit}`,
          side: rec.action === "BUY_YES" ? "yes" : "no",
          shares: Math.floor(10 / Math.max(rec.marketPrice || 0.5, 0.001)),
          price: rec.marketPrice || 0,
          amount: 10,
          type: "buy",
        });
      }
    }

    // Only sync new trades (skip already synced)
    const toSync = newTrades.slice(existingCount);
    for (const trade of toSync) {
      await client.mutation(api.trading.addTrade, trade);
      synced++;
    }
  }

  // Directional paper trades
  const dirPath = "/data/workspace/polymarket-bot/directional-paper.json";
  if (fs.existsSync(dirPath)) {
    const data = JSON.parse(fs.readFileSync(dirPath, "utf8"));
    const paperTrades = data.paperTrades || [];
    for (const t of paperTrades) {
      if (!t._synced) {
        await client.mutation(api.trading.addTrade, {
          market: t.question || "Unknown",
          side: t.action === "BUY_YES" ? "yes" : t.action === "BUY_NO" ? "no" : "yes",
          shares: t.shares || Math.floor((t.totalCost || 10) / Math.max(t.entryPrice || 0.5, 0.001)),
          price: t.entryPrice || 0,
          amount: t.totalCost || 10,
          type: "buy",
        });
        t._synced = true;
        synced++;
      }
    }
    // Mark synced
    if (synced > 0) {
      fs.writeFileSync(dirPath, JSON.stringify(data, null, 2));
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
