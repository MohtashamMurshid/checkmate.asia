/**
 * Aggregator Utility
 * 
 * Combines outputs from multiple analysis agents into a unified result
 * with a composite Risk Score (0-100).
 * 
 * Risk Score Calculation:
 * - Bias severity: 40% weight
 * - Fact-check failures: 40% weight  
 * - Negative sentiment: 20% weight
 */

import type { RouterDecision, AgentType } from '../tools/router';

/**
 * Bias analysis result from the bias agent
 */
export interface BiasResult {
  gender: { score: number; direction: string; examples: string[] };
  religion: { score: number; targetReligion?: string; examples: string[] };
  political: { score: number; leaning: string; examples: string[] };
  overallBiasScore: number;
  flagged: boolean;
  summary: string;
}

/**
 * Sentiment analysis result from the sentiment agent
 */
export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  scores: { positive: number; negative: number; neutral: number };
  reasoning: string;
}

/**
 * Fact-check result from the fact-check agent
 */
export interface FactCheckResult {
  verified: boolean;
  status: 'verified' | 'disputed' | 'unverified' | 'mixed' | 'no_claims';
  confidence: number;
  findings: Array<{
    claim: string;
    verdict: 'true' | 'false' | 'partially_true' | 'unverifiable';
    source?: string;
    explanation: string;
  }>;
  summary: string;
  skipped?: boolean;
}

/**
 * Aggregated row result with risk score
 */
export interface AggregatedResult {
  text: string;
  bias?: BiasResult;
  sentiment?: SentimentResult;
  factCheck?: FactCheckResult;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  routingDecision: RouterDecision;
  agentsRun: AgentType[];
  fromCache: boolean;
  error?: string;
}

/**
 * Risk score weights
 */
const RISK_WEIGHTS = {
  bias: 0.4,      // 40% weight for bias
  factCheck: 0.4, // 40% weight for fact-check issues
  sentiment: 0.2, // 20% weight for negative sentiment
};

/**
 * Calculate risk contribution from bias analysis
 */
function calculateBiasRisk(bias?: BiasResult): number {
  if (!bias) return 0;
  
  // Use overall bias score (0-1) and scale to 0-100
  // Higher bias = higher risk
  return bias.overallBiasScore * 100;
}

/**
 * Calculate risk contribution from fact-check analysis
 */
function calculateFactCheckRisk(factCheck?: FactCheckResult): number {
  if (!factCheck) return 0;
  
  // If skipped (no claims), no risk
  if (factCheck.skipped || factCheck.status === 'no_claims') {
    return 0;
  }
  
  // Risk based on status and confidence
  switch (factCheck.status) {
    case 'verified':
      // Low risk for verified content
      return (1 - factCheck.confidence) * 20; // Max 20 if low confidence
    case 'disputed':
      // High risk for disputed content
      return 80 + (factCheck.confidence * 20); // 80-100 based on confidence
    case 'unverified':
      // Medium risk for unverified
      return 50;
    case 'mixed':
      {
        // Calculate based on findings
        const falseClaims = factCheck.findings.filter(f => f.verdict === 'false').length;
        const totalClaims = factCheck.findings.length;
        if (totalClaims === 0) return 30;
        return 30 + (falseClaims / totalClaims) * 70; // 30-100 based on false ratio
      }
    default:
      return 30;
  }
}

/**
 * Calculate risk contribution from sentiment analysis
 */
function calculateSentimentRisk(sentiment?: SentimentResult): number {
  if (!sentiment) return 0;
  
  // Only negative sentiment contributes to risk
  switch (sentiment.sentiment) {
    case 'negative':
      // Use negative score and confidence
      return sentiment.scores.negative * 100 * sentiment.confidence;
    case 'mixed':
      // Partial risk for mixed sentiment
      return sentiment.scores.negative * 50 * sentiment.confidence;
    default:
      return 0;
  }
}

/**
 * Calculate composite risk score (0-100)
 */
export function calculateRiskScore(
  bias?: BiasResult,
  sentiment?: SentimentResult,
  factCheck?: FactCheckResult
): number {
  const biasRisk = calculateBiasRisk(bias);
  const factCheckRisk = calculateFactCheckRisk(factCheck);
  const sentimentRisk = calculateSentimentRisk(sentiment);
  
  // Weighted sum
  const weightedScore = 
    (biasRisk * RISK_WEIGHTS.bias) +
    (factCheckRisk * RISK_WEIGHTS.factCheck) +
    (sentimentRisk * RISK_WEIGHTS.sentiment);
  
  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 50) return 'medium';
  if (score < 70) return 'high';
  return 'critical';
}

/**
 * Calculate overall confidence from agent results
 */
export function calculateConfidence(
  bias?: BiasResult,
  sentiment?: SentimentResult,
  factCheck?: FactCheckResult,
  agentsRun: AgentType[] = []
): number {
  if (agentsRun.length === 0) return 1; // No agents = certain skip
  
  let totalConfidence = 0;
  let count = 0;
  
  if (bias && agentsRun.includes('bias')) {
    // Bias doesn't have explicit confidence, use inverse of flagged uncertainty
    totalConfidence += bias.flagged ? 0.9 : 0.95;
    count++;
  }
  
  if (sentiment && agentsRun.includes('sentiment')) {
    totalConfidence += sentiment.confidence;
    count++;
  }
  
  if (factCheck && agentsRun.includes('factCheck')) {
    // Skip no_claims since they're certain
    if (factCheck.status !== 'no_claims') {
      totalConfidence += factCheck.confidence;
      count++;
    } else {
      totalConfidence += 1;
      count++;
    }
  }
  
  return count > 0 ? totalConfidence / count : 0.5;
}

/**
 * Aggregate results from all agents into a unified result
 */
export function aggregateResults(
  text: string,
  bias: BiasResult | undefined,
  sentiment: SentimentResult | undefined,
  factCheck: FactCheckResult | undefined,
  routingDecision: RouterDecision,
  agentsRun: AgentType[],
  fromCache: boolean = false,
  error?: string
): AggregatedResult {
  const riskScore = calculateRiskScore(bias, sentiment, factCheck);
  const riskLevel = getRiskLevel(riskScore);
  const confidence = calculateConfidence(bias, sentiment, factCheck, agentsRun);
  
  return {
    text,
    bias,
    sentiment,
    factCheck,
    riskScore,
    riskLevel,
    confidence,
    routingDecision,
    agentsRun,
    fromCache,
    error,
  };
}

/**
 * Calculate aggregate statistics from multiple results
 */
export function calculateAggregateStats(results: AggregatedResult[]): {
  avgRiskScore: number;
  riskDistribution: Record<'low' | 'medium' | 'high' | 'critical', number>;
  highRiskCount: number;
  avgConfidence: number;
  agentUsage: Record<AgentType, number>;
  cacheHitRate: number;
} {
  if (results.length === 0) {
    return {
      avgRiskScore: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      highRiskCount: 0,
      avgConfidence: 0,
      agentUsage: { bias: 0, sentiment: 0, factCheck: 0 },
      cacheHitRate: 0,
    };
  }
  
  const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
  const agentUsage = { bias: 0, sentiment: 0, factCheck: 0 };
  let totalRisk = 0;
  let totalConfidence = 0;
  let cacheHits = 0;
  
  for (const result of results) {
    totalRisk += result.riskScore;
    totalConfidence += result.confidence;
    riskDistribution[result.riskLevel]++;
    
    if (result.fromCache) cacheHits++;
    
    for (const agent of result.agentsRun) {
      agentUsage[agent]++;
    }
  }
  
  return {
    avgRiskScore: Math.round(totalRisk / results.length),
    riskDistribution,
    highRiskCount: riskDistribution.high + riskDistribution.critical,
    avgConfidence: totalConfidence / results.length,
    agentUsage,
    cacheHitRate: cacheHits / results.length,
  };
}

/**
 * Sort results by risk score (highest first)
 */
export function sortByRisk(results: AggregatedResult[]): AggregatedResult[] {
  return [...results].sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Filter results by risk level
 */
export function filterByRiskLevel(
  results: AggregatedResult[],
  minLevel: 'low' | 'medium' | 'high' | 'critical'
): AggregatedResult[] {
  const levelOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const minOrder = levelOrder[minLevel];
  
  return results.filter(r => levelOrder[r.riskLevel] >= minOrder);
}

/**
 * Get flagged results (high risk or agent-flagged)
 */
export function getFlaggedResults(results: AggregatedResult[]): AggregatedResult[] {
  return results.filter(r => 
    r.riskLevel === 'high' || 
    r.riskLevel === 'critical' ||
    r.bias?.flagged ||
    r.factCheck?.status === 'disputed'
  );
}

