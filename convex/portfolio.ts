import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// PORTFOLIO COMPANIES
// ============================================

export const createCompany = mutation({
  args: {
    name: v.string(),
    region: v.string(),
    sector: v.string(),
    description: v.string(),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("portfolioCompanies", {
      ...args,
      activeSignalCount: 0,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("portfolioCompanies").collect();
  },
});

export const getCompanyById = query({
  args: {
    id: v.id("portfolioCompanies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCompaniesByRegion = query({
  args: {
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioCompanies")
      .withIndex("by_region", (q) => q.eq("region", args.region))
      .collect();
  },
});

export const updateSignalCount = mutation({
  args: {
    id: v.id("portfolioCompanies"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { activeSignalCount: args.count });
  },
});

export const updateRiskLevel = mutation({
  args: {
    id: v.id("portfolioCompanies"),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { riskLevel: args.riskLevel });
  },
});

// ============================================
// PORTFOLIO STATS
// ============================================

export const getPortfolioStats = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("portfolioCompanies").collect();
    const signals = await ctx.db.query("signals").collect();

    const totalCompanies = companies.length;
    const highRiskCompanies = companies.filter((c) => c.riskLevel === "high").length;
    const totalSignals = signals.length;
    const newSignals = signals.filter((s) => s.status === "new").length;
    const criticalSignals = signals.filter((s) => s.severity === "critical").length;
    const bookmarkedSignals = signals.filter((s) => s.isBookmarked).length;

    const byRegion: Record<string, number> = {};
    for (const company of companies) {
      byRegion[company.region] = (byRegion[company.region] || 0) + 1;
    }

    const bySector: Record<string, number> = {};
    for (const company of companies) {
      bySector[company.sector] = (bySector[company.sector] || 0) + 1;
    }

    return {
      totalCompanies,
      highRiskCompanies,
      totalSignals,
      newSignals,
      criticalSignals,
      bookmarkedSignals,
      byRegion,
      bySector,
    };
  },
});
