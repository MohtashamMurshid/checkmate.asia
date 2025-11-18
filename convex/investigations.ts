import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    userQuery: v.string(),
    userSourceContent: v.optional(v.string()),
    results: v.any(),
    graphData: v.optional(v.any()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("investigations", {
      userQuery: args.userQuery,
      userSourceContent: args.userSourceContent,
      results: args.results,
      graphData: args.graphData,
      timestamp: args.timestamp,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("investigations").order("desc").take(10);
  },
});

