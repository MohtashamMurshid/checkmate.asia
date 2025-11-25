'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  Scale,
  Heart,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Filter,
  BarChart3,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RowResult {
  index: number;
  text: string;
  bias?: {
    gender: { score: number; direction: string; examples: string[] };
    religion: { score: number; targetReligion?: string; examples: string[] };
    political: { score: number; leaning: string; examples: string[] };
    overallBiasScore: number;
    flagged: boolean;
    summary: string;
  };
  sentiment?: {
    sentiment: string;
    confidence: number;
    scores: { positive: number; negative: number; neutral: number };
    reasoning: string;
  };
  factCheck?: {
    verified: boolean;
    status: string;
    confidence: number;
    findings: Array<{
      claim: string;
      verdict: string;
      source?: string;
      explanation: string;
    }>;
    summary: string;
    skipped?: boolean;
  };
  error?: string;
}

interface Stats {
  bias: {
    avgScore: number;
    flaggedCount: number;
    breakdown: {
      gender: { avg: number; flagged: number };
      religion: { avg: number; flagged: number };
      political: { avg: number; flagged: number };
    };
  };
  sentiment: {
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
      mixed: number;
    };
    avgConfidence: number;
  };
  factCheck: {
    distribution: {
      verified: number;
      disputed: number;
      unverified: number;
      mixed: number;
      noClaims: number;
    };
    avgConfidence: number;
  };
}

interface ResultsDashboardProps {
  results: RowResult[];
  stats: Stats;
  className?: string;
}

export function ResultsDashboard({ results, stats, className }: ResultsDashboardProps) {
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'errors'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filteredResults = useMemo(() => {
    switch (filterType) {
      case 'flagged':
        return results.filter(r => r.bias?.flagged);
      case 'errors':
        return results.filter(r => r.error);
      default:
        return results;
    }
  }, [results, filterType]);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      stats,
      results,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = [
      'Row',
      'Text',
      'Bias Score',
      'Bias Flagged',
      'Gender Bias',
      'Religion Bias',
      'Political Bias',
      'Sentiment',
      'Sentiment Confidence',
      'Fact Check Status',
      'Fact Check Confidence',
    ];
    
    const rows = results.map(r => [
      r.index + 1,
      `"${r.text.replace(/"/g, '""')}"`,
      r.bias?.overallBiasScore ?? '',
      r.bias?.flagged ? 'Yes' : 'No',
      r.bias?.gender.score ?? '',
      r.bias?.religion.score ?? '',
      r.bias?.political.score ?? '',
      r.sentiment?.sentiment ?? '',
      r.sentiment?.confidence ?? '',
      r.factCheck?.status ?? '',
      r.factCheck?.confidence ?? '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BiasStatsCard stats={stats.bias} />
        <SentimentStatsCard stats={stats.sentiment} />
        <FactCheckStatsCard stats={stats.factCheck} />
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="size-5" />
            Bias Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BiasHeatmap results={results} />
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TableIcon className="size-5" />
            Per-Message Verdicts
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="size-4" />
                  {filterType === 'all' ? 'All' : filterType === 'flagged' ? 'Flagged' : 'Errors'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All ({results.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('flagged')}>
                  Flagged ({results.filter(r => r.bias?.flagged).length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('errors')}>
                  Errors ({results.filter(r => r.error).length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Download className="size-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportJSON}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportCSV}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="min-w-[200px]">Text</TableHead>
                  <TableHead className="w-24 text-center">Bias</TableHead>
                  <TableHead className="w-24 text-center">Sentiment</TableHead>
                  <TableHead className="w-28 text-center">Fact Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <ResultTableRow
                    key={result.index}
                    result={result}
                    isExpanded={expandedRows.has(result.index)}
                    onToggle={() => toggleRow(result.index)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BiasStatsCard({ stats }: { stats: Stats['bias'] }) {
  const avgPercent = Math.round(stats.avgScore * 100);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Scale className="size-4 text-amber-500" />
          Bias Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold">{avgPercent}%</span>
            <span className="text-sm text-muted-foreground ml-1">avg</span>
          </div>
          <Badge variant={stats.flaggedCount > 0 ? 'destructive' : 'secondary'}>
            {stats.flaggedCount} flagged
          </Badge>
        </div>
        
        <div className="space-y-2">
          <BiasBar label="Gender" value={stats.breakdown.gender.avg} flagged={stats.breakdown.gender.flagged} />
          <BiasBar label="Religion" value={stats.breakdown.religion.avg} flagged={stats.breakdown.religion.flagged} />
          <BiasBar label="Political" value={stats.breakdown.political.avg} flagged={stats.breakdown.political.flagged} />
        </div>
      </CardContent>
    </Card>
  );
}

function BiasBar({ label, value, flagged }: { label: string; value: number; flagged: number }) {
  const percent = Math.round(value * 100);
  const color = value > 0.5 ? 'bg-red-500' : value > 0.3 ? 'bg-amber-500' : 'bg-green-500';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{percent}%{flagged > 0 && ` (${flagged} flagged)`}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SentimentStatsCard({ stats }: { stats: Stats['sentiment'] }) {
  const { distribution } = stats;
  const total = distribution.positive + distribution.negative + distribution.neutral + distribution.mixed;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="size-4 text-pink-500" />
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold">{Math.round(stats.avgConfidence * 100)}%</span>
            <span className="text-sm text-muted-foreground ml-1">confidence</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <SentimentBox label="Positive" count={distribution.positive} total={total} color="bg-green-500" />
          <SentimentBox label="Negative" count={distribution.negative} total={total} color="bg-red-500" />
          <SentimentBox label="Neutral" count={distribution.neutral} total={total} color="bg-gray-500" />
          <SentimentBox label="Mixed" count={distribution.mixed} total={total} color="bg-amber-500" />
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBox({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className={cn('h-12 rounded flex items-center justify-center text-white font-bold', color)} style={{ opacity: 0.2 + (percent / 100) * 0.8 }}>
        {count}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function FactCheckStatsCard({ stats }: { stats: Stats['factCheck'] }) {
  const { distribution } = stats;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="size-4 text-blue-500" />
          Fact Checking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold">{Math.round(stats.avgConfidence * 100)}%</span>
            <span className="text-sm text-muted-foreground ml-1">confidence</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-1">
            <Badge variant="default" className="bg-green-500">{distribution.verified} verified</Badge>
            <Badge variant="destructive">{distribution.disputed} disputed</Badge>
            <Badge variant="secondary">{distribution.noClaims} skipped</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {distribution.unverified > 0 && `${distribution.unverified} could not be verified. `}
            {distribution.mixed > 0 && `${distribution.mixed} have mixed results.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function BiasHeatmap({ results }: { results: RowResult[] }) {
  const maxRows = 50; // Limit display for performance
  const displayResults = results.slice(0, maxRows);
  
  const getColor = (score: number) => {
    if (score > 0.7) return 'bg-red-500';
    if (score > 0.5) return 'bg-orange-500';
    if (score > 0.3) return 'bg-amber-400';
    if (score > 0.1) return 'bg-yellow-300';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Rows (each cell = 1 row)</span>
        <div className="flex items-center gap-2">
          <span>Low bias</span>
          <div className="flex gap-0.5">
            <div className="size-3 rounded bg-green-400" />
            <div className="size-3 rounded bg-yellow-300" />
            <div className="size-3 rounded bg-amber-400" />
            <div className="size-3 rounded bg-orange-500" />
            <div className="size-3 rounded bg-red-500" />
          </div>
          <span>High bias</span>
        </div>
      </div>
      
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12px, 1fr))' }}>
        {displayResults.map((result) => (
          <div
            key={result.index}
            className={cn(
              'aspect-square rounded-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all',
              result.error ? 'bg-gray-300' : getColor(result.bias?.overallBiasScore || 0)
            )}
            title={`Row ${result.index + 1}: ${result.bias?.overallBiasScore ? Math.round(result.bias.overallBiasScore * 100) + '% bias' : 'No data'}`}
          />
        ))}
      </div>
      
      {results.length > maxRows && (
        <p className="text-xs text-muted-foreground text-center">
          Showing first {maxRows} of {results.length} rows
        </p>
      )}
    </div>
  );
}

function ResultTableRow({ 
  result, 
  isExpanded, 
  onToggle 
}: { 
  result: RowResult; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const getBiasColor = (score: number) => {
    if (score > 0.5) return 'text-red-600 bg-red-50';
    if (score > 0.3) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'mixed': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFactCheckIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="size-4 text-green-500" />;
      case 'disputed': return <XCircle className="size-4 text-red-500" />;
      case 'no_claims': return <HelpCircle className="size-4 text-gray-400" />;
      default: return <AlertTriangle className="size-4 text-amber-500" />;
    }
  };

  return (
    <>
      <TableRow 
        className={cn(
          'cursor-pointer hover:bg-muted/50',
          result.bias?.flagged && 'bg-red-50/50'
        )}
        onClick={onToggle}
      >
        <TableCell className="p-2">
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">{result.index + 1}</TableCell>
        <TableCell>
          <span className="line-clamp-1 text-sm">{result.text}</span>
        </TableCell>
        <TableCell className="text-center">
          {result.bias ? (
            <Badge className={cn('font-mono', getBiasColor(result.bias.overallBiasScore))}>
              {Math.round(result.bias.overallBiasScore * 100)}%
            </Badge>
          ) : result.error ? (
            <Badge variant="destructive">Error</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          {result.sentiment ? (
            <Badge className={cn(getSentimentColor(result.sentiment.sentiment))}>
              {result.sentiment.sentiment}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          {result.factCheck ? (
            <div className="flex items-center justify-center gap-1">
              {getFactCheckIcon(result.factCheck.status)}
              <span className="text-xs capitalize">{result.factCheck.status.replace('_', ' ')}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-4">
            <ExpandedResultDetails result={result} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedResultDetails({ result }: { result: RowResult }) {
  return (
    <div className="space-y-4">
      {/* Full text */}
      <div>
        <h4 className="text-sm font-medium mb-1">Full Text</h4>
        <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
          {result.text}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Bias details */}
        {result.bias && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bias Analysis</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Gender:</span>
                <span>{Math.round(result.bias.gender.score * 100)}% ({result.bias.gender.direction})</span>
              </div>
              <div className="flex justify-between">
                <span>Religion:</span>
                <span>{Math.round(result.bias.religion.score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Political:</span>
                <span>{Math.round(result.bias.political.score * 100)}% ({result.bias.political.leaning})</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{result.bias.summary}</p>
          </div>
        )}

        {/* Sentiment details */}
        {result.sentiment && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sentiment</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Classification:</span>
                <span className="capitalize">{result.sentiment.sentiment}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span>{Math.round(result.sentiment.confidence * 100)}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{result.sentiment.reasoning}</p>
          </div>
        )}

        {/* Fact check details */}
        {result.factCheck && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Fact Check</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize">{result.factCheck.status.replace('_', ' ')}</span>
              </div>
              {result.factCheck.status !== 'no_claims' && (
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span>{Math.round(result.factCheck.confidence * 100)}%</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{result.factCheck.summary}</p>
            
            {result.factCheck.findings && result.factCheck.findings.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.factCheck.findings.map((finding, i) => (
                  <div key={i} className="text-xs p-2 bg-background rounded border">
                    <span className={cn(
                      'font-medium',
                      finding.verdict === 'true' && 'text-green-600',
                      finding.verdict === 'false' && 'text-red-600',
                      finding.verdict === 'partially_true' && 'text-amber-600'
                    )}>
                      {finding.verdict.replace('_', ' ')}:
                    </span>{' '}
                    {finding.claim}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {result.error && (
        <div className="p-3 bg-red-50 rounded border border-red-200 text-red-700 text-sm">
          Error: {result.error}
        </div>
      )}
    </div>
  );
}

