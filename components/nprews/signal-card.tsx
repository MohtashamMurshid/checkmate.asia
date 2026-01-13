'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Building2,
  Clock,
  AlertTriangle,
  Globe,
  TrendingUp,
  FileText,
  Truck,
  Cloud,
  Store,
  Settings,
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

const categoryConfig: Record<
  SignalCategory,
  { label: string; icon: typeof Globe; color: string }
> = {
  geopolitical: {
    label: 'Geopolitical',
    icon: Globe,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  economic: {
    label: 'Economic',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  regulatory: {
    label: 'Regulatory',
    icon: FileText,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  supply_chain: {
    label: 'Supply Chain',
    icon: Truck,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  climate: {
    label: 'Climate',
    icon: Cloud,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  market: {
    label: 'Market',
    icon: Store,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  operational: {
    label: 'Operational',
    icon: Settings,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

const severityConfig: Record<
  SignalSeverity,
  { label: string; color: string; dotColor: string }
> = {
  low: {
    label: 'Low',
    color: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600',
    dotColor: 'bg-amber-500',
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    dotColor: 'bg-orange-500',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    dotColor: 'bg-red-500',
  },
};

const statusConfig: Record<SignalStatus, { label: string; color: string }> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  tracking: {
    label: 'Tracking',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
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
  const cat = categoryConfig[category];
  const sev = severityConfig[severity];
  const stat = statusConfig[status];
  const CategoryIcon = cat.icon;

  const timeAgo = formatTimeAgo(createdAt);

  return (
    <Card
      className={cn(
        'transition-all',
        severity === 'critical' && 'border-red-200 dark:border-red-800',
        status === 'new' && 'border-l-4 border-l-blue-500'
      )}
    >
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', cat.color)}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {cat.label}
            </Badge>
            <Badge className={cn('text-xs', stat.color)}>{stat.label}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn('h-2 w-2 rounded-full', sev.dotColor)} />
            <span className={cn('text-xs font-medium', sev.color)}>
              {sev.label}
            </span>
          </div>
        </div>

        {/* Title & Summary */}
        <div>
          <h3 className="font-semibold text-sm leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {summary}
          </p>
        </div>

        {/* Relevance */}
        <div className="p-2 rounded-md bg-muted/50 border-l-2 border-primary">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Why it matters:</span>{' '}
            {relevanceReason}
          </p>
        </div>

        {/* Affected Companies */}
        {companyNames && companyNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {companyNames.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {name.split(' ')[0]}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{source}</span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
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
          <div className="flex items-center gap-1">
            {status === 'new' && onMarkTracking && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkTracking();
                }}
              >
                Track
              </Button>
            )}
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
