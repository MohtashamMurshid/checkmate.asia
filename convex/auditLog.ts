import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// AUDIT LOG
// ============================================

export const logAction = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.any(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("nprewsAuditLog", {
      ...args,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const getAuditLog = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("nprewsAuditLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getAuditLogForEntity = query({
  args: {
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nprewsAuditLog")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .order("desc")
      .collect();
  },
});

export const getAuditLogByType = query({
  args: {
    entityType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("nprewsAuditLog")
      .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType))
      .order("desc")
      .take(limit);
  },
});

export const getRecentActions = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours ?? 24;
    const cutoff = Date.now() - hours * 60 * 60 * 1000;

    return await ctx.db
      .query("nprewsAuditLog")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoff))
      .order("desc")
      .collect();
  },
});
