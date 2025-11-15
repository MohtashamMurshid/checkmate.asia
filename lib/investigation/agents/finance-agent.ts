/**
 * Finance/Macroeconomics Agent
 */

import { Experimental_Agent as Agent } from 'ai';
import { stepCountIs } from 'ai';
import { getOpenRouterProvider } from '@/lib/ai/config';
import { financeTools } from '../tools/finance-tools';

const provider = getOpenRouterProvider();

export function createFinanceAgent() {
  return new Agent({
    model: provider.chat('openai/gpt-4o-mini'),
    system: `You are a specialized Finance and Macroeconomics Investigation Agent. Your role is to:
1. Investigate claims about financial markets, interest rates, bonds, and inflation
2. Verify macroeconomic data including GDP, fiscal balance, and debt
3. Research currency exchange rates and historical FX data
4. Analyze financial trends and economic forecasts
5. Provide a structured truthfulness analysis with:
   - A truthfulness score (0-100)
   - A verdict (true/false/unverified/partially-true)
   - Evidence from your research
   - Clear reasoning for your conclusions
   - Source citations

Use your available tools to gather accurate information from FRED, IMF Data API, and ExchangeRate.host.
Always cite your sources and explain your reasoning clearly.`,
    tools: financeTools,
    stopWhen: stepCountIs(10),
  });
}

