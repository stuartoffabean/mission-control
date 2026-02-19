import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    assignee: v.union(v.literal("Stuart"), v.literal("Micky")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(), // cron expression or human readable
    description: v.string(),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("error")),
  }),
  
  memories: defineTable({
    title: v.string(),
    content: v.string(), // markdown
    tags: v.array(v.string()),
    priority: v.union(v.literal("🔴"), v.literal("🟡"), v.literal("🟢")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).searchIndex("search_content", {
    searchField: "content",
  }),
  
  positions: defineTable({
    market: v.string(),
    side: v.union(v.literal("yes"), v.literal("no")),
    shares: v.number(),
    entryPrice: v.number(),
    currentPrice: v.number(),
    unrealizedPnl: v.number(),
    isActive: v.boolean(),
  }),
  
  trades: defineTable({
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
    currentPrice: v.optional(v.number()),
    tokenId: v.optional(v.string()),
    timestamp: v.number(),
  }),
  
  portfolioSnapshots: defineTable({
    timestamp: v.number(),
    totalValue: v.number(),
    cashBalance: v.number(),
    unrealizedPnl: v.number(),
    realizedPnl: v.number(),
    mode: v.optional(v.union(v.literal("live"), v.literal("paper"))),
  }),
  
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    description: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    avatar: v.string(), // emoji or image url
    lastActive: v.number(),
    tasksCompleted: v.number(),
  }),
});