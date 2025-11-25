'use client';

import { useEffect, useState } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Heart, 
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface RowResult {
  index: number;
  text: string;
  bias?: any;
  sentiment?: any;
  factCheck?: any;
  error?: string;
}

interface AnalysisProgressProps {
  total: number;
  completed: number;
  results: RowResult[];
  isComplete: boolean;
  className?: string;
}

export function AnalysisProgress({
  total,
  completed,
  results,
  isComplete,
  className,
}: AnalysisProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  // Timer
  useEffect(() => {
    if (isComplete) return;
    
    const timer = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

  // Calculate real-time stats
  const successCount = results.filter(r => !r.error).length;
  const errorCount = results.filter(r => r.error).length;
  const flaggedCount = results.filter(r => r.bias?.flagged).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="size-5 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-primary/10">
                <Loader2 className="size-5 text-primary animate-spin" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">
                {isComplete ? 'Analysis Complete' : 'Analyzing Dataset...'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {completed} of {total} rows processed • {formatTime(elapsedTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="size-3 text-green-500" />
              {successCount}
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="size-3" />
                {errorCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}% complete</span>
            <span>
              {!isComplete && completed > 0 && (
                <>~{Math.ceil((total - completed) / 3 * 5)}s remaining</>
              )}
            </span>
          </div>
        </div>

        {/* Agent status */}
        <div className="grid grid-cols-3 gap-4">
          <AgentStatus
            icon={Scale}
            label="Bias Detection"
            count={results.filter(r => r.bias).length}
            total={completed}
            flagged={flaggedCount}
          />
          <AgentStatus
            icon={Heart}
            label="Sentiment"
            count={results.filter(r => r.sentiment).length}
            total={completed}
          />
          <AgentStatus
            icon={Search}
            label="Fact Check"
            count={results.filter(r => r.factCheck).length}
            total={completed}
            skipped={results.filter(r => r.factCheck?.skipped).length}
          />
        </div>

        {/* Live feed of recent results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {results.slice(-5).reverse().map((result) => (
                <ResultRow key={result.index} result={result} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgentStatus({
  icon: Icon,
  label,
  count,
  total,
  flagged,
  skipped,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  total: number;
  flagged?: number;
  skipped?: number;
}) {
  const isActive = count < total;
  
  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      isActive ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn(
          'size-4',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{count}</span>
        <div className="text-right">
          {flagged !== undefined && flagged > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {flagged} flagged
            </Badge>
          )}
          {skipped !== undefined && skipped > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {skipped} skipped
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: RowResult }) {
  const getStatusColor = () => {
    if (result.error) return 'text-red-500';
    if (result.bias?.flagged) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (result.error) return <XCircle className="size-3" />;
    if (result.bias?.flagged) return <Scale className="size-3" />;
    return <CheckCircle2 className="size-3" />;
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
      <span className={cn('shrink-0', getStatusColor())}>
        {getStatusIcon()}
      </span>
      <span className="text-muted-foreground shrink-0">Row {result.index + 1}</span>
      <span className="truncate flex-1">{result.text.substring(0, 60)}...</span>
      <div className="flex items-center gap-1 shrink-0">
        {result.sentiment && (
          <Badge variant="outline" className="text-[10px] px-1">
            {result.sentiment.sentiment}
          </Badge>
        )}
        {result.bias && (
          <Badge 
            variant={result.bias.flagged ? 'destructive' : 'secondary'} 
            className="text-[10px] px-1"
          >
            {Math.round(result.bias.overallBiasScore * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );
}

