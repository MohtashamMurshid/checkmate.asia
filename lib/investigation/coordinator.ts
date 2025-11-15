/**
 * Investigation Coordinator
 * Analyzes content and routes to appropriate specialized agent
 */

import { stepCountIs, streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { getOpenRouterProvider, getModelConfig } from '@/lib/ai/config';
import type { InvestigationType } from './types';
import type { UIMessage } from 'ai';
import {
  createBusinessAgent,
  createFinanceAgent,
  createScienceAgent,
  createFactualAgent,
  createHistoryAgent,
} from './agents';

const COORDINATOR_PROMPT = `You are an Investigation Coordinator. Your job is to analyze the provided content and determine what type of investigation is needed.

The content may be:
- Text from social media posts, articles, or documents
- Claims or statements that need verification
- Questions about facts or information

Based on the content, classify it into ONE of these investigation types:

1. **business** - Company information, startup funding, economic data, business deals, corporate ownership
2. **finance** - Financial markets, interest rates, bonds, inflation, currency, macroeconomic data
3. **science** - Scientific research, academic papers, research findings, scientific claims
4. **factual** - General knowledge, biographical information, facts about people/places/events
5. **history** - Historical events, historical figures, ancient places, cultural heritage

Respond with ONLY the investigation type (one word: business, finance, science, factual, or history).`;

/**
 * Determine investigation type from content
 */
export async function determineInvestigationType(
  content: string,
  model?: string
): Promise<InvestigationType> {
  const modelConfig = getModelConfig(model);
  const provider = getOpenRouterProvider();

  const result = await streamText({
    model: provider.chat(modelConfig.model),
    system: COORDINATOR_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this content and determine the investigation type:\n\n${content.substring(0, 2000)}`,
      },
    ],
    stopWhen: stepCountIs(1),
  });

  const text = await result.text;
  const normalized = text.trim().toLowerCase();

  // Extract investigation type from response
  if (normalized.includes('business') || normalized.includes('economic')) {
    return 'business';
  }
  if (normalized.includes('finance') || normalized.includes('financial')) {
    return 'finance';
  }
  if (normalized.includes('science') || normalized.includes('research') || normalized.includes('academic')) {
    return 'science';
  }
  if (normalized.includes('history') || normalized.includes('historical')) {
    return 'history';
  }
  // Default to factual for general knowledge
  return 'factual';
}

/**
 * Route investigation to appropriate agent
 */
export async function routeToAgent(
  investigationType: InvestigationType,
  content: string
): Promise<{ text: string; actions: unknown[] }> {
  let agent;
  
  switch (investigationType) {
    case 'business':
      agent = createBusinessAgent();
      break;
    case 'finance':
      agent = createFinanceAgent();
      break;
    case 'science':
      agent = createScienceAgent();
      break;
    case 'factual':
      agent = createFactualAgent();
      break;
    case 'history':
      agent = createHistoryAgent();
      break;
    default:
      agent = createFactualAgent();
  }

  const result = await agent.generate({
    prompt: `Investigate the following content and provide a comprehensive truthfulness analysis. 
    
Content to investigate:
${content}

Provide your analysis in the following JSON format:
{
  "truthfulnessScore": <number 0-100>,
  "verdict": "<true|false|unverified|partially-true>",
  "summary": "<brief summary>",
  "evidence": [{"claim": "<claim>", "verification": "<verified|disputed|unverified>", "source": "<source>", "explanation": "<explanation>"}],
  "reasoning": "<detailed reasoning>",
  "sources": [{"name": "<name>", "url": "<url>", "type": "<api|website|document>", "reliability": "<high|medium|low>"}]
}`,
  });

  return {
    text: result.text,
    actions: result.steps || [],
  };
}

/**
 * Route investigation to appropriate agent with streaming support
 * Makes tool calls and agent steps visible to the user
 */
export async function routeToAgentWithStreaming(
  investigationType: InvestigationType,
  content: string,
  messages: UIMessage[],
  modelConfig: { model: string; modelName: string },
  provider: ReturnType<typeof getOpenRouterProvider>
) {
  let agent;
  
  switch (investigationType) {
    case 'business':
      agent = createBusinessAgent();
      break;
    case 'finance':
      agent = createFinanceAgent();
      break;
    case 'science':
      agent = createScienceAgent();
      break;
    case 'factual':
      agent = createFactualAgent();
      break;
    case 'history':
      agent = createHistoryAgent();
      break;
    default:
      agent = createFactualAgent();
  }

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      // First, run the agent to investigate the content
      const agentPrompt = `Investigate the following content and provide a comprehensive truthfulness analysis. Use your available tools to gather accurate information.
    
Content to investigate:
${content}

After gathering all evidence, provide your analysis in the following JSON format:
{
  "truthfulnessScore": <number 0-100>,
  "verdict": "<true|false|unverified|partially-true>",
  "summary": "<brief summary>",
  "evidence": [{"claim": "<claim>", "verification": "<verified|disputed|unverified>", "source": "<source>", "explanation": "<explanation>"}],
  "reasoning": "<detailed reasoning>",
  "sources": [{"name": "<name>", "url": "<url>", "type": "<api|website|document>", "reliability": "<high|medium|low>"}]
}`;

      // Stream the agent investigation with visible tool calls
      const agentResult = agent.stream({
        prompt: agentPrompt,
      });

      // Forward agent steps to the UI using the data stream
      let agentText = '';
      let stepCount = 0;

      for await (const chunk of agentResult.fullStream) {
        switch (chunk.type) {
          case 'tool-input-start':
            stepCount++;
            writer.write({
              type: 'data-agent-step',
              id: `step-${stepCount}`,
              data: {
                type: 'agent-step',
                step: stepCount,
                status: 'started',
              },
            });
            writer.write({
              type: 'data-tool-call',
              id: chunk.id,
              data: {
                type: 'tool-call-start',
                toolName: chunk.toolName,
                toolCallId: chunk.id,
              },
            });
            break;

          case 'tool-call':
            writer.write({
              type: 'data-tool-call',
              id: chunk.toolCallId,
              data: {
                type: 'tool-call',
                toolName: chunk.toolName,
                toolCallId: chunk.toolCallId,
                args: chunk.input,
              },
            });
            break;

          case 'tool-result':
            writer.write({
              type: 'data-tool-result',
              id: chunk.toolCallId,
              data: {
                type: 'tool-result',
                toolName: chunk.toolName,
                toolCallId: chunk.toolCallId,
                result: chunk.output,
              },
            });
            break;

          case 'text-delta':
            agentText += chunk.text;
            break;

          case 'finish':
            if (stepCount > 0) {
              writer.write({
                type: 'data-agent-step',
                id: `step-${stepCount}-finish`,
                data: {
                  type: 'agent-step',
                  step: stepCount,
                  status: 'finished',
                },
              });
            }
            break;
        }
      }

      // Now stream the final presentation of results
      const presentationResult = streamText({
        model: provider.chat(modelConfig.model),
        system: `You are presenting investigation results. Format the JSON analysis in a clear, structured way for the user.
Include:
- Investigation type: ${investigationType}
- Truthfulness score and verdict
- Summary of findings
- Evidence with verification status
- Detailed reasoning
- Sources with reliability ratings

Present this information in a well-formatted, easy-to-read manner.`,
        messages: [
          ...convertToModelMessages(messages.slice(0, -1)),
          {
            role: 'user',
            content: `Present these investigation results:\n\n${agentText}`,
          },
        ],
        stopWhen: stepCountIs(5),
      });

      // Merge the presentation stream
      writer.merge(presentationResult.toUIMessageStream({ sendStart: false }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}

