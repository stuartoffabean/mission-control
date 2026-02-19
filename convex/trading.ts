import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPositions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("positions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getTrades = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trades")
      .order("desc")
      .take(50);
  },
});

export const getPortfolio = query({
  args: {},
  handler: async (ctx) => {
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
    // Check if position already exists
    const existingPosition = await ctx.db.query("positions")
      .filter((q) => q.and(
        q.eq(q.field("market"), args.market),
        q.eq(q.field("side"), args.side)
      ))
      .first();

    if (existingPosition) {
      // Update existing position
      await ctx.db.patch(existingPosition._id, {
        shares: args.shares,
        entryPrice: args.entryPrice,
        currentPrice: args.currentPrice,
        unrealizedPnl: args.unrealizedPnl,
        isActive: args.isActive,
      });
      return existingPosition._id;
    } else {
      // Create new position
      return await ctx.db.insert("positions", args);
    }
  },
});

export const addTrade = mutation({
  args: {
    market: v.string(),
    side: v.union(v.literal("yes"), v.literal("no")),
    shares: v.number(),
    price: v.number(),
    amount: v.number(),
    type: v.union(v.literal("buy"), v.literal("sell")),
  },
  handler: async (ctx, args) => {
    const trade = await ctx.db.insert("trades", {
      ...args,
      timestamp: Date.now(),
    });
    return trade;
  },
});

export const addSnapshot = mutation({
  args: {
    totalValue: v.number(),
    cashBalance: v.number(),
    unrealizedPnl: v.number(),
    realizedPnl: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.insert("portfolioSnapshots", {
      ...args,
      timestamp: Date.now(),
    });
    return snapshot;
  },
});