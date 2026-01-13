'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RegimeBandIndicator, RegimeBandBadge } from '@/components/nprews/regime-band';
import { ActorTable, LegitimacyTransferCard } from '@/components/nprews/actor-table';
import { EvidenceList } from '@/components/nprews/evidence-list';
import {
  ChevronLeft,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Shield,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const briefId = params.id as Id<'narrativeBriefs'>;

  const brief = useQuery(api.briefs.getNarrativeBriefById, { id: briefId });
  const updateStatus = useMutation(api.briefs.updateBriefReviewStatus);
  const logAction = useMutation(api.auditLog.logAction);

  if (!brief) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading brief...</p>
        </div>
      </div>
    );
  }

  const handleReviewAction = async (
    status: 'approved' | 'dismissed' | 'escalated'
  ) => {
    await updateStatus({
      id: briefId,
      reviewStatus: status,
      reviewedBy: 'Current User', // In production, get from auth
    });

    await logAction({
      action: 'human_review',
      entityType: 'brief',
      entityId: briefId,
      details: { status, reviewedAt: Date.now() },
    });
  };

  const actionConfig = {
    monitor: { icon: Eye, label: 'Monitor', color: 'text-muted-foreground' },
    review: { icon: Clock, label: 'Review Required', color: 'text-amber-600' },
    escalate: { icon: AlertTriangle, label: 'Escalate', color: 'text-red-600' },
  };

  const ActionIcon = actionConfig[brief.recommendedAction].icon;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <RegimeBandBadge band={brief.regimeBand} />
              <Badge
                variant={
                  brief.reviewStatus === 'pending'
                    ? 'outline'
                    : brief.reviewStatus === 'approved'
                    ? 'default'
                    : brief.reviewStatus === 'escalated'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {brief.reviewStatus === 'pending'
                  ? 'Pending Review'
                  : brief.reviewStatus.charAt(0).toUpperCase() +
                    brief.reviewStatus.slice(1)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{brief.title}</h1>
            <p className="text-muted-foreground mt-2">{brief.summary}</p>
          </div>

          {/* Recommended Action */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              brief.recommendedAction === 'escalate'
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : brief.recommendedAction === 'review'
                ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                : 'border-muted bg-muted/50'
            }`}
          >
            <ActionIcon
              className={`h-5 w-5 ${actionConfig[brief.recommendedAction].color}`}
            />
            <span className="font-medium text-sm">
              {actionConfig[brief.recommendedAction].label}
            </span>
          </div>
        </div>

        {/* Regime Band Progress */}
        <Card>
          <CardContent className="pt-4">
            <RegimeBandIndicator band={brief.regimeBand} showLabels />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Why It Matters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Why It Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{brief.whyItMatters}</p>
            </CardContent>
          </Card>

          {/* Key Actors */}
          {brief.actors && brief.actors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Key Actors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ActorTable
                  actors={brief.actors.map((a) => ({
                    ...a,
                    role: a.role as 'originator' | 'amplifier' | 'legitimiser',
                  }))}
                />
              </CardContent>
            </Card>
          )}

          {/* Evidence */}
          {brief.evidence && brief.evidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Evidence ({brief.evidence.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceList evidence={brief.evidence} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brief Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Confidence */}
              <div>
                <span className="text-sm text-muted-foreground">Confidence</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${brief.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(brief.confidence * 100)}%
                  </span>
                </div>
              </div>

              <Separator />

              {/* Sectors */}
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Affected Sectors
                </span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {brief.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="capitalize">
                      {sector.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Types */}
              {brief.riskTypes && brief.riskTypes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Risk Types
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {brief.riskTypes.map((risk) => (
                        <Badge key={risk} variant="secondary" className="capitalize">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* National Priorities */}
              {brief.nationalPriorities && brief.nationalPriorities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      National Priorities
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {brief.nationalPriorities.map((priority) => (
                        <Badge
                          key={priority}
                          className="capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {priority.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Timestamps */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Detected: {new Date(brief.createdAt).toLocaleString()}
                  </span>
                </div>
                {brief.reviewedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      Reviewed: {new Date(brief.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {brief.reviewStatus === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleReviewAction('approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReviewAction('dismissed')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleReviewAction('escalated')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate to Leadership
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="font-medium">Brief Generated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(brief.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {brief.reviewedAt && (
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="font-medium">
                        {brief.reviewStatus.charAt(0).toUpperCase() +
                          brief.reviewStatus.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        By {brief.reviewedBy} at{' '}
                        {new Date(brief.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
