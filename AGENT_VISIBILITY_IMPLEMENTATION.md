# Agent and Tool Call Visibility Implementation

## Overview
This implementation makes agent actions and tool calls visible to users in real-time during the investigation process. Users can now see:
- When investigation steps start and complete
- Which tools are being called
- Tool input parameters
- Tool execution results

## Architecture

### 1. Backend Changes

#### `/app/api/investigate/route.ts`
- Updated to use the new `routeToAgentWithStreaming` function instead of the previous `routeToAgent`
- This enables streaming of agent steps and tool calls to the frontend

#### `/lib/investigation/coordinator.ts`
**New Function: `routeToAgentWithStreaming`**
- Creates a `UIMessageStream` that captures agent execution events
- Streams custom data parts for:
  - Agent step starts/completions (`data-agent-step`)
  - Tool call initiations (`data-tool-call` with `tool-call-start`)
  - Tool call inputs (`data-tool-call` with `tool-call`)
  - Tool execution results (`data-tool-result`)

**Data Flow:**
1. Agent starts investigating with `agent.stream()`
2. For each chunk in `agentResult.fullStream`:
   - `tool-input-start` → Writes agent step start + tool call start
   - `tool-call` → Writes tool call with input parameters
   - `tool-result` → Writes tool result with output
   - `text-delta` → Accumulates agent text response
   - `finish` → Writes agent step completion
3. Final presentation is streamed using `streamText` and merged into the UI stream

### 2. Frontend Changes

#### `/app/investigate/page.tsx`

**Custom Data Type Definition:**
```typescript
type InvestigationData = {
  'agent-step': {
    type: 'agent-step';
    step: number;
    status: 'started' | 'finished';
    toolCalls?: number;
    usage?: unknown;
  };
  'tool-call': {
    type: 'tool-call-start' | 'tool-call';
    toolName: string;
    toolCallId: string;
    args?: unknown;
  };
  'tool-result': {
    type: 'tool-result';
    toolName: string;
    toolCallId: string;
    result: unknown;
  };
};
```

**useChat Hook:**
- Updated to accept custom data types: `useChat<never, InvestigationData>`
- Extracts `data` array containing agent steps and tool information

**UI Components:**
Three types of cards are displayed:

1. **Agent Step Cards** (Blue)
   - Shows step number
   - Animated clock icon for "started" status
   - Check icon for "finished" status
   - Badge showing number of tools called

2. **Tool Call Start Cards** (Purple)
   - Spinning wrench icon
   - Shows tool name being called
   - Indicates the investigation is actively querying APIs

3. **Tool Call Details Cards** (Amber)
   - Shows tool name
   - Displays formatted JSON of input parameters
   - Helps users understand what data is being queried

4. **Tool Result Cards** (Green)
   - Shows tool name that produced the result
   - Displays truncated output (first 500 chars)
   - Formatted JSON for structured data

## UI/UX Benefits

### Real-Time Transparency
- Users see exactly what the agent is doing
- No more "black box" waiting periods
- Builds trust in the investigation process

### Educational Value
- Users learn which tools are used for different types of investigations
- Input parameters show how queries are constructed
- Results preview shows what data sources are being consulted

### Debugging and Verification
- Developers can verify correct tool execution
- Users can validate that appropriate APIs are being queried
- Error states are more easily identifiable

## Technical Implementation Details

### AI SDK v6 Compatibility
The implementation uses the Vercel AI SDK v6 API:
- `createUIMessageStream` for creating custom data streams
- `writer.write()` with typed data parts
- `writer.merge()` to combine agent and presentation streams
- Server-Sent Events (SSE) protocol for streaming

### Type Safety
- Full TypeScript support
- Custom data types defined on both client and server
- Type-safe data extraction in UI components

### Performance
- Streaming ensures low latency
- Only necessary data is sent to the client
- Results are truncated to prevent overwhelming the UI
- Efficient re-rendering with React keys

## Color Coding System

| Step Type | Color | Purpose |
|-----------|-------|---------|
| Agent Steps | Blue | Overall progress tracking |
| Tool Call Start | Purple | Indicates active processing |
| Tool Parameters | Amber | Shows what's being queried |
| Tool Results | Green | Displays successful outcomes |

## Future Enhancements

### Possible Improvements:
1. **Collapsible Details** - Allow users to expand/collapse tool results
2. **Error Visualization** - Red cards for failed tool calls with error messages
3. **Timing Information** - Show how long each tool call takes
4. **Progress Bar** - Visual progress indicator for multi-step investigations
5. **Source Attribution** - Link tool results directly to evidence in final report
6. **Export Functionality** - Allow users to export investigation logs

## Testing Recommendations

1. **Business Investigation**
   - Search for a company like "Apple Inc"
   - Verify OpenCorporates API calls appear
   - Check tool parameters and results

2. **Finance Investigation**
   - Query economic indicators
   - Verify World Bank API calls
   - Validate data formatting

3. **Science Investigation**
   - Search for scientific claims
   - Monitor tool execution sequence
   - Verify multiple tool calls if needed

4. **Error Handling**
   - Test with invalid inputs
   - Verify graceful error display
   - Check that presentation still works

## Documentation References

- Vercel AI SDK Docs: https://sdk.vercel.ai/docs
- `createUIMessageStream`: https://sdk.vercel.ai/docs/reference/ai-sdk-ui/create-ui-message-stream
- `useChat` Hook: https://sdk.vercel.ai/docs/reference/ai-sdk-react/use-chat
- Streaming Protocol: https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol

