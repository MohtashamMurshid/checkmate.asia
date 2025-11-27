'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Columns,
  Scale,
  Heart,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResultsDashboard } from '@/components/analyze/results-dashboard';

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const analysis = useQuery(api.datasetAnalyses.get, {
    id: id as Id<'datasetAnalyses'>,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (analysis === undefined) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/analyze/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysis === null) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/analyze/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Analysis Not Found</h1>
            <p className="text-muted-foreground">
              This analysis may have been deleted.
            </p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">
              The requested analysis could not be found.
            </p>
            <Link href="/analyze/history">
              <Button>Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/analyze/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="size-6" />
              {analysis.fileName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="size-4" />
              {formatDate(analysis.timestamp)}
            </p>
          </div>
        </div>
        <Link href="/analyze">
          <Button>New Analysis</Button>
        </Link>
      </div>

      {/* Analysis Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{analysis.fileType.toUpperCase()}</Badge>
              <span className="text-sm text-muted-foreground">
                {analysis.rowCount} rows analyzed
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Columns className="size-4" />
              Column: <span className="font-medium">{analysis.textColumn}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Agents:</span>
              {analysis.options.checkBias && (
                <Badge variant="secondary" className="gap-1">
                  <Scale className="size-3" /> Bias
                </Badge>
              )}
              {analysis.options.checkSentiment && (
                <Badge variant="secondary" className="gap-1">
                  <Heart className="size-3" /> Sentiment
                </Badge>
              )}
              {analysis.options.checkFacts && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="size-3" /> Facts
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Dashboard */}
      <ResultsDashboard results={analysis.results} stats={analysis.stats} />
    </div>
  );
}


