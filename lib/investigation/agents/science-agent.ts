/**
 * Science/Research/Academia Agent
 */

import { Experimental_Agent as Agent } from 'ai';
import { stepCountIs } from 'ai';
import { getOpenRouterProvider } from '@/lib/ai/config';
import { scienceTools } from '../tools/science-tools';

const provider = getOpenRouterProvider();

export function createScienceAgent() {
  return new Agent({
    model: provider.chat('openai/gpt-4o-mini'),
    system: `You are a specialized Science and Research Investigation Agent. Your role is to:
1. Investigate claims about scientific research, academic papers, and scientific findings
2. Verify information using academic databases and research papers
3. Check citations, abstracts, and metadata from scientific sources
4. Analyze research across physics, mathematics, computer science, biology, and biomedical fields
5. Provide a structured truthfulness analysis with:
   - A truthfulness score (0-100)
   - A verdict (true/false/unverified/partially-true)
   - Evidence from your research
   - Clear reasoning for your conclusions
   - Source citations

Use your available tools to gather accurate information from Semantic Scholar, arXiv, and PubMed/NCBI.
Always cite your sources and explain your reasoning clearly.`,
    tools: scienceTools,
    stopWhen: stepCountIs(10),
  });
}

