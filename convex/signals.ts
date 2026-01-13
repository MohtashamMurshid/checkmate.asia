import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// NARRATIVE SIGNALS
// ============================================

export const createNarrativeSignal = mutation({
  args: {
    agentName: v.string(),
    hypothesis: v.string(),
    confidence: v.number(),
    frame: v.string(),
    frameType: v.union(
      v.literal("emergence"),
      v.literal("reframing"),
      v.literal("responsibility"),
      v.literal("solution")
    ),
    previousFrame: v.optional(v.string()),
    sectors: v.array(v.string()),
    riskTypes: v.array(v.string()),
    nationalPriorities: v.array(v.string()),
    evidence: v.array(
      v.object({
        source: v.string(),
        quote: v.string(),
        url: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
        sourceType: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("narrativeSignals", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getNarrativeSignals = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("narrativeSignals")
      .order("desc")
      .take(limit);
  },
});

export const getNarrativeSignalsBySector = query({
  args: {
    sector: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("narrativeSignals")
      .filter((q) => q.eq(q.field("sectors"), [args.sector]))
      .order("desc")
      .collect();
  },
});

export const getNarrativeSignalById = query({
  args: {
    id: v.id("narrativeSignals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ============================================
// ACTOR SIGNALS
// ============================================

export const createActorSignal = mutation({
  args: {
    agentName: v.string(),
    hypothesis: v.string(),
    confidence: v.number(),
    actors: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        role: v.string(),
        legitimacyScore: v.number(),
        quote: v.optional(v.string()),
      })
    ),
    legitimacyTransfer: v.optional(
      v.object({
        from: v.string(),
        to: v.string(),
        narrative: v.string(),
      })
    ),
    evidence: v.array(
      v.object({
        source: v.string(),
        quote: v.string(),
        url: v.optional(v.string()),
        sourceType: v.string(),
      })
    ),
    narrativeSignalId: v.optional(v.id("narrativeSignals")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("actorSignals", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getActorSignals = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("actorSignals")
      .order("desc")
      .take(limit);
  },
});

export const getActorSignalsWithLegitimacyTransfer = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db
      .query("actorSignals")
      .order("desc")
      .collect();
    return signals.filter((s) => s.legitimacyTransfer !== undefined);
  },
});

// ============================================
// CLUSTER SIGNALS
// ============================================

export const createNarrativeCluster = mutation({
  args: {
    agentName: v.string(),
    hypothesis: v.string(),
    confidence: v.number(),
    coreThesis: v.string(),
    supportingArguments: v.array(v.string()),
    counterArguments: v.array(v.string()),
    moralFraming: v.string(),
    narrativeSignalIds: v.array(v.id("narrativeSignals")),
    clusterSize: v.number(),
    centroidEmbedding: v.optional(v.array(v.number())),
    evidence: v.array(
      v.object({
        source: v.string(),
        quote: v.string(),
        sourceType: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("narrativeClusters", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    // Update narrative signals with cluster ID
    for (const signalId of args.narrativeSignalIds) {
      await ctx.db.patch(signalId, { clusterId: id });
    }

    return id;
  },
});

export const getNarrativeClusters = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("narrativeClusters")
      .order("desc")
      .take(limit);
  },
});

export const addToCluster = mutation({
  args: {
    clusterId: v.id("narrativeClusters"),
    narrativeSignalId: v.id("narrativeSignals"),
  },
  handler: async (ctx, args) => {
    const cluster = await ctx.db.get(args.clusterId);
    if (!cluster) throw new Error("Cluster not found");

    const updatedIds = [...cluster.narrativeSignalIds, args.narrativeSignalId];
    await ctx.db.patch(args.clusterId, {
      narrativeSignalIds: updatedIds,
      clusterSize: updatedIds.length,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.narrativeSignalId, { clusterId: args.clusterId });
  },
});
