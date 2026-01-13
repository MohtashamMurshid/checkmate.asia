'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SignalCard } from './signal-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, RefreshCw } from 'lucide-react';
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

interface Signal {
  _id: Id<'signals'>;
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
  companyIds: Id<'portfolioCompanies'>[];
}

interface Company {
  _id: Id<'portfolioCompanies'>;
  name: string;
}

interface SignalFeedProps {
  signals: Signal[];
  companies: Company[];
  selectedCompanyId?: Id<'portfolioCompanies'>;
  onToggleBookmark?: (id: Id<'signals'>) => void;
  onMarkTracking?: (id: Id<'signals'>) => void;
  onRefresh?: () => void;
  className?: string;
  maxHeight?: string;
}

export function SignalFeed({
  signals,
  companies,
  selectedCompanyId,
  onToggleBookmark,
  onMarkTracking,
  onRefresh,
  className,
  maxHeight = '600px',
}: SignalFeedProps) {
  const [categoryFilter, setCategoryFilter] = useState<SignalCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<SignalSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SignalStatus | 'all'>('all');

  // Filter signals
  let filteredSignals = signals;

  if (selectedCompanyId) {
    filteredSignals = filteredSignals.filter((s) =>
      s.companyIds.includes(selectedCompanyId)
    );
  }

  if (categoryFilter !== 'all') {
    filteredSignals = filteredSignals.filter((s) => s.category === categoryFilter);
  }

  if (severityFilter !== 'all') {
    filteredSignals = filteredSignals.filter((s) => s.severity === severityFilter);
  }

  if (statusFilter !== 'all') {
    filteredSignals = filteredSignals.filter((s) => s.status === statusFilter);
  }

  // Sort by creation date
  filteredSignals = [...filteredSignals].sort((a, b) => b.createdAt - a.createdAt);

  // Company name map
  const companyMap = new Map(companies.map((c) => [c._id, c.name]));

  // Stats
  const newCount = signals.filter((s) => s.status === 'new').length;
  const criticalCount = signals.filter((s) => s.severity === 'critical').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Signal Feed
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredSignals.length} of {signals.length}
          </span>
          {newCount > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-500">
              {newCount} new
            </span>
          )}
          {criticalCount > 0 && (
            <span className="text-xs text-red-600 dark:text-red-500">
              {criticalCount} critical
            </span>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as SignalCategory | 'all')}
        >
          <SelectTrigger className="w-28 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="geopolitical">Geopolitical</SelectItem>
            <SelectItem value="economic">Economic</SelectItem>
            <SelectItem value="regulatory">Regulatory</SelectItem>
            <SelectItem value="supply_chain">Supply Chain</SelectItem>
            <SelectItem value="climate">Climate</SelectItem>
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={severityFilter}
          onValueChange={(v) => setSeverityFilter(v as SignalSeverity | 'all')}
        >
          <SelectTrigger className="w-24 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SignalStatus | 'all')}
        >
          <SelectTrigger className="w-24 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="tracking">Tracking</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {(categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-zinc-500 hover:text-zinc-700"
            onClick={() => {
              setCategoryFilter('all');
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Signal List */}
      <ScrollArea style={{ maxHeight }} className="pr-4">
        <div className="space-y-3">
          {filteredSignals.length > 0 ? (
            filteredSignals.map((signal) => (
              <SignalCard
                key={signal._id}
                id={signal._id}
                title={signal.title}
                summary={signal.summary}
                category={signal.category}
                severity={signal.severity}
                relevanceReason={signal.relevanceReason}
                source={signal.source}
                sourceUrl={signal.sourceUrl}
                isBookmarked={signal.isBookmarked}
                status={signal.status}
                createdAt={signal.createdAt}
                companyNames={signal.companyIds
                  .map((id) => companyMap.get(id))
                  .filter(Boolean) as string[]}
                onToggleBookmark={
                  onToggleBookmark ? () => onToggleBookmark(signal._id) : undefined
                }
                onMarkTracking={
                  onMarkTracking && signal.status === 'new'
                    ? () => onMarkTracking(signal._id)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No signals match filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
