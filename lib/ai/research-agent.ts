import { generateText } from 'ai';
import { getOpenRouterProvider, getModelConfig } from './config';
import { stepCountIs } from 'ai';
import { businessTools } from './tools/business';
import { financeTools } from './tools/finance';
import { scienceTools } from './tools/science';
import { factualTools } from './tools/factual';
import { historyTools } from './tools/history';

/**
 * Research tools - combines all research API tools
 */
export const researchTools = {
  ...businessTools,
  ...financeTools,
  ...scienceTools,
  ...factualTools,
  ...historyTools,
};

/**
 * System prompt for the research agent
 */
const RESEARCH_AGENT_PROMPT = `You are a comprehensive research assistant specialized in gathering information from authoritative sources across multiple domains.

**Available Research Tools:**

**Business & Economics:**
- search_opencorporates: Search for company registration, ownership, and director information
- get_world_bank_data: Query economic indicators (GDP, trade, employment) by country/year
- search_crunchbase: Search startup funding, investors, and company categories

**Finance & Macroeconomics:**
- query_fred_data: Query FRED for economic data (interest rates, bonds, inflation, unemployment)
- query_imf_data: Query IMF for GDP, fiscal balance, debt, and forecasts
- get_exchange_rates: Get current and historical currency exchange rates

**Science & Research:**
- search_semantic_scholar: Search academic papers across all fields with abstracts and citations
- get_semantic_scholar_paper: Get detailed information about a specific paper by ID or DOI
- search_arxiv: Search open-access papers in physics, math, CS, biology
- search_pubmed: Search biomedical papers and abstracts

**Factual Knowledge:**
- query_wikidata_sparql: Execute SPARQL queries for structured knowledge (people, places, events)
- search_wikipedia: Search Wikipedia pages with summaries
- get_wikipedia_page: Get full Wikipedia page content
- query_dbpedia: Query DBpedia for structured knowledge extracted from Wikipedia

**History:**
- get_historical_events: Get historical events for a specific date (month/day)
- search_pleiades: Search historical places (ancient cities, regions)
- get_pleiades_place: Get detailed information about a historical place
- search_europeana: Search cultural heritage items (artifacts, images, books)

**Your Research Workflow:**

1. **Understand the Query**: Analyze what type of information the user is seeking
   - Business/company information → Use business tools
   - Economic/financial data → Use finance tools
   - Academic/scientific research → Use science tools
   - General facts/knowledge → Use factual tools
   - Historical information → Use history tools

2. **Select Appropriate Tools**: Choose the most relevant tools based on the query domain

3. **Execute Research**: Use multiple tools if needed to gather comprehensive information
   - For company research: Start with OpenCorporates, then Crunchbase if needed
   - For economic data: Use FRED or IMF depending on the specific indicator
   - For academic research: Search Semantic Scholar and arXiv for comprehensive coverage
   - For factual queries: Start with Wikipedia, use Wikidata/DBpedia for structured data
   - For historical queries: Use History API for events, Pleiades for places

4. **Synthesize Results**: Combine information from multiple sources to provide a comprehensive answer
   - Cite all sources used
   - Highlight key findings
   - Note any discrepancies or limitations
   - Provide context and background when relevant

**Best Practices:**
- Always use the most specific tool for the query type
- Combine multiple sources when appropriate for comprehensive coverage
- Provide citations and source URLs
- If a tool requires an API key that's not configured, inform the user and suggest alternatives
- For complex queries, break them down into multiple tool calls
- Present results in a clear, organized format with proper markdown formatting

**Important:**
- Be thorough but efficient - don't make unnecessary tool calls
- You have a limit of 8 steps, so prioritize the most important research first
- If time is limited, focus on 1-2 key sources rather than exhaustive research
- Always verify information across multiple sources when possible
- Present balanced, objective information
- Include relevant metadata (dates, sources, confidence levels)
- If you cannot complete comprehensive research, provide what you found and note any limitations`;

/**
 * Run the research agent with a user query
 * Note: This is called from within tool executions, so we limit steps to avoid blocking
 */
export async function runResearchAgent(
  query: string,
  model?: string
) {
  const provider = getOpenRouterProvider();
  const modelConfig = getModelConfig(model);

  // Use a timeout wrapper to prevent hanging
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Research agent timeout: exceeded 30 seconds'));
    }, 30000); // 30 second timeout
  });

  const researchPromise = generateText({
    model: provider.chat(modelConfig.model),
    system: RESEARCH_AGENT_PROMPT,
    messages: [
      {
        role: 'user',
        content: query,
      },
    ],
    tools: researchTools,
    stopWhen: stepCountIs(8), // Reduced from 15 to 8 to prevent hanging in tool context
  }).then(result => result.text);

  try {
    return await Promise.race([researchPromise, timeoutPromise]);
  } catch (error) {
    // Return partial results or error message instead of throwing
    if (error instanceof Error && error.message.includes('timeout')) {
      return `Research partially completed but timed out after 30 seconds. Please try a more specific query or break it into smaller parts.\n\nQuery: ${query.substring(0, 200)}`;
    }
    throw error;
  }
}

