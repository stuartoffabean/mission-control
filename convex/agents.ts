import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastActive: Date.now(),
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if agents already exist
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length > 0) {
      return { message: "Agents already seeded", count: existingAgents.length };
    }

    const initialAgents = [
      {
        name: "Stuart",
        role: "Main AI",
        avatar: "🤖",
        description: "Primary assistant — trading, research, infrastructure",
        status: "idle" as const,
        lastActive: Date.now(),
        tasksCompleted: 0,
      },
      {
        name: "Builder",
        role: "Sub-agent",
        avatar: "🔨",
        description: "Builds features, deploys code, scaffolds projects",
        status: "idle" as const,
        lastActive: Date.now(),
        tasksCompleted: 0,
      },
      {
        name: "Scanner",
        role: "Sub-agent",
        avatar: "📡",
        description: "Monitors markets, runs directional + weather scanners",
        status: "working" as const,
        lastActive: Date.now(),
        tasksCompleted: 42,
      },
      {
        name: "Research",
        role: "Sub-agent",
        avatar: "🔬",
        description: "Deep research on markets, strategies, competitive intel",
        status: "idle" as const,
        lastActive: Date.now() - 3600000, // 1 hour ago
        tasksCompleted: 15,
      },
      {
        name: "Nightwatch",
        role: "Sub-agent",
        avatar: "🌙",
        description: "Overnight monitoring, portfolio checks, alerts",
        status: "offline" as const,
        lastActive: Date.now() - 28800000, // 8 hours ago
        tasksCompleted: 8,
      },
    ];

    const insertedAgents = await Promise.all(
      initialAgents.map((agent) => ctx.db.insert("agents", agent))
    );

    return { message: "Agents seeded successfully", count: insertedAgents.length };
  },
});