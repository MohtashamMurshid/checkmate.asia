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

    // Simplified workflow prompt with Exa Research
    const analysisPrompt = `I have extracted the following content for analysis:

**Source Type:** ${extractedContent.sourceType}
**Content:**
${extractedContent.content}

${Object.keys(extractedContent.metadata).length > 0
  ? `**Metadata:**\n${JSON.stringify(extractedContent.metadata, null, 2)}\n\n`
  : ''}Please follow this streamlined investigation workflow:

**Step 1: Content Extraction & Display**
- The content has been extracted above. Display it clearly.

**Step 2: Research (Parallel with Step 3)**
- Use the research_query tool with Exa Research API to conduct comprehensive research on the topic.
- Pass the extracted content and any key claims or entities mentioned.
- Exa will automatically explore the web, gather sources, and synthesize findings with citations.
- This can run in parallel with claim extraction.

**Step 3: Extract Claims (Parallel with Step 2)**
- Identify key claims, facts, or assertions from the extracted content.
- List them clearly for verification.

**Step 4: Visualize**
- After research completes, use analyze_sentiment_political to analyze:
  a. The original extracted content (include source type context)
  b. The research summary from Exa (include "research results" context)
- Use generate_visualization tool with both sentiment analyses and citations from research.
- Use generate_evolution_graph to create a timeline from research sources.

**Step 5: Generate Summary**
- Write a comprehensive markdown report synthesizing:
  - The extracted content and its type
  - Key findings from Exa research
  - Sentiment and political bias analysis
  - Source comparisons and credibility
  - Clear conclusions

**Step 6: Evolution Graph**
- The evolution graph should already be generated in Step 4.

**Workflow Notes:**
- Steps 2 and 3 can run in parallel
- Step 4 waits for Step 2 (research) to complete
- Step 5 waits for Step 4 (visualization) to complete
- All tools are optional - continue even if one fails
- Use Exa Research API (research_query tool) for comprehensive investigation`;

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
      system: `${AI_CONFIG.systemPrompt}\n\n[EXTRACTED_CONTENT]${JSON.stringify({
        content: extractedContent.content,
        sourceType: extractedContent.sourceType,
        metadata: extractedContent.metadata,
      })}[/EXTRACTED_CONTENT]`,
      messages: convertToModelMessages(analysisMessages),
      tools: investigateTools,
      stopWhen: stepCountIs(10), // Reduced for streamlined workflow
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

