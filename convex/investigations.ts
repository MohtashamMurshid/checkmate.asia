import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const save = mutation({
  args: {
    userQuery: v.string(),
    userSourceContent: v.optional(v.string()),
    results: v.any(),
    graphData: v.optional(v.any()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("investigations", {
      userQuery: args.userQuery,
      userSourceContent: args.userSourceContent,
      results: args.results,
      graphData: args.graphData,
      timestamp: args.timestamp,
    });
    return id;
  },
});

export const list = query({
  handler: async (ctx) => {
    const investigations = await ctx.db.query("investigations").collect();
    // Sort by timestamp descending (most recent first)
    return investigations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
  },
});

export const get = query({
  args: { id: v.id("investigations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

