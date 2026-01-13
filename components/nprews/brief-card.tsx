'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  ChevronRight,
  Users,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface BriefCardProps {
  id: string;
  title: string;
  summary: string;
  regimeBand: 'dormant' | 'emerging' | 'normalising' | 'pre_formal' | 'imminent';
  confidence: number;
  sectors: string[];
  recommendedAction: 'monitor' | 'review' | 'escalate';
  reviewStatus: 'pending' | 'approved' | 'dismissed' | 'escalated';
  actorCount: number;
  createdAt: number;
  onReview?: () => void;
}

const regimeBandConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  dormant: {
    label: 'Dormant',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  emerging: {
    label: 'Emerging',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  normalising: {
    label: 'Normalising',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  pre_formal: {
    label: 'Pre-Formal',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  imminent: {
    label: 'Imminent',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};

const actionConfig: Record<string, { icon: typeof Eye; color: string }> = {
  monitor: { icon: Eye, color: 'text-muted-foreground' },
  review: { icon: Clock, color: 'text-amber-600' },
  escalate: { icon: AlertTriangle, color: 'text-red-600' },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending Review', variant: 'outline' },
  approved: { label: 'Approved', variant: 'default' },
  dismissed: { label: 'Dismissed', variant: 'secondary' },
  escalated: { label: 'Escalated', variant: 'destructive' },
};

export function BriefCard({
  id,
  title,
  summary,
  regimeBand,
  confidence,
  sectors,
  recommendedAction,
  reviewStatus,
  actorCount,
  createdAt,
  onReview,
}: BriefCardProps) {
  const bandConfig = regimeBandConfig[regimeBand];
  const ActionIcon = actionConfig[recommendedAction].icon;
  const status = statusConfig[reviewStatus];

  const timeAgo = formatTimeAgo(createdAt);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', bandConfig.bgColor, bandConfig.color)}>
                {bandConfig.label}
              </Badge>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ActionIcon
              className={cn('h-4 w-4', actionConfig[recommendedAction].color)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1">
          {sectors.slice(0, 3).map((sector) => (
            <Badge key={sector} variant="outline" className="text-xs capitalize">
              {sector.replace('_', ' ')}
            </Badge>
          ))}
          {sectors.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{sectors.length - 3}
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{actorCount} actors</span>
            </div>
          </div>
          <span>{timeAgo}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link href={`/nprews/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Brief
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          {reviewStatus === 'pending' && onReview && (
            <Button size="sm" onClick={onReview}>
              Review
            </Button>
          )}
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
