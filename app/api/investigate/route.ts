import { getOpenRouterProvider, getModelConfig, AI_CONFIG } from '@/lib/ai/config';
import { extractContent } from '@/lib/investigation/content-extractor';
import {
  determineInvestigationType,
  routeToAgentWithStreaming,
} from '@/lib/investigation/coordinator';
import {
  validateMessages,
  validateLastMessage,
  validateExtractedContent,
  createValidationResponse,
  parseMessageContent,
  createErrorResponse,
  createInvestigationSystemPrompt,
  combineExtractedContent,
} from '@/lib/investigation/utils';
import type { UIMessage } from 'ai';

// Use maxDuration from config
export const maxDuration = AI_CONFIG.maxDuration;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model }: { messages: UIMessage[]; model?: string } = body;

    // Validate request
    const messagesValidation = validateMessages(messages);
    if (messagesValidation) {
      return createValidationResponse(messagesValidation);
    }

    const lastMessageValidation = validateLastMessage(messages);
    if (lastMessageValidation) {
      return createValidationResponse(lastMessageValidation);
    }

    // Parse message content
    const lastMessage = messages[messages.length - 1];
    const { text, files, links } = await parseMessageContent(lastMessage);

    // Extract content from all sources
    const extractionResults = await extractContent(
      text,
      files.length > 0 ? files : undefined,
      links.length > 0 ? links : undefined
    );

    // Combine extracted content
    const combinedContent = combineExtractedContent(extractionResults);

    // Validate extracted content
    const contentValidation = validateExtractedContent(combinedContent);
    if (contentValidation) {
      return createValidationResponse(contentValidation);
    }

    // Determine investigation type and route to agent
    const investigationType = await determineInvestigationType(
      combinedContent,
      model
    );

    // Stream investigation results with agent actions visible
    const modelConfig = getModelConfig(model);
    const provider = getOpenRouterProvider();

    const result = await routeToAgentWithStreaming(
      investigationType,
      combinedContent,
      messages,
      modelConfig,
      provider
    );

    return result;
  } catch (error) {
    console.error('Error in investigate API:', error);
    return createErrorResponse(error);
  }
}

