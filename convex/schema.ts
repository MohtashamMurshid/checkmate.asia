import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    useCase: v.string(),
    message: v.optional(v.string()),
    submittedAt: v.number(),
  }),
  investigations: defineTable({
    userQuery: v.string(),
    userSourceContent: v.optional(v.string()),
    results: v.any(), // JSON object
    graphData: v.optional(v.any()), // JSON object for graph
    timestamp: v.number(),
  }),
  datasetAnalyses: defineTable({
    fileName: v.string(),
    fileType: v.string(), // 'csv' | 'jsonl'
    rowCount: v.number(),
    textColumn: v.string(),
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
    results: v.any(), // Array of row results
    stats: v.any(), // Aggregated statistics
    timestamp: v.number(),
    // Metrics fields for tracking pipeline performance
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
  }),
  // Cache table for storing analysis results by content hash
  analysisCache: defineTable({
    hash: v.string(), // SHA-256 hash of cleaned text
    options: v.object({
      checkBias: v.boolean(),
      checkSentiment: v.boolean(),
      checkFacts: v.boolean(),
    }),
    result: v.any(), // Full analysis result
    riskScore: v.number(),
    routingDecision: v.object({
      agentsNeeded: v.array(v.string()),
      confidence: v.number(),
    }),
    createdAt: v.number(),
    lastAccessedAt: v.number(),
    accessCount: v.number(),
  }).index("by_hash", ["hash"]),
});

