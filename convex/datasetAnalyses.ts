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
    metrics: v.optional(v.object({
      routerDecisions: v.object({
        factCheck: v.number(),
        biasCheck: v.number(),
        sentiment: v.number(),
        safe: v.number(),
      }),
      cacheHits: v.number(),
      cacheMisses: v.number(),
      avgRiskScore: v.number(),
      highRiskCount: v.number(),
      processingTimeMs: v.number(),
    })),
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
      metrics: args.metrics,
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

// ============================================
// Analysis Cache Functions
// ============================================

/**
 * Get cached analysis result by content hash
 */
export const getCachedResult = query({
  args: {
    hash: v.string(),
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("analysisCache")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();
    
    if (!cached) return null;
    
    // Check if options match
    if (
      cached.options.checkBias !== args.options.checkBias ||
      cached.options.checkSentiment !== args.options.checkSentiment ||
      cached.options.checkFacts !== args.options.checkFacts
    ) {
      return null;
    }
    
    return cached;
  },
});

/**
 * Get multiple cached results by hashes (batch lookup)
 */
export const getCachedResultsBatch = query({
  args: {
    hashes: v.array(v.string()),
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const results: Record<string, any> = {};
    
    for (const hash of args.hashes) {
      const cached = await ctx.db
        .query("analysisCache")
        .withIndex("by_hash", (q) => q.eq("hash", hash))
        .first();
      
      if (cached &&
          cached.options.checkBias === args.options.checkBias &&
          cached.options.checkSentiment === args.options.checkSentiment &&
          cached.options.checkFacts === args.options.checkFacts
      ) {
        results[hash] = cached;
      }
    }
    
    return results;
  },
});

/**
 * Save analysis result to cache
 */
export const cacheResult = mutation({
  args: {
    hash: v.string(),
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
    result: v.any(),
    riskScore: v.number(),
    routingDecision: v.object({
      agentsNeeded: v.array(v.string()),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if already exists
    const existing = await ctx.db
      .query("analysisCache")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();
    
    if (existing) {
      // Update access time and count
      await ctx.db.patch(existing._id, {
        lastAccessedAt: now,
        accessCount: existing.accessCount + 1,
      });
      return existing._id;
    }
    
    // Insert new cache entry
    const id = await ctx.db.insert("analysisCache", {
      hash: args.hash,
      options: args.options,
      result: args.result,
      riskScore: args.riskScore,
      routingDecision: args.routingDecision,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
    });
    
    return id;
  },
});

/**
 * Update cache access time (for LRU tracking)
 */
export const touchCache = mutation({
  args: { hash: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("analysisCache")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();
    
    if (cached) {
      await ctx.db.patch(cached._id, {
        lastAccessedAt: Date.now(),
        accessCount: cached.accessCount + 1,
      });
    }
  },
});

/**
 * Clear old cache entries (keep last 1000)
 */
export const pruneCache = mutation({
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("analysisCache").collect();
    
    if (allEntries.length <= 1000) return 0;
    
    // Sort by last accessed time, oldest first
    const sorted = allEntries.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
    const toDelete = sorted.slice(0, allEntries.length - 1000);
    
    for (const entry of toDelete) {
      await ctx.db.delete(entry._id);
    }
    
    return toDelete.length;
  },
});

