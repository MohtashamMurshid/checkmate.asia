import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    fileName: v.string(),
    fileType: v.string(),
    rowCount: v.number(),
    textColumn: v.string(),
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
    results: v.any(),
    stats: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("datasetAnalyses", {
      fileName: args.fileName,
      fileType: args.fileType,
      rowCount: args.rowCount,
      textColumn: args.textColumn,
      options: args.options,
      results: args.results,
      stats: args.stats,
      timestamp: args.timestamp,
    });
    return id;
  },
});

export const list = query({
  handler: async (ctx) => {
    const analyses = await ctx.db.query("datasetAnalyses").collect();
    // Sort by timestamp descending (most recent first)
    return analyses
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50); // Limit to 50 most recent
  },
});

export const get = query({
  args: { id: v.id("datasetAnalyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("datasetAnalyses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

