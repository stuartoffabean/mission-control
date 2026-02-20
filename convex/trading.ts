import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPositions = query({
  args: { mode: v.optional(v.union(v.literal("live"), v.literal("paper"))) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("positions").filter((q) => q.eq(q.field("isActive"), true));
    return await q.collect();
  },
});

export const getTrades = query({
  args: { mode: v.optional(v.union(v.literal("live"), v.literal("paper"))) },
  handler: async (ctx, args) => {
    if (args.mode) {
      return await ctx.db.query("trades")
        .filter((q) => q.eq(q.field("mode"), args.mode))
        .order("desc")
        .take(500);
    }
    return await ctx.db.query("trades")
      .order("desc")
      .take(500);
  },
});

export const getTradeStats = query({
  args: { mode: v.union(v.literal("live"), v.literal("paper")) },
  handler: async (ctx, args) => {
    const trades = await ctx.db.query("trades")
      .filter((q) => q.eq(q.field("mode"), args.mode))
      .collect();
    
    const buys = trades.filter(t => t.type === "buy");
    const wins = trades.filter(t => t.result === "win");
    const losses = trades.filter(t => t.result === "loss");
    const pending = trades.filter(t => !t.result || t.result === "pending");
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalInvested = buys.reduce((sum, t) => sum + t.amount, 0);

    // Group by strategy
    const byStrategy: Record<string, { count: number; pnl: number; wins: number; losses: number }> = {};
    for (const t of trades) {
      const s = t.strategy || "unknown";
      if (!byStrategy[s]) byStrategy[s] = { count: 0, pnl: 0, wins: 0, losses: 0 };
      byStrategy[s].count++;
      byStrategy[s].pnl += t.pnl || 0;
      if (t.result === "win") byStrategy[s].wins++;
      if (t.result === "loss") byStrategy[s].losses++;
    }

    return {
      total: trades.length,
      buys: buys.length,
      wins: wins.length,
      losses: losses.length,
      pending: pending.length,
      winRate: wins.length + losses.length > 0 
        ? (wins.length / (wins.length + losses.length) * 100).toFixed(1) 
        : "N/A",
      totalPnl,
      totalInvested,
      byStrategy,
    };
  },
});

export const getPortfolio = query({
  args: { mode: v.optional(v.union(v.literal("live"), v.literal("paper"))) },
  handler: async (ctx, args) => {
    if (args.mode) {
      // Get latest snapshot for this mode
      const snapshots = await ctx.db.query("portfolioSnapshots")
        .filter((q) => q.eq(q.field("mode"), args.mode))
        .order("desc")
        .first();
      return snapshots;
    }
    return await ctx.db.query("portfolioSnapshots")
      .order("desc")
      .first();
  },
});

export const upsertPosition = mutation({
  args: {
    market: v.string(),
    side: v.union(v.literal("yes"), v.literal("no")),
    shares: v.number(),
    entryPrice: v.number(),
    currentPrice: v.number(),
    unrealizedPnl: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingPosition = await ctx.db.query("positions")
      .filter((q) => q.and(
        q.eq(q.field("market"), args.market),
        q.eq(q.field("side"), args.side)
      ))
      .first();

    if (existingPosition) {
      await ctx.db.patch(existingPosition._id, {
        shares: args.shares,
        entryPrice: args.entryPrice,
        currentPrice: args.currentPrice,
        unrealizedPnl: args.unrealizedPnl,
        isActive: args.isActive,
      });
      return existingPosition._id;
    } else {
      return await ctx.db.insert("positions", args);
    }
  },
});

export const addTrade = mutation({
  args: {
    externalId: v.optional(v.string()),
    market: v.string(),
    side: v.union(v.literal("yes"), v.literal("no")),
    shares: v.number(),
    price: v.number(),
    amount: v.number(),
    type: v.union(v.literal("buy"), v.literal("sell")),
    mode: v.optional(v.union(v.literal("live"), v.literal("paper"))),
    strategy: v.optional(v.string()),
    result: v.optional(v.union(v.literal("win"), v.literal("loss"), v.literal("pending"))),
    pnl: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // If externalId provided, check for duplicate
    if (args.externalId) {
      const existing = await ctx.db.query("trades")
        .filter((q) => q.eq(q.field("externalId"), args.externalId))
        .first();
      if (existing) return existing._id; // Already exists — skip
    }
    return await ctx.db.insert("trades", {
      ...args,
      mode: args.mode || "paper",
      timestamp: Date.now(),
    });
  },
});

export const updateTradeResult = mutation({
  args: {
    id: v.id("trades"),
    result: v.union(v.literal("win"), v.literal("loss")),
    pnl: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { result: args.result, pnl: args.pnl });
  },
});

export const addSnapshot = mutation({
  args: {
    totalValue: v.number(),
    cashBalance: v.number(),
    unrealizedPnl: v.number(),
    realizedPnl: v.number(),
    mode: v.optional(v.union(v.literal("live"), v.literal("paper"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("portfolioSnapshots", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const backfillMode = mutation({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    let updated = 0;
    for (const t of trades) {
      if (!t.mode) {
        const m = (t.market || "").toLowerCase();
        let strategy = "weather-v2";
        if (m.includes("hawks") || m.includes("pacers") || m.includes("76ers") || m.includes("wizards") || m.includes("vs.")) {
          strategy = "directional";
        }
        await ctx.db.patch(t._id, { mode: "paper", strategy, result: "pending" });
        updated++;
      }
    }
    return { updated, total: trades.length };
  },
});

export const clearAllTrades = mutation({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    for (const t of trades) {
      await ctx.db.delete(t._id);
    }
    return { deleted: trades.length };
  },
});

export const updateTradePrice = mutation({
  args: {
    id: v.id("trades"),
    currentPrice: v.optional(v.number()),
    pnl: v.optional(v.number()),
    result: v.optional(v.union(v.literal("win"), v.literal("loss"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) filtered[k] = v;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const removeTrade = mutation({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
