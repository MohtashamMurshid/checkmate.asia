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

  // ============================================
  // NPREWS - Narrative & Policy Regime Early-Warning System
  // ============================================

  // Narrative signals from NarrativeAgent (Module 5.1)
  narrativeSignals: defineTable({
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
    createdAt: v.number(),
    clusterId: v.optional(v.id("narrativeClusters")),
  })
    .index("by_sector", ["sectors"])
    .index("by_frameType", ["frameType"])
    .index("by_createdAt", ["createdAt"]),

  // Actor signals from ActorLegitimacyAgent (Module 5.3)
  actorSignals: defineTable({
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
    createdAt: v.number(),
    narrativeSignalId: v.optional(v.id("narrativeSignals")),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_hasLegitimacyTransfer", ["legitimacyTransfer"]),

  // Cluster signals from ClusterAgent (Module 5.2)
  narrativeClusters: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_clusterSize", ["clusterSize"]),

  // Narrative Briefs - main output from SynthesizerAgent
  narrativeBriefs: defineTable({
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
    reviewStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("dismissed"),
      v.literal("escalated")
    ),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_regimeBand", ["regimeBand"])
    .index("by_reviewStatus", ["reviewStatus"])
    .index("by_createdAt", ["createdAt"])
    .index("by_recommendedAction", ["recommendedAction"]),

  // Known actors database for legitimacy scoring
  knownActors: defineTable({
    name: v.string(),
    category: v.string(),
    institutionalAuthority: v.number(),
    policyInfluence: v.number(),
    mediaCredibility: v.number(),
    legitimacyScore: v.number(),
    narrativeSignalIds: v.array(v.id("narrativeSignals")),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_legitimacyScore", ["legitimacyScore"]),

  // Audit log for traceability
  nprewsAuditLog: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.any(),
    userId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_entityType", ["entityType"])
    .index("by_entityId", ["entityId"])
    .index("by_timestamp", ["timestamp"]),
});

