# Research Agent Frontend Usage

## Overview

The research agent is integrated into the frontend in two ways:

1. **Automatic Tool Calls** - The investigate agent automatically calls `research_query` when it needs factual information
2. **Direct Research Page** - Users can directly access `/research` for standalone research queries

## How It Works in the Frontend

### 1. Investigate Page (`/investigate`)

When users submit content for investigation, the agent can automatically use the research tool:

**Example Flow:**
```
User: "Check this tweet: 'Apple Inc. has a market cap of $3 trillion'"

Agent automatically:
1. Extracts the tweet content
2. Analyzes sentiment and political leaning
3. Calls research_query tool: "Find information about Apple Inc. market capitalization"
4. Research agent queries OpenCorporates, Crunchbase, or financial APIs
5. Returns verified information
6. Presents comprehensive analysis with citations
```

**The research tool is called automatically** when the agent detects:
- Company/entity names that need verification
- Economic data claims
- Scientific/academic claims
- Historical facts
- General factual claims

### 2. Research Page (`/research`)

Users can directly query the research agent:

**Example Queries:**
- "What is the GDP of France?"
- "Find papers about machine learning"
- "Search for information about Tesla Inc."
- "What happened on July 4th in history?"
- "What is the capital of France?"

The research page uses the same research agent but provides a dedicated interface for research-only queries.

## Frontend Components

### Investigate Page Components
- Located in: `app/investigate/page.tsx`
- Uses: `useChat` hook with `/api/investigate` endpoint
- Tool calls are automatically displayed using the `Tool` component
- Research tool calls appear as expandable tool cards

### Research Page Components
- Located in: `app/research/page.tsx`
- Uses: `useChat` hook with `/api/research` endpoint
- Provides a clean interface for research queries
- All research tool calls are displayed with results

## Tool Display

When the `research_query` tool is called, the frontend displays:

1. **Tool Header** - Shows the tool name and status
2. **Tool Input** - Shows the query and context parameters
3. **Tool Output** - Shows the research results with:
   - Formatted markdown responses
   - Citations and sources
   - Structured data from APIs

## Example Usage in Code

### Using Research Tool from Investigate Agent

The investigate agent automatically calls research when needed:

```typescript
// In the investigate workflow, the agent can call:
research_query({
  query: "What is the current GDP of France?",
  context: "Verifying economic claim in the content"
})
```

### Direct Research Page Usage

Users can navigate to `/research` and ask:

```typescript
// User types: "Find papers about transformer architectures"
// The research agent automatically:
// 1. Detects it's an academic query
// 2. Calls search_semantic_scholar and search_arxiv
// 3. Returns formatted results with citations
```

## UI Features

### Tool Cards
- Expandable/collapsible tool calls
- Shows input parameters
- Displays formatted output
- Error handling with error messages

### Loading States
- Shows "Researching..." when tool is executing
- Displays loader animation
- Updates in real-time as results stream in

### Model Selection
- Users can select different AI models
- Available in both investigate and research pages
- Model selection affects research quality and speed

## Navigation

The header component includes navigation between pages:
- **Investigate** button - Links to `/investigate`
- **Research** button - Links to `/research`
- Buttons appear when on either page

## Best Practices

1. **For Investigation**: Use `/investigate` - research tools are called automatically when needed
2. **For Research Only**: Use `/research` - dedicated interface for research queries
3. **Model Selection**: Use GPT-4o or Claude 3.5 Sonnet for better research quality
4. **Query Specificity**: More specific queries yield better results

