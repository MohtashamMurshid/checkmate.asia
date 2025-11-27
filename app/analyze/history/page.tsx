'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import {
  History,
  FileText,
  Calendar,
  Scale,
  Heart,
  Search,
  Trash2,
  ChevronRight,
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AnalyzeHistoryPage() {
  const analyses = useQuery(api.datasetAnalyses.list);
  const deleteAnalysis = useMutation(api.datasetAnalyses.remove);
  const [deleteId, setDeleteId] = useState<Id<'datasetAnalyses'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteAnalysis({ id: deleteId });
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!analyses) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/analyze">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analyze">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="size-6" />
              Analysis History
            </h1>
            <p className="text-muted-foreground">
              {analyses.length} saved {analyses.length === 1 ? 'analysis' : 'analyses'}
            </p>
          </div>
        </div>
        <Link href="/analyze">
          <Button className="gap-2">
            <BarChart3 className="size-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {analyses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No analyses yet</h3>
            <p className="text-muted-foreground mb-4">
              Run your first dataset analysis to see results here
            </p>
            <Link href="/analyze">
              <Button>Start Analyzing</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Analysis List */}
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <AnalysisCard
            key={analysis._id}
            analysis={analysis}
            onDelete={() => setDeleteId(analysis._id)}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => !isDeleting && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Analysis</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this analysis? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnalysisCard({
  analysis,
  onDelete,
}: {
  analysis: {
    _id: Id<'datasetAnalyses'>;
    fileName: string;
    fileType: string;
    rowCount: number;
    textColumn: string;
    options: { checkBias: boolean; checkSentiment: boolean; checkFacts: boolean };
    stats: any;
    timestamp: number;
  };
  onDelete: () => void;
}) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { stats, options } = analysis;
  const biasScore = stats?.bias?.avgScore ?? 0;
  const flaggedCount = stats?.bias?.flaggedCount ?? 0;
  const sentimentDistribution = stats?.sentiment?.distribution ?? {};
  const dominantSentiment = Object.entries(sentimentDistribution)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ?? 'unknown';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <Link href={`/analyze/history/${analysis._id}`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{analysis.fileName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-3" />
                    {formatDate(analysis.timestamp)}
                    <span>•</span>
                    <span>{analysis.rowCount} rows</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {analysis.fileType.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {options.checkBias && (
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-amber-500" />
                  <div className="text-sm">
                    <span className="font-medium">{Math.round(biasScore * 100)}%</span>
                    <span className="text-muted-foreground"> avg bias</span>
                    {flaggedCount > 0 && (
                      <Badge variant="destructive" className="ml-2 text-[10px] px-1">
                        {flaggedCount} flagged
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {options.checkSentiment && (
                <div className="flex items-center gap-2">
                  <Heart className="size-4 text-pink-500" />
                  <div className="text-sm">
                    <span className="font-medium capitalize">{dominantSentiment}</span>
                    <span className="text-muted-foreground"> dominant</span>
                  </div>
                </div>
              )}
              {options.checkFacts && (
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-blue-500" />
                  <div className="text-sm">
                    <span className="font-medium">
                      {stats?.factCheck?.distribution?.verified ?? 0}
                    </span>
                    <span className="text-muted-foreground"> verified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Delete button */}
        <div className="px-6 pb-4 flex justify-end border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
          >
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


