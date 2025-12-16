"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TextShimmer } from "@/components/text-shimmer";
import { cn } from "@/lib/utils";
import type { ToolUIPart } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
  NewspaperIcon,
  TrendingUpIcon,
  BarChartIcon,
  FileSearchIcon,
  MessageSquareIcon,
  VideoIcon,
  GlobeIcon,
  FileTextIcon,
  SearchIcon,
  BuildingIcon,
  ClipboardListIcon,
  BotIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";
import { CodeBlock } from "./code-block";
import { Visualization } from "./visualization";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn("not-prose mb-4 w-full max-w-full min-w-0", className)}
    {...props}
  />
);


export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  input?: ToolUIPart["input"];
  className?: string;
};

export const getToolIcon = (toolType: string): ReactNode => {
  // Extract tool name from type (e.g., "tool-search_news_parallel" -> "search_news_parallel")
  const toolName = toolType.replace("tool-", "");
  
  // Map tool names to icons
  const iconMap: Record<string, ReactNode> = {
    search_news_parallel: <NewspaperIcon className="size-4 text-muted-foreground shrink-0" />,
    analyze_sentiment_political: <TrendingUpIcon className="size-4 text-muted-foreground shrink-0" />,
    generate_visualization: <BarChartIcon className="size-4 text-muted-foreground shrink-0" />,
    comprehensive_analysis: <FileSearchIcon className="size-4 text-muted-foreground shrink-0" />,
    scrape_twitter: <MessageSquareIcon className="size-4 text-muted-foreground shrink-0" />,
    scrape_tiktok: <VideoIcon className="size-4 text-muted-foreground shrink-0" />,
    search_web_exa: <GlobeIcon className="size-4 text-muted-foreground shrink-0" />,
    search_web: <SearchIcon className="size-4 text-muted-foreground shrink-0" />,
    analyze_and_summarize: <FileTextIcon className="size-4 text-muted-foreground shrink-0" />,
    get_company_info: <BuildingIcon className="size-4 text-muted-foreground shrink-0" />,
    analyze_text: <ClipboardListIcon className="size-4 text-muted-foreground shrink-0" />,
    research_query: <FileSearchIcon className="size-4 text-muted-foreground shrink-0" />,
  };

  return iconMap[toolName] || <WrenchIcon className="size-4 text-muted-foreground shrink-0" />;
};

export const getToolDisplayName = (toolType: string, input?: any): string => {
  // Extract tool name from type (e.g., "tool-search_news_parallel" -> "search_news_parallel")
  const toolName = toolType.replace("tool-", "");
  
  // Special handling for sentiment analysis to differentiate source vs news coverage
  if (toolName === "analyze_sentiment_political" && input) {
    // Check if context indicates it's analyzing Exa results (news coverage)
    const context = (input.context || "").toLowerCase();
    const text = input.text || "";
    
    // If context mentions "exa", "news", "summary", or "coverage", it's analyzing news coverage
    // Also check if text is longer (summaries are typically longer than original content)
    if (context.includes("exa") || 
        context.includes("news") ||
        context.includes("summary") ||
        context.includes("coverage") ||
        (text.length > 300 && !context.includes("twitter") && !context.includes("tiktok") && !context.includes("blog"))) {
      return "Analyze News Coverage Sentiment";
    }
    // Otherwise it's analyzing the original source content
    return "Analyze Source Sentiment";
  }
  
  // Map tool code names to user-friendly display names
  const nameMap: Record<string, string> = {
    search_news_parallel: "Search Related News",
    analyze_sentiment_political: "Analyze Sentiment & Political Leaning",
    generate_visualization: "Generate Visualization",
    comprehensive_analysis: "Comprehensive Analysis",
    scrape_twitter: "Scrape Twitter Post",
    scrape_tiktok: "Scrape TikTok Video",
    search_web_exa: "Search Web",
    search_web: "Search Web",
    analyze_and_summarize: "Analyze & Summarize",
    get_company_info: "Get Company Information",
    analyze_text: "Analyze Text",
    research_query: "Research with Exa",
  };

  return nameMap[toolName] || toolName.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export const getStatusBadge = (status: ToolUIPart["state"]) => {
  const labels: Record<string, string> = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "approval-requested": "Awaiting Approval",
    "approval-responded": "Responded",
    "output-available": "Completed",
    "output-error": "Error",
    "output-denied": "Denied",
  };

  const icons: Record<string, ReactNode> = {
    "input-streaming": <CircleIcon className="size-4" />,
    "input-available": <ClockIcon className="size-4 animate-pulse" />,
    "approval-requested": <ClockIcon className="size-4 text-chart-3" />,
    "approval-responded": <CheckCircleIcon className="size-4 text-primary" />,
    "output-available": <CheckCircleIcon className="size-4 text-chart-2" />,
    "output-error": <XCircleIcon className="size-4 text-destructive" />,
    "output-denied": <XCircleIcon className="size-4 text-chart-3" />,
  };

  return (
    <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  input,
  ...props
}: ToolHeaderProps) => {
  const isExecuting = state === "input-streaming" || state === "input-available";
  const hasError = state === "output-error";
  const displayName = title ?? getToolDisplayName(type, input);

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-4 p-3 hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {getToolIcon(type)}
        {isExecuting ? (
          <TextShimmer 
            as="span" 
            className="font-medium text-sm truncate" 
            duration={1.5}
            spread={3}
          >
            {displayName}
          </TextShimmer>
        ) : (
          <span className={cn(
            "font-medium text-sm truncate",
            hasError ? "text-destructive" : ""
          )}>
            {displayName}
          </span>
        )}
        {getStatusBadge(state)}
      </div>
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in max-w-full min-w-0 overflow-hidden",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
    <div className={cn("space-y-2 overflow-hidden p-4 max-w-full min-w-0", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Parameters
      </h4>
      <div className="rounded-md bg-muted/50 max-w-full min-w-0 overflow-x-auto overflow-y-auto">
        <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
      </div>
    </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
  state?: ToolUIPart["state"];
};

const LoadingSkeleton = () => (
  <div className="space-y-3 p-4 animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4"></div>
    <div className="h-4 bg-muted rounded w-full"></div>
    <div className="h-4 bg-muted rounded w-5/6"></div>
    <div className="flex items-center gap-2 mt-4">
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      <TextShimmer 
        as="span" 
        className="text-xs ml-2" 
        duration={1.5}
        spread={3}
      >
        Processing...
      </TextShimmer>
    </div>
  </div>
);

export const ToolOutput = ({
  className,
  output,
  errorText,
  state,
  ...props
}: ToolOutputProps) => {
  // Show loading skeleton when tool is executing
  if (state === "input-streaming" || state === "input-available") {
    return <LoadingSkeleton />;
  }

  if (!(output || errorText)) {
    return null;
  }

  let Output: ReactNode;

  // Check if output is a visualization data structure
  let isVisualization = false;
  let visualizationData: any = null;

  if (typeof output === "object" && !isValidElement(output) && output !== null) {
    // Check if it's a visualization structure or sentiment analysis
    const outputAny = output as any;
    if (outputAny.type === 'investigation_visualization' || 
        (outputAny.sentiment && outputAny.politicalLeaning)) {
      isVisualization = true;
      visualizationData = outputAny;
    } else {
      // Beautify JSON objects
      Output = (
        <CodeBlock 
          code={JSON.stringify(output, null, 2)} 
          language="json" 
        />
      );
    }
  } else if (typeof output === "string") {
    // Try to parse and beautify JSON strings
    let beautifiedCode = output;
    try {
      const parsed = JSON.parse(output);
      // Check if parsed is a visualization structure or sentiment analysis
      if (parsed.type === 'investigation_visualization' || 
          (parsed.sentiment && parsed.politicalLeaning)) {
        isVisualization = true;
        visualizationData = parsed;
      } else {
        beautifiedCode = JSON.stringify(parsed, null, 2);
        Output = <CodeBlock code={beautifiedCode} language="json" />;
      }
    } catch {
      // If it's not valid JSON, use as-is
      beautifiedCode = output;
      Output = <CodeBlock code={beautifiedCode} language="json" />;
    }
  } else {
    Output = <div className="break-words whitespace-pre-wrap overflow-wrap-anywhere">{String(output)}</div>;
  }

  // Render visualization if detected
  if (isVisualization && visualizationData) {
    Output = <Visualization data={visualizationData} />;
  }

  return (
    <div className={cn("space-y-2 p-4 max-w-full min-w-0", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto overflow-y-auto rounded-md text-xs max-w-full min-w-0 [&_table]:w-full",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-foreground"
        )}
      >
        {errorText && <div className="break-words whitespace-pre-wrap overflow-wrap-anywhere">{errorText}</div>}
        {Output}
      </div>
    </div>
  );
};
