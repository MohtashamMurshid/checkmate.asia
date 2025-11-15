import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { getOpenRouterProvider, getModelConfig, AI_CONFIG } from '@/lib/ai/config';
import { investigateTools } from '@/lib/ai/tools';
import { extractContent } from '@/lib/ai/extractors';

// Route segment config - must be statically analyzable in Next.js 16
export const maxDuration = 30;

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

1. **Search for related news** (MUST RUN FIRST): Use the search_news_parallel tool with the extracted content and sourceType to find related news articles. This will return citations and a summary. WAIT for this to complete before proceeding.

2. **Analyze Exa results** (MUST WAIT FOR STEP 1): After step 1 completes, use the analyze_sentiment_political tool to analyze the summary from the Exa search results. Pass the summary text from step 1 and include context mentioning "Exa results" or "news coverage".

3. **Analyze initial content** (CAN RUN IN PARALLEL WITH STEP 2): Use the analyze_sentiment_political tool to analyze the sentiment and political leaning of the initial extracted content above. Include context about the source type (twitter, tiktok, blog, or text).

4. **Generate visualization** (MUST WAIT FOR STEPS 2 AND 3): After both sentiment analyses complete, use the generate_visualization tool with:
   - initialAnalysis: the JSON result from step 3
   - exaAnalysis: the JSON result from step 2
   - citations: the citations array from step 1
   - exaSummary: the summary text from step 1

IMPORTANT: Step 2 MUST wait for step 1 to complete. Steps 2 and 3 can run in parallel. Step 4 must wait for both steps 2 and 3.

All tools are optional - if any step fails, continue with the next step. Present the final visualization and analysis results clearly.`;

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

