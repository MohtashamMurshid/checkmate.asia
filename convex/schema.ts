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
  }),
});

