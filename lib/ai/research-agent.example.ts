/**
 * Example usage of the Research Agent
 * 
 * This file demonstrates how to use the research agent programmatically
 * and in the frontend.
 */

import { runResearchAgent } from './research-agent';

/**
 * Example 1: Using the research agent programmatically (server-side)
 */
export async function exampleProgrammaticUsage() {
  // Example queries for different domains
  
  // Business/Company Research
  const companyQuery = "Find information about Apple Inc. including registration details and ownership";
  const companyResult = await runResearchAgent(companyQuery);
  console.log('Company Research:', companyResult);

  // Economic Data Research
  const economicQuery = "What is the current GDP of France and how has it changed over the past 5 years?";
  const economicResult = await runResearchAgent(economicQuery);
  console.log('Economic Research:', economicResult);

  // Academic Research
  const academicQuery = "Find recent papers about large language models and their applications";
  const academicResult = await runResearchAgent(academicQuery);
  console.log('Academic Research:', academicResult);

  // Historical Research
  const historicalQuery = "What historical events happened on December 7th?";
  const historicalResult = await runResearchAgent(historicalQuery);
  console.log('Historical Research:', historicalResult);

  // Factual Knowledge Research
  const factualQuery = "What is the capital of France and provide detailed information about it";
  const factualResult = await runResearchAgent(factualQuery);
  console.log('Factual Research:', factualResult);
}

/**
 * Example 2: Research agent automatically selects tools based on query
 * 
 * The research agent intelligently selects which tools to use:
 * 
 * - Company queries → Uses OpenCorporates, Crunchbase
 * - Economic queries → Uses FRED, IMF, World Bank
 * - Academic queries → Uses Semantic Scholar, arXiv, PubMed
 * - Historical queries → Uses History API, Pleiades, Europeana
 * - Factual queries → Uses Wikipedia, Wikidata, DBpedia
 * 
 * Example queries that trigger different tools:
 * 
 * "Find papers about machine learning" 
 *   → Uses: search_semantic_scholar, search_arxiv
 * 
 * "What is the federal funds rate?"
 *   → Uses: query_fred_data
 * 
 * "Search for information about Tesla Inc."
 *   → Uses: search_opencorporates, search_crunchbase
 * 
 * "What happened on July 4th in history?"
 *   → Uses: get_historical_events
 * 
 * "What is the capital of France?"
 *   → Uses: search_wikipedia, query_wikidata_sparql
 */


