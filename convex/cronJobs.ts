import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cronJobs").collect();
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    schedule: v.string(),
    description: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("error")),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if cron job already exists
    const existingJob = await ctx.db.query("cronJobs")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingJob) {
      // Update existing job
      await ctx.db.patch(existingJob._id, args);
      return existingJob._id;
    } else {
      // Create new job
      return await ctx.db.insert("cronJobs", args);
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("cronJobs"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("error")),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if cron jobs already exist
    const existingJobs = await ctx.db.query("cronJobs").collect();
    if (existingJobs.length > 0) {
      return { message: "Cron jobs already seeded", count: existingJobs.length };
    }

    const initialCronJobs = [
      {
        name: "weather-v2-scanner",
        schedule: "every 2h",
        description: "Weather-based market scanner for weather-related events",
        status: "active" as const,
        lastRun: Date.now() - 1800000, // 30 minutes ago
        nextRun: Date.now() + 5400000, // 1.5 hours from now
      },
      {
        name: "directional-scanner",
        schedule: "every 2h offset 30min",
        description: "Directional market momentum scanner for trending markets",
        status: "active" as const,
        lastRun: Date.now() - 3600000, // 1 hour ago
        nextRun: Date.now() + 3600000, // 1 hour from now
      },
      {
        name: "github-backup",
        schedule: "every 6h",
        description: "Automated backup of repositories and project data",
        status: "active" as const,
        lastRun: Date.now() - 21600000, // 6 hours ago
        nextRun: Date.now() + 0, // Should run soon
      },
    ];

    const insertedJobs = await Promise.all(
      initialCronJobs.map((job) => ctx.db.insert("cronJobs", job))
    );

    return { message: "Cron jobs seeded successfully", count: insertedJobs.length };
  },
});