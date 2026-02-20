import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    summary: v.string(),
    sections: v.array(v.object({
      heading: v.string(),
      bullets: v.array(v.string()),
    })),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    
    return await ctx.db.insert("dailyLogs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .order("desc")
      .take(args.limit ?? 30);
  },
});
