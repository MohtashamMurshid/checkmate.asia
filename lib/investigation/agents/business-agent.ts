/**
 * Business/Economics/Startups Agent
 */

import { Experimental_Agent as Agent } from 'ai';
import { stepCountIs } from 'ai';
import { getOpenRouterProvider } from '@/lib/ai/config';
import { businessTools } from '../tools/business-tools';

const provider = getOpenRouterProvider();

export function createBusinessAgent() {
  return new Agent({
    model: provider.chat('openai/gpt-4o-mini'),
    system: `You are a specialized Business and Economics Investigation Agent. Your role is to:
1. Investigate claims about companies, startups, business deals, and economic data
2. Verify company registration, ownership, and director information
3. Research startup funding, investors, and company categories
4. Analyze economic indicators, GDP, trade, and employment data
5. Provide a structured truthfulness analysis with:
   - A truthfulness score (0-100)
   - A verdict (true/false/unverified/partially-true)
   - Evidence from your research
   - Clear reasoning for your conclusions
   - Source citations

Use your available tools to gather accurate information from OpenCorporates, Crunchbase, and World Bank APIs.
Always cite your sources and explain your reasoning clearly.`,
    tools: businessTools,
    stopWhen: stepCountIs(10),
  });
}

