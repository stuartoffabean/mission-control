import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// POST /api/sync — accepts full state sync from Stuart
// Body: { crons?: [...], portfolio?: {...}, trades?: [...], agents?: [...], memories?: [...] }
http.route({
  path: "/api/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const results: Record<string, any> = {};

    // Sync crons
    if (body.crons) {
      for (const cron of body.crons) {
        await ctx.runMutation(api.cronJobs.upsert, {
          name: cron.name,
          schedule: cron.schedule || "",
          description: cron.description || "",
          status: cron.status || "active",
          lastRun: cron.lastRun,
          nextRun: cron.nextRun,
        });
      }
      results.crons = body.crons.length;
    }

    // Sync portfolio snapshot
    if (body.portfolio) {
      await ctx.runMutation(api.trading.addSnapshot, {
        totalValue: body.portfolio.totalValue || 0,
        cashBalance: body.portfolio.cashBalance || 0,
        unrealizedPnl: body.portfolio.unrealizedPnl || 0,
        realizedPnl: body.portfolio.realizedPnl || 0,
      });
      results.portfolio = true;
    }

    // Sync agent statuses
    if (body.agents) {
      for (const agent of body.agents) {
        await ctx.runMutation(api.agents.updateByName, {
          name: agent.name,
          status: agent.status || "idle",
          lastActive: agent.lastActive || Date.now(),
        });
      }
      results.agents = body.agents.length;
    }

    return new Response(JSON.stringify({ ok: true, synced: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// GET /api/health
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
