import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// SIGNALS
// ============================================

export const createSignal = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    category: v.union(
      v.literal("geopolitical"),
      v.literal("economic"),
      v.literal("regulatory"),
      v.literal("supply_chain"),
      v.literal("climate"),
      v.literal("market"),
      v.literal("operational")
    ),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    companyIds: v.array(v.id("portfolioCompanies")),
    relevanceReason: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("signals", {
      ...args,
      isBookmarked: false,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    // Update signal counts for affected companies
    for (const companyId of args.companyIds) {
      const company = await ctx.db.get(companyId);
      if (company) {
        await ctx.db.patch(companyId, {
          activeSignalCount: company.activeSignalCount + 1,
        });
      }
    }

    return id;
  },
});

export const getSignals = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(v.literal("new"), v.literal("tracking"), v.literal("resolved"))
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let q = ctx.db.query("signals");

    if (args.status) {
      q = q.filter((query) => query.eq(query.field("status"), args.status));
    }

    return await q.order("desc").take(limit);
  },
});

export const getSignalById = query({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSignalsByCompany = query({
  args: {
    companyId: v.id("portfolioCompanies"),
  },
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("signals").order("desc").collect();
    return signals.filter((s) => s.companyIds.includes(args.companyId));
  },
});

export const getSignalsByCategory = query({
  args: {
    category: v.union(
      v.literal("geopolitical"),
      v.literal("economic"),
      v.literal("regulatory"),
      v.literal("supply_chain"),
      v.literal("climate"),
      v.literal("market"),
      v.literal("operational")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
  },
});

export const getSignalsBySeverity = query({
  args: {
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_severity", (q) => q.eq("severity", args.severity))
      .order("desc")
      .collect();
  },
});

export const getBookmarkedSignals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_isBookmarked", (q) => q.eq("isBookmarked", true))
      .order("desc")
      .collect();
  },
});

export const getNewSignals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .order("desc")
      .collect();
  },
});

export const getCriticalSignals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_severity", (q) => q.eq("severity", "critical"))
      .order("desc")
      .collect();
  },
});

// ============================================
// SIGNAL ACTIONS
// ============================================

export const toggleBookmark = mutation({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.id);
    if (!signal) throw new Error("Signal not found");

    await ctx.db.patch(args.id, {
      isBookmarked: !signal.isBookmarked,
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("signals"),
    status: v.union(v.literal("new"), v.literal("tracking"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const markAsTracking = mutation({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "tracking",
      isBookmarked: true,
      updatedAt: Date.now(),
    });
  },
});

export const resolveSignal = mutation({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.id);
    if (!signal) throw new Error("Signal not found");

    await ctx.db.patch(args.id, {
      status: "resolved",
      updatedAt: Date.now(),
    });

    // Decrement signal counts for affected companies
    for (const companyId of signal.companyIds) {
      const company = await ctx.db.get(companyId);
      if (company && company.activeSignalCount > 0) {
        await ctx.db.patch(companyId, {
          activeSignalCount: company.activeSignalCount - 1,
        });
      }
    }
  },
});

// ============================================
// SIGNAL STATS
// ============================================

export const getSignalStats = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect();

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const signal of signals) {
      byCategory[signal.category] = (byCategory[signal.category] || 0) + 1;
      bySeverity[signal.severity] = (bySeverity[signal.severity] || 0) + 1;
      byStatus[signal.status] = (byStatus[signal.status] || 0) + 1;
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const last24h = signals.filter((s) => s.createdAt > oneDayAgo).length;
    const lastWeek = signals.filter((s) => s.createdAt > oneWeekAgo).length;

    return {
      total: signals.length,
      byCategory,
      bySeverity,
      byStatus,
      last24h,
      lastWeek,
    };
  },
});
