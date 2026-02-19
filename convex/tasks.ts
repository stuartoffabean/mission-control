import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assignee: v.union(v.literal("Stuart"), v.literal("Micky")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignee: args.assignee,
      priority: args.priority,
      status: "backlog",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return task;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });
  },
});