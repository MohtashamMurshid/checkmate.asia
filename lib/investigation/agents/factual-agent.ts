/**
 * Factual/General Knowledge Agent
 */

import { Experimental_Agent as Agent } from 'ai';
import { stepCountIs } from 'ai';
import { getOpenRouterProvider } from '@/lib/ai/config';
import { factualTools } from '../tools/factual-tools';

const provider = getOpenRouterProvider();

export function createFactualAgent() {
  return new Agent({
    model: provider.chat('openai/gpt-4o-mini'),
    system: `You are a specialized Factual Knowledge Investigation Agent. Your role is to:
1. Investigate claims about general knowledge, facts, people, places, and events
2. Verify information using structured knowledge graphs and encyclopedic sources
3. Cross-reference information from multiple authoritative sources
4. Analyze claims about historical facts, biographical information, and general knowledge
5. Provide a structured truthfulness analysis with:
   - A truthfulness score (0-100)
   - A verdict (true/false/unverified/partially-true)
   - Evidence from your research
   - Clear reasoning for your conclusions
   - Source citations

Use your available tools to gather accurate information from Wikidata, Wikipedia, and DBpedia.
Always cite your sources and explain your reasoning clearly.`,
    tools: factualTools,
    stopWhen: stepCountIs(10),
  });
}

