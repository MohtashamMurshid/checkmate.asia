'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type SignalCategory =
  | 'geopolitical'
  | 'economic'
  | 'regulatory'
  | 'supply_chain'
  | 'climate'
  | 'market'
  | 'operational';

type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';
type SignalStatus = 'new' | 'tracking' | 'resolved';

interface SignalCardProps {
  id: Id<'signals'>;
  title: string;
  summary: string;
  category: SignalCategory;
  severity: SignalSeverity;
  relevanceReason: string;
  source: string;
  sourceUrl?: string;
  isBookmarked: boolean;
  status: SignalStatus;
  createdAt: number;
  companyNames?: string[];
  onToggleBookmark?: () => void;
  onMarkTracking?: () => void;
}

const categoryLabels: Record<SignalCategory, string> = {
  geopolitical: 'Geopolitical',
  economic: 'Economic',
  regulatory: 'Regulatory',
  supply_chain: 'Supply Chain',
  climate: 'Climate',
  market: 'Market',
  operational: 'Operational',
};

const severityConfig: Record<SignalSeverity, { dot: string; text: string }> = {
  low: { dot: 'bg-zinc-400', text: 'text-zinc-500' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-600' },
  high: { dot: 'bg-orange-500', text: 'text-orange-600' },
  critical: { dot: 'bg-red-500', text: 'text-red-600' },
};

export function SignalCard({
  id,
  title,
  summary,
  category,
  severity,
  relevanceReason,
  source,
  sourceUrl,
  isBookmarked,
  status,
  createdAt,
  companyNames,
  onToggleBookmark,
  onMarkTracking,
}: SignalCardProps) {
  const sev = severityConfig[severity];
  const timeAgo = formatTimeAgo(createdAt);

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 transition-colors',
        status === 'new' && 'border-l-2 border-l-blue-500'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            {categoryLabels[category]}
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', sev.dot)} />
            <span className={cn('capitalize', sev.text)}>{severity}</span>
          </span>
          {status === 'new' && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-blue-600 dark:text-blue-500 font-medium">New</span>
            </>
          )}
        </div>
        {onToggleBookmark && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mr-1 text-zinc-400 hover:text-zinc-600"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug mb-1.5">
        {title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-3">
        {summary}
      </p>

      {/* Relevance */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded px-3 py-2 mb-3">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Relevance: </span>
          {relevanceReason}
        </p>
      </div>

      {/* Companies */}
      {companyNames && companyNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {companyNames.map((name) => (
            <span
              key={name}
              className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {name.split(' ')[0]}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{source}</span>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
        {status === 'new' && onMarkTracking && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={(e) => {
              e.stopPropagation();
              onMarkTracking();
            }}
          >
            Track
          </Button>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(timestamp).toLocaleDateString();
}
