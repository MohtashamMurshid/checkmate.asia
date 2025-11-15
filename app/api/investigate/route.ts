import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { getOpenRouterProvider, getModelConfig, AI_CONFIG } from '@/lib/ai/config';
import { investigateTools } from '@/lib/ai/tools';
import { extractContent } from '@/lib/ai/extractors';

// Use maxDuration from config
export const maxDuration = AI_CONFIG.maxDuration;

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

    // Prepare message for agent with extracted content
    const analysisPrompt = `I have extracted the following content for analysis:

**Source Type:** ${extractedContent.sourceType}
**Content:**
${extractedContent.content}

${Object.keys(extractedContent.metadata).length > 0
  ? `**Metadata:**\n${JSON.stringify(extractedContent.metadata, null, 2)}\n\n`
  : ''}Please analyze this content comprehensively using your available tools.`;

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
      stopWhen: stepCountIs(10), // Increased for comprehensive analysis
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

