'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SignalCard } from './signal-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Filter,
  AlertTriangle,
  Bookmark,
  RefreshCw,
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
  const [categoryFilter, setCategoryFilter] = useState<SignalCategory | 'all'>(
    'all'
  );
  const [severityFilter, setSeverityFilter] = useState<SignalSeverity | 'all'>(
    'all'
  );
  const [statusFilter, setStatusFilter] = useState<SignalStatus | 'all'>('all');

  // Filter signals
  let filteredSignals = signals;

  // Filter by selected company
  if (selectedCompanyId) {
    filteredSignals = filteredSignals.filter((s) =>
      s.companyIds.includes(selectedCompanyId)
    );
  }

  // Filter by category
  if (categoryFilter !== 'all') {
    filteredSignals = filteredSignals.filter(
      (s) => s.category === categoryFilter
    );
  }

  // Filter by severity
  if (severityFilter !== 'all') {
    filteredSignals = filteredSignals.filter(
      (s) => s.severity === severityFilter
    );
  }

  // Filter by status
  if (statusFilter !== 'all') {
    filteredSignals = filteredSignals.filter((s) => s.status === statusFilter);
  }

  // Sort by creation date (newest first)
  filteredSignals = [...filteredSignals].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  // Get company name map
  const companyMap = new Map(companies.map((c) => [c._id, c.name]));

  // Stats
  const newCount = signals.filter((s) => s.status === 'new').length;
  const criticalCount = signals.filter((s) => s.severity === 'critical').length;
  const bookmarkedCount = signals.filter((s) => s.isBookmarked).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Signal Feed</h2>
          <Badge variant="secondary">{filteredSignals.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {newCount} new
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {criticalCount} critical
            </Badge>
          )}
          {bookmarkedCount > 0 && (
            <Badge variant="outline">
              <Bookmark className="h-3 w-3 mr-1" />
              {bookmarkedCount}
            </Badge>
          )}
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as SignalCategory | 'all')}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
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
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
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
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="tracking">Tracking</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {(categoryFilter !== 'all' ||
          severityFilter !== 'all' ||
          statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setCategoryFilter('all');
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear filters
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
                  onToggleBookmark
                    ? () => onToggleBookmark(signal._id)
                    : undefined
                }
                onMarkTracking={
                  onMarkTracking && signal.status === 'new'
                    ? () => onMarkTracking(signal._id)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No signals match filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
