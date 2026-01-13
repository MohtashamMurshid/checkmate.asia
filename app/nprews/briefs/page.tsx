'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BriefCard } from '@/components/nprews/brief-card';
import { FileText, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ReviewStatus = 'all' | 'pending' | 'approved' | 'dismissed' | 'escalated';

export default function BriefsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all');

  const briefs = useQuery(api.briefs.getNarrativeBriefs, {
    limit: 100,
    reviewStatus: statusFilter === 'all' ? undefined : statusFilter,
  });

  const statusCounts = {
    all: briefs?.length ?? 0,
    pending: briefs?.filter((b) => b.reviewStatus === 'pending').length ?? 0,
    approved: briefs?.filter((b) => b.reviewStatus === 'approved').length ?? 0,
    dismissed: briefs?.filter((b) => b.reviewStatus === 'dismissed').length ?? 0,
    escalated: briefs?.filter((b) => b.reviewStatus === 'escalated').length ?? 0,
  };

  const filteredBriefs = statusFilter === 'all' 
    ? briefs 
    : briefs?.filter((b) => b.reviewStatus === statusFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Narrative Briefs</h1>
          <p className="text-muted-foreground">
            All generated narrative briefs from NPREWS analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReviewStatus)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">
                Pending ({statusCounts.pending})
              </SelectItem>
              <SelectItem value="approved">
                Approved ({statusCounts.approved})
              </SelectItem>
              <SelectItem value="dismissed">
                Dismissed ({statusCounts.dismissed})
              </SelectItem>
              <SelectItem value="escalated">
                Escalated ({statusCounts.escalated})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Briefs Grid */}
      {filteredBriefs && filteredBriefs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBriefs.map((brief) => (
            <BriefCard
              key={brief._id}
              id={brief._id}
              title={brief.title}
              summary={brief.summary}
              regimeBand={brief.regimeBand}
              confidence={brief.confidence}
              sectors={brief.sectors}
              recommendedAction={brief.recommendedAction}
              reviewStatus={brief.reviewStatus}
              actorCount={brief.actors.length}
              createdAt={brief.createdAt}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No Briefs Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {statusFilter === 'all'
                ? 'Analyze content from the dashboard to generate narrative briefs'
                : `No briefs with "${statusFilter}" status`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
