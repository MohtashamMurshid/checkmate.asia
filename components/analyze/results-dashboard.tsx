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
  Shield,
  Zap,
  Route,
  TrendingUp,
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
  hash?: string;
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
  // New fields for routed pipeline
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  routingDecision?: {
    intent: string;
    confidence: number;
    agentsNeeded: string[];
    reasoning: string;
  };
  agentsRun?: string[];
  fromCache?: boolean;
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
  // New risk score stats
  risk?: {
    avgScore: number;
    highRiskCount: number;
    distribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
}

interface PipelineMetrics {
  routerDecisions: {
    factCheck: number;
    biasCheck: number;
    sentiment: number;
    safe: number;
  };
  cacheHits: number;
  cacheMisses: number;
  avgRiskScore: number;
  highRiskCount: number;
  processingTimeMs: number;
  costSavings: {
    totalPossibleAgentCalls: number;
    actualAgentCalls: number;
    savedCalls: number;
    savingsPercent: number;
  };
}

interface ResultsDashboardProps {
  results: RowResult[];
  stats: Stats;
  metrics?: PipelineMetrics;
  className?: string;
}

export function ResultsDashboard({ results, stats, metrics, className }: ResultsDashboardProps) {
  const [filterType, setFilterType] = useState<'all' | 'flagged' | 'highRisk' | 'errors'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filteredResults = useMemo(() => {
    switch (filterType) {
      case 'flagged':
        return results.filter(r => r.bias?.flagged);
      case 'highRisk':
        return results.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical');
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
      'Risk Score',
      'Risk Level',
      'Bias Score',
      'Bias Flagged',
      'Gender Bias',
      'Religion Bias',
      'Political Bias',
      'Sentiment',
      'Sentiment Confidence',
      'Fact Check Status',
      'Fact Check Confidence',
      'Agents Run',
      'From Cache',
    ];
    
    const rows = results.map(r => [
      r.index + 1,
      `"${r.text.replace(/"/g, '""')}"`,
      r.riskScore ?? '',
      r.riskLevel ?? '',
      r.bias?.overallBiasScore ?? '',
      r.bias?.flagged ? 'Yes' : 'No',
      r.bias?.gender.score ?? '',
      r.bias?.religion.score ?? '',
      r.bias?.political.score ?? '',
      r.sentiment?.sentiment ?? '',
      r.sentiment?.confidence ?? '',
      r.factCheck?.status ?? '',
      r.factCheck?.confidence ?? '',
      r.agentsRun?.join(';') ?? '',
      r.fromCache ? 'Yes' : 'No',
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
      {/* Risk Score Summary - New! */}
      {stats.risk && (
        <RiskScoreCard stats={stats.risk} metrics={metrics} />
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BiasStatsCard stats={stats.bias} />
        <SentimentStatsCard stats={stats.sentiment} />
        <FactCheckStatsCard stats={stats.factCheck} />
      </div>

      {/* Pipeline Metrics - New! */}
      {metrics && <PipelineMetricsCard metrics={metrics} />}

      {/* Risk Heatmap - New! */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="size-5" />
            Risk Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskHeatmap results={results} />
        </CardContent>
      </Card>

      {/* Bias Heatmap */}
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
                  {filterType === 'all' ? 'All' : filterType === 'flagged' ? 'Flagged' : filterType === 'highRisk' ? 'High Risk' : 'Errors'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All ({results.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('highRisk')}>
                  High Risk ({results.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length})
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
                  <TableHead className="w-20 text-center">Risk</TableHead>
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

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
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
          result.riskLevel === 'critical' && 'bg-red-100/50',
          result.riskLevel === 'high' && 'bg-red-50/50',
          !result.riskLevel && result.bias?.flagged && 'bg-red-50/50'
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
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 text-sm">{result.text}</span>
            {result.fromCache && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                <Zap className="size-2.5 mr-0.5" />
                cached
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          {result.riskScore !== undefined ? (
            <Badge className={cn('font-mono text-xs', getRiskColor(result.riskLevel))}>
              {result.riskScore}
            </Badge>
          ) : result.error ? (
            <Badge variant="destructive">Err</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
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
          <TableCell colSpan={7} className="bg-muted/30 p-4">
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
      {/* Risk Score & Routing Info - New! */}
      {(result.riskScore !== undefined || result.routingDecision) && (
        <div className="flex flex-wrap gap-4 p-3 bg-background rounded border">
          {result.riskScore !== undefined && (
            <div className="flex items-center gap-2">
              <Shield className={cn(
                'size-4',
                result.riskLevel === 'critical' && 'text-red-700',
                result.riskLevel === 'high' && 'text-red-500',
                result.riskLevel === 'medium' && 'text-amber-500',
                result.riskLevel === 'low' && 'text-green-500'
              )} />
              <span className="text-sm font-medium">Risk Score: {result.riskScore}/100</span>
              <Badge variant={
                result.riskLevel === 'critical' ? 'destructive' :
                result.riskLevel === 'high' ? 'destructive' :
                result.riskLevel === 'medium' ? 'default' : 'secondary'
              } className="capitalize">
                {result.riskLevel}
              </Badge>
            </div>
          )}
          {result.routingDecision && (
            <div className="flex items-center gap-2">
              <Route className="size-4 text-blue-500" />
              <span className="text-sm">
                Intent: <span className="font-medium capitalize">{result.routingDecision.intent}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                ({Math.round(result.routingDecision.confidence * 100)}% confidence)
              </span>
            </div>
          )}
          {result.agentsRun && result.agentsRun.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span className="text-sm">Agents:</span>
              <div className="flex gap-1">
                {result.agentsRun.map(agent => (
                  <Badge key={agent} variant="outline" className="text-xs capitalize">
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {result.fromCache && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="size-3 mr-1" />
              From Cache
            </Badge>
          )}
        </div>
      )}

      {/* Full text */}
      <div>
        <h4 className="text-sm font-medium mb-1">Full Text</h4>
        <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
          {result.text}
        </p>
      </div>

      {/* Routing Reasoning - New! */}
      {result.routingDecision?.reasoning && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200 text-blue-800 text-sm">
          <span className="font-medium">Router Decision:</span> {result.routingDecision.reasoning}
        </div>
      )}

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

// ============================================
// New Components for Risk Score & Routing
// ============================================

function RiskScoreCard({ stats, metrics }: { stats: NonNullable<Stats['risk']>; metrics?: PipelineMetrics }) {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-amber-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const total = stats.distribution.low + stats.distribution.medium + stats.distribution.high + stats.distribution.critical;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          Overall Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Score */}
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <span className={cn('text-5xl font-bold', getRiskColor(stats.avgScore))}>
                {Math.round(stats.avgScore)}
              </span>
              <span className="text-xl text-muted-foreground mb-1">/100</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Average risk score across all analyzed rows
            </p>
            {stats.highRiskCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                {stats.highRiskCount} high-risk items
              </Badge>
            )}
          </div>

          {/* Risk Distribution */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Risk Distribution</span>
            <div className="space-y-1.5">
              <RiskDistributionBar label="Low" count={stats.distribution.low} total={total} color="bg-green-500" />
              <RiskDistributionBar label="Medium" count={stats.distribution.medium} total={total} color="bg-yellow-500" />
              <RiskDistributionBar label="High" count={stats.distribution.high} total={total} color="bg-orange-500" />
              <RiskDistributionBar label="Critical" count={stats.distribution.critical} total={total} color="bg-red-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskDistributionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-14 text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs w-8 text-right">{count}</span>
    </div>
  );
}

function PipelineMetricsCard({ metrics }: { metrics: PipelineMetrics }) {
  const totalRouterDecisions = metrics.routerDecisions.factCheck + metrics.routerDecisions.biasCheck + 
                               metrics.routerDecisions.sentiment + metrics.routerDecisions.safe;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="size-5 text-blue-500" />
          Pipeline Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Cost Savings */}
          <div className="space-y-1 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 text-green-700">
              <Zap className="size-4" />
              <span className="text-xs font-medium">Cost Savings</span>
            </div>
            <span className="text-2xl font-bold text-green-700">{metrics.costSavings.savingsPercent}%</span>
            <p className="text-[10px] text-green-600">
              {metrics.costSavings.savedCalls} API calls saved
            </p>
          </div>

          {/* Processing Time */}
          <div className="space-y-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 text-blue-700">
              <Zap className="size-4" />
              <span className="text-xs font-medium">Processing Time</span>
            </div>
            <span className="text-2xl font-bold text-blue-700">
              {(metrics.processingTimeMs / 1000).toFixed(1)}s
            </span>
            <p className="text-[10px] text-blue-600">Total analysis time</p>
          </div>

          {/* Cache Performance */}
          <div className="space-y-1 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-1 text-purple-700">
              <Zap className="size-4" />
              <span className="text-xs font-medium">Cache Hits</span>
            </div>
            <span className="text-2xl font-bold text-purple-700">{metrics.cacheHits}</span>
            <p className="text-[10px] text-purple-600">
              {metrics.cacheMisses} cache misses
            </p>
          </div>

          {/* Router Decisions */}
          <div className="space-y-1 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-1 text-amber-700">
              <Route className="size-4" />
              <span className="text-xs font-medium">Router Skips</span>
            </div>
            <span className="text-2xl font-bold text-amber-700">{metrics.routerDecisions.safe}</span>
            <p className="text-[10px] text-amber-600">
              Safe content skipped
            </p>
          </div>
        </div>

        {/* Router Decision Breakdown */}
        <div className="mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Router Decisions</span>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Scale className="size-3" />
              Bias: {metrics.routerDecisions.biasCheck}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Heart className="size-3" />
              Sentiment: {metrics.routerDecisions.sentiment}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Search className="size-3" />
              Fact Check: {metrics.routerDecisions.factCheck}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" />
              Safe (Skipped): {metrics.routerDecisions.safe}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskHeatmap({ results }: { results: RowResult[] }) {
  const maxRows = 50;
  const displayResults = results.slice(0, maxRows);
  
  const getColor = (riskScore?: number, riskLevel?: string) => {
    if (riskScore === undefined) return 'bg-gray-300';
    if (riskLevel === 'critical') return 'bg-red-600';
    if (riskLevel === 'high') return 'bg-orange-500';
    if (riskLevel === 'medium') return 'bg-amber-400';
    if (riskLevel === 'low') return 'bg-green-400';
    // Fallback based on score
    if (riskScore >= 70) return 'bg-red-600';
    if (riskScore >= 50) return 'bg-orange-500';
    if (riskScore >= 30) return 'bg-amber-400';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Rows (each cell = 1 row)</span>
        <div className="flex items-center gap-2">
          <span>Low risk</span>
          <div className="flex gap-0.5">
            <div className="size-3 rounded bg-green-400" />
            <div className="size-3 rounded bg-amber-400" />
            <div className="size-3 rounded bg-orange-500" />
            <div className="size-3 rounded bg-red-600" />
          </div>
          <span>Critical risk</span>
        </div>
      </div>
      
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12px, 1fr))' }}>
        {displayResults.map((result) => (
          <div
            key={result.index}
            className={cn(
              'aspect-square rounded-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all',
              result.error ? 'bg-gray-300' : getColor(result.riskScore, result.riskLevel)
            )}
            title={`Row ${result.index + 1}: Risk ${result.riskScore ?? 'N/A'} (${result.riskLevel ?? 'unknown'})`}
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

