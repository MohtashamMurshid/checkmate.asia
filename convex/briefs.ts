import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// NARRATIVE BRIEFS
// ============================================

export const createNarrativeBrief = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    whyItMatters: v.string(),
    sectors: v.array(v.string()),
    riskTypes: v.array(v.string()),
    nationalPriorities: v.array(v.string()),
    regimeBand: v.union(
      v.literal("dormant"),
      v.literal("emerging"),
      v.literal("normalising"),
      v.literal("pre_formal"),
      v.literal("imminent")
    ),
    confidence: v.number(),
    contributingSignalIds: v.array(v.string()),
    actors: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        role: v.string(),
        legitimacyScore: v.number(),
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
    recommendedAction: v.union(
      v.literal("monitor"),
      v.literal("review"),
      v.literal("escalate")
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("narrativeBriefs", {
      ...args,
      reviewStatus: "pending",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getNarrativeBriefs = query({
  args: {
    limit: v.optional(v.number()),
    reviewStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("dismissed"),
        v.literal("escalated")
      )
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let query = ctx.db.query("narrativeBriefs");

    if (args.reviewStatus) {
      query = query.filter((q) =>
        q.eq(q.field("reviewStatus"), args.reviewStatus)
      );
    }

    return await query.order("desc").take(limit);
  },
});

export const getNarrativeBriefById = query({
  args: {
    id: v.id("narrativeBriefs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPendingBriefs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("narrativeBriefs")
      .withIndex("by_reviewStatus", (q) => q.eq("reviewStatus", "pending"))
      .order("desc")
      .collect();
  },
});

export const getBriefsByRegimeBand = query({
  args: {
    regimeBand: v.union(
      v.literal("dormant"),
      v.literal("emerging"),
      v.literal("normalising"),
      v.literal("pre_formal"),
      v.literal("imminent")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("narrativeBriefs")
      .withIndex("by_regimeBand", (q) => q.eq("regimeBand", args.regimeBand))
      .order("desc")
      .collect();
  },
});

export const getBriefsRequiringAction = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("narrativeBriefs")
      .filter((q) =>
        q.and(
          q.eq(q.field("reviewStatus"), "pending"),
          q.or(
            q.eq(q.field("recommendedAction"), "review"),
            q.eq(q.field("recommendedAction"), "escalate")
          )
        )
      )
      .order("desc")
      .collect();
  },
});

export const updateBriefReviewStatus = mutation({
  args: {
    id: v.id("narrativeBriefs"),
    reviewStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("dismissed"),
      v.literal("escalated")
    ),
    reviewedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      reviewStatus: args.reviewStatus,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
    });
  },
});

// ============================================
// DASHBOARD STATISTICS
// ============================================

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const briefs = await ctx.db.query("narrativeBriefs").collect();
    const narrativeSignals = await ctx.db.query("narrativeSignals").collect();
    const actorSignals = await ctx.db.query("actorSignals").collect();

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const briefsThisWeek = briefs.filter((b) => b.createdAt > oneWeekAgo);
    const narrativesThisWeek = narrativeSignals.filter(
      (n) => n.createdAt > oneWeekAgo
    );
    const legitimacyTransfers = actorSignals.filter(
      (a) => a.legitimacyTransfer && a.createdAt > oneWeekAgo
    );

    const pendingReview = briefs.filter(
      (b) => b.reviewStatus === "pending"
    ).length;
    const requiresEscalation = briefs.filter(
      (b) =>
        b.reviewStatus === "pending" && b.recommendedAction === "escalate"
    ).length;

    const byRegimeBand = {
      dormant: briefs.filter((b) => b.regimeBand === "dormant").length,
      emerging: briefs.filter((b) => b.regimeBand === "emerging").length,
      normalising: briefs.filter((b) => b.regimeBand === "normalising").length,
      pre_formal: briefs.filter((b) => b.regimeBand === "pre_formal").length,
      imminent: briefs.filter((b) => b.regimeBand === "imminent").length,
    };

    const bySector: Record<string, number> = {};
    for (const brief of briefs) {
      for (const sector of brief.sectors) {
        bySector[sector] = (bySector[sector] || 0) + 1;
      }
    }

    return {
      totalBriefs: briefs.length,
      briefsThisWeek: briefsThisWeek.length,
      narrativesThisWeek: narrativesThisWeek.length,
      legitimacyTransfersThisWeek: legitimacyTransfers.length,
      pendingReview,
      requiresEscalation,
      byRegimeBand,
      bySector,
    };
  },
});
