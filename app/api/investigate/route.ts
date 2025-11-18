import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { getOpenRouterProvider, getModelConfig, AI_CONFIG } from '@/lib/ai/config';
import { investigateTools } from '@/lib/ai/tools';
import { extractContent } from '@/lib/ai/extractors';

// Route segment config - must be statically analyzable in Next.js 16
export const maxDuration = 59;

// Ensure Node.js runtime (not edge) for native module support
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, model }: { messages: UIMessage[]; model?: string } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Get the last user message - extract text from parts if needed
    const lastMessage = messages[messages.length - 1];
    let userInput = '';
    
    if (lastMessage && lastMessage.role === 'user') {
      // UIMessage can have parts array or direct content
      if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        const textParts = lastMessage.parts.filter((p: any) => p.type === 'text');
        userInput = textParts.map((p: any) => p.text).join(' ');
      } else if ('content' in lastMessage && typeof lastMessage.content === 'string') {
        userInput = lastMessage.content;
      } else if ('text' in lastMessage && typeof lastMessage.text === 'string') {
        userInput = lastMessage.text;
      }
    }

    if (!userInput) {
      return new Response(
        JSON.stringify({ error: 'No user input found in messages' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Extract content deterministically
    let extractedContent;
    try {
      extractedContent = await extractContent(userInput);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to extract content',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Prepare message for agent with extracted content and workflow instructions
    const analysisPrompt = `I have extracted the following content for analysis:

**Source Type:** ${extractedContent.sourceType}
**Content:**
${extractedContent.content}

${Object.keys(extractedContent.metadata).length > 0
  ? `**Metadata:**\n${JSON.stringify(extractedContent.metadata, null, 2)}\n\n`
  : ''}Please follow this investigation workflow in order:

1. **Web Search** (MUST RUN FIRST): Use the search_news_parallel tool with the extracted content and sourceType to find related news articles. This will return citations and a summary. WAIT for this to complete before proceeding.

2. **Research** (MUST WAIT FOR STEP 1): After web search completes, use the research_query tool to gather factual information from authoritative sources. Identify key claims, entities, or facts mentioned in the content that need verification:
   - Company names → Research company information
   - Economic data → Query economic indicators
   - Scientific claims → Search academic papers
   - Historical facts → Query historical databases
   - General facts → Search Wikipedia/Wikidata
   
   Pass the web search summary and key claims from the content as context. The research agent will automatically select appropriate APIs. WAIT for this to complete.

3. **Analyze & Classify** (MUST WAIT FOR STEPS 1 AND 2): After both web search and research complete:
   a. Use the analyze_sentiment_political tool to analyze the summary from the web search results. Pass the summary text from step 1 and include context mentioning "web search results" or "news coverage".
   b. Use the analyze_sentiment_political tool to analyze the sentiment and political leaning of the initial extracted content above. Include context about the source type (twitter, tiktok, blog, or text).
   c. If the Content includes "Personal Source Context", use the compare_user_source_to_external tool to compare the personal source text with the web search summary.
   d. If any social media profiles are identified (in metadata or content), use evaluate_source_credibility for each.
   e. For key sources found in web search or research, use classify_source_type to label them as Primary or Secondary.
   
   These analyses can run in parallel, but must wait for steps 1 and 2.

4. **Visualize** (MUST WAIT FOR STEP 3): After analyses complete:
   a. Use the generate_visualization tool with the sentiment/political analysis results.
   b. Use the generate_evolution_graph tool to create a visual timeline of events found in research and web search.

IMPORTANT WORKFLOW ORDER:
- Step 1 (Web Search) → Step 2 (Research) → Step 3 (Analyze) → Step 4 (Visualize)
- Step 2 MUST wait for step 1 to complete
- Step 3 MUST wait for both steps 1 and 2 to complete
- Step 4 MUST wait for step 3 to complete
- Within step 3, the analyses can run in parallel

All tools are optional - if any step fails, continue with the next step. Present the final visualization and analysis results clearly, incorporating both web search findings and research verification.`;

    // Get model configuration
    const modelConfig = getModelConfig(model);
    const provider = getOpenRouterProvider();

    // Create new messages array with analysis prompt
    // Replace the last user message with the analysis prompt
    const analysisMessages: UIMessage[] = [
      ...messages.slice(0, -1), // Keep all previous messages except the last one
      {
        id: `extracted-${Date.now()}`,
        role: 'user',
        parts: [
          {
            type: 'text',
            text: analysisPrompt,
          },
        ],
      } as UIMessage,
    ];

    // Stream the response with tools
    const result = streamText({
      model: provider.chat(modelConfig.model),
      system: AI_CONFIG.systemPrompt,
      messages: convertToModelMessages(analysisMessages),
      tools: investigateTools,
      stopWhen: stepCountIs(15), // Increased for parallel workflow (4 main steps + tool calls)
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in investigate API:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

