/**
 * Router (Triage Agent)
 * 
 * Uses a fast, cheap model (x-ai/grok-4.1-fast:free) to classify input
 * and determine which specialized agents are needed.
 * 
 * This reduces API costs by ~60% by avoiding expensive fact-checks on
 * opinions or greetings, and skipping bias checks on neutral content.
 */

import { z } from 'zod';
import { generateObject } from 'ai';
import { getOpenRouterProvider, getRouterModelConfig } from '../config';

/**
 * Agent types that can be routed to
 */
export type AgentType = 'bias' | 'sentiment' | 'factCheck';

/**
 * Intent classification for routing decisions
 */
export type IntentType = 
  | 'factual'      // Contains verifiable claims → needs fact-check
  | 'sensitive'    // Contains potentially biased content → needs bias check
  | 'subjective'   // Opinion/emotion → needs sentiment only
  | 'mixed'        // Multiple intents → needs multiple agents
  | 'safe';        // Chit-chat/neutral → minimal processing

/**
 * Schema for router decision output
 */
const RouterDecisionSchema = z.object({
  intent: z.enum(['factual', 'sensitive', 'subjective', 'mixed', 'safe'])
    .describe('Primary intent classification of the content'),
  confidence: z.number().min(0).max(1)
    .describe('Confidence score for the routing decision (0-1)'),
  agentsNeeded: z.array(z.enum(['bias', 'sentiment', 'factCheck']))
    .describe('List of specialized agents that should process this content'),
  reasoning: z.string()
    .describe('Brief explanation for the routing decision'),
  contentFlags: z.object({
    hasFactualClaims: z.boolean().describe('Contains statistics, dates, or verifiable facts'),
    hasSensitiveTopics: z.boolean().describe('Contains political, religious, or demographic references'),
    hasEmotionalContent: z.boolean().describe('Contains strong opinions or emotional language'),
    isChitChat: z.boolean().describe('Is casual conversation or greeting'),
  }).describe('Content analysis flags'),
});

export type RouterDecision = z.infer<typeof RouterDecisionSchema>;

/**
 * Router prompt template
 */
const ROUTER_PROMPT = `You are a content triage agent. Your job is to quickly analyze text and determine which specialized analysis agents are needed.

Analyze the following text and classify it:

TEXT:
"{text}"

CLASSIFICATION RULES:

1. **Intent Classification:**
   - "factual": Contains verifiable claims (statistics, dates, events, quotes, scientific claims)
   - "sensitive": Contains references to protected groups (gender, religion, race, politics)
   - "subjective": Primarily opinions, feelings, or personal experiences
   - "mixed": Contains multiple types that need different agents
   - "safe": Casual conversation, greetings, or neutral content that needs minimal processing

2. **Agent Selection:**
   - "bias": Required for sensitive content (political, religious, gender, racial references)
   - "sentiment": Required for subjective/emotional content, opinions, reviews
   - "factCheck": Required for factual claims that can be verified

3. **Efficiency Rules:**
   - For "safe" content: Return empty agentsNeeded array
   - For "subjective" only: Just use sentiment
   - For "factual" only: Just use factCheck
   - For "sensitive": Always include bias, may include others
   - For "mixed": Include all relevant agents

4. **Content Flags:**
   - hasFactualClaims: Numbers, dates, "studies show", named events
   - hasSensitiveTopics: Political parties, religions, demographics, controversial topics
   - hasEmotionalContent: Strong adjectives, exclamations, personal opinions
   - isChitChat: Greetings, small talk, questions about the weather

Be efficient - only route to agents that are truly needed.`;

/**
 * Route a single text through the triage model
 */
export async function routeText(text: string): Promise<RouterDecision> {
  try {
    const provider = getOpenRouterProvider();
    const routerConfig = getRouterModelConfig();

    const prompt = ROUTER_PROMPT.replace('{text}', text);

    const result = await generateObject({
      model: provider.chat(routerConfig.model),
      prompt,
      schema: RouterDecisionSchema,
    });

    return result.object;
  } catch (error) {
    // On error, default to running all agents (fail-safe)
    console.error('Router error, defaulting to full analysis:', error);
    return {
      intent: 'mixed',
      confidence: 0.5,
      agentsNeeded: ['bias', 'sentiment', 'factCheck'],
      reasoning: 'Router error - defaulting to full analysis',
      contentFlags: {
        hasFactualClaims: true,
        hasSensitiveTopics: true,
        hasEmotionalContent: true,
        isChitChat: false,
      },
    };
  }
}

/**
 * Batch route multiple texts
 * Processes in parallel for efficiency
 */
export async function routeTextBatch(
  texts: string[],
  concurrencyLimit: number = 5
): Promise<RouterDecision[]> {
  const results: RouterDecision[] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < texts.length; i += concurrencyLimit) {
    const batch = texts.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(text => routeText(text))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Quick classification without full routing
 * Returns just the agents needed (for simple use cases)
 */
export async function getRequiredAgents(text: string): Promise<AgentType[]> {
  const decision = await routeText(text);
  return decision.agentsNeeded;
}

/**
 * Check if text should be skipped entirely
 */
export function shouldSkip(decision: RouterDecision): boolean {
  return decision.intent === 'safe' && decision.agentsNeeded.length === 0;
}

/**
 * Get routing statistics from a batch of decisions
 */
export function getRoutingStats(decisions: RouterDecision[]): {
  intentCounts: Record<IntentType, number>;
  agentCounts: Record<AgentType, number>;
  skipCount: number;
  avgConfidence: number;
} {
  const intentCounts: Record<IntentType, number> = {
    factual: 0,
    sensitive: 0,
    subjective: 0,
    mixed: 0,
    safe: 0,
  };
  
  const agentCounts: Record<AgentType, number> = {
    bias: 0,
    sentiment: 0,
    factCheck: 0,
  };
  
  let skipCount = 0;
  let totalConfidence = 0;
  
  for (const decision of decisions) {
    intentCounts[decision.intent]++;
    totalConfidence += decision.confidence;
    
    if (shouldSkip(decision)) {
      skipCount++;
    }
    
    for (const agent of decision.agentsNeeded) {
      agentCounts[agent]++;
    }
  }
  
  return {
    intentCounts,
    agentCounts,
    skipCount,
    avgConfidence: decisions.length > 0 ? totalConfidence / decisions.length : 0,
  };
}

/**
 * Estimate cost savings from routing
 * Compares routed agents vs running all agents
 */
export function estimateCostSavings(decisions: RouterDecision[]): {
  totalPossibleAgentCalls: number;
  actualAgentCalls: number;
  savedCalls: number;
  savingsPercent: number;
} {
  const totalPossibleAgentCalls = decisions.length * 3; // 3 agents per row
  let actualAgentCalls = 0;
  
  for (const decision of decisions) {
    actualAgentCalls += decision.agentsNeeded.length;
  }
  
  const savedCalls = totalPossibleAgentCalls - actualAgentCalls;
  const savingsPercent = totalPossibleAgentCalls > 0 
    ? (savedCalls / totalPossibleAgentCalls) * 100 
    : 0;
  
  return {
    totalPossibleAgentCalls,
    actualAgentCalls,
    savedCalls,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
}

