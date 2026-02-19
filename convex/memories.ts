import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories")
      .order("desc")
      .collect();
  },
});

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Enable search index after running `npx convex dev`
    // For now, use basic filtering
    const memories = await ctx.db.query("memories").collect();
    const query = args.query.toLowerCase();
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(query) ||
      memory.content.toLowerCase().includes(query) ||
      memory.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    priority: v.union(v.literal("🔴"), v.literal("🟡"), v.literal("🟢")),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.insert("memories", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      priority: args.priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return memory;
  },
});

export const update = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("🔴"), v.literal("🟡"), v.literal("🟢"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(validUpdates).length > 0) {
      await ctx.db.patch(id, {
        ...validUpdates,
        updatedAt: Date.now(),
      });
    }
  },
});

export const remove = mutation({
  args: {
    id: v.id("memories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});