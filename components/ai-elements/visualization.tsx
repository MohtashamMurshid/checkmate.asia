"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { TrendingUpIcon, BarChartIcon } from "lucide-react";

export type VisualizationProps = ComponentProps<"div"> & {
  data: any;
};

const SentimentBar = ({ 
  classification, 
  confidence 
}: { 
  classification: string; 
  confidence: number;
}) => {
  const getColor = (type: string) => {
    if (type === 'positive') return 'bg-green-500';
    if (type === 'negative') return 'bg-red-500';
    if (type === 'neutral') return 'bg-gray-500';
    if (type === 'left') return 'bg-blue-500';
    if (type === 'right') return 'bg-red-500';
    if (type === 'center') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const percentage = Math.round(confidence * 100);
  const capitalized = classification.charAt(0).toUpperCase() + classification.slice(1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{capitalized}</span>
        <span className="text-muted-foreground font-semibold">{percentage}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", getColor(classification))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ComparisonCard = ({ 
  title, 
  initial, 
  exa, 
  match 
}: { 
  title: string; 
  initial: any; 
  exa: any; 
  match: boolean;
}) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        {match ? (
          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
            Match
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
            Different
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {initial && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Original</p>
            <SentimentBar
              classification={initial.classification || 'neutral'}
              confidence={initial.confidence || 0}
            />
          </div>
        )}
        
        {exa && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">News</p>
            <SentimentBar
              classification={exa.classification || 'neutral'}
              confidence={exa.confidence || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Visualization = ({ className, data, ...props }: VisualizationProps) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check if this is a full visualization data structure
  if (data.type === 'investigation_visualization') {
    const { initialContent, exaResults, comparison } = data;

  return (
    <div className={cn("space-y-4 p-4 bg-muted/30 rounded-lg border", className)} {...props}>
      {/* Sentiment Comparison */}
      {comparison?.sentimentDiff && (
        <ComparisonCard
          title="Sentiment"
          initial={initialContent?.sentiment}
          exa={exaResults?.sentiment}
          match={comparison.sentimentDiff.match}
        />
      )}

      {/* Political Leaning Comparison */}
      {comparison?.politicalDiff && (
        <ComparisonCard
          title="Political Leaning"
          initial={initialContent?.politicalLeaning}
          exa={exaResults?.politicalLeaning}
          match={comparison.politicalDiff.match}
        />
      )}

      {/* Citations */}
      {exaResults?.citations && Array.isArray(exaResults.citations) && exaResults.citations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChartIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sources ({exaResults.citations.length})</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exaResults.citations.map((citation: any, index: number) => (
              <div key={index} className="p-3 bg-background rounded border text-xs space-y-1">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline block truncate"
                >
                  {citation.url}
                </a>
                {citation.text && (
                  <p className="text-muted-foreground line-clamp-2">
                    {citation.text.substring(0, 150)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  }

  // Handle individual sentiment/political analysis (not full visualization)
  if (data.sentiment && data.politicalLeaning) {
    return (
      <div className={cn("space-y-3 p-4 bg-muted/30 rounded-lg border", className)} {...props}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">Sentiment</h3>
            <SentimentBar
              classification={data.sentiment.classification || 'neutral'}
              confidence={data.sentiment.confidence || 0}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">Political</h3>
            <SentimentBar
              classification={data.politicalLeaning.classification || 'center'}
              confidence={data.politicalLeaning.confidence || 0}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

