'use client';

import { useState, useCallback } from 'react';
import { 
  BarChart3, 
  Upload, 
  Sparkles, 
  ArrowLeft,
  RefreshCw,
  Scale,
  Heart,
  Search,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploader, type ParsedData } from '@/components/analyze/file-uploader';
import { DataPreview } from '@/components/analyze/data-preview';
import { AnalysisProgress } from '@/components/analyze/analysis-progress';
import { ResultsDashboard } from '@/components/analyze/results-dashboard';

type AppState = 'upload' | 'preview' | 'analyzing' | 'results';

interface RowResult {
  index: number;
  text: string;
  bias?: any;
  sentiment?: any;
  factCheck?: any;
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

export default function AnalyzePage() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [results, setResults] = useState<RowResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  
  // Analysis options
  const [options, setOptions] = useState({
    checkBias: true,
    checkSentiment: true,
    checkFacts: true,
  });

  const handleDataParsed = useCallback((data: ParsedData) => {
    setParsedData(data);
    setSelectedColumn(data.textColumn || data.headers[0]);
    setAppState('preview');
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    if (!parsedData || !selectedColumn) return;

    // Extract text from selected column
    const rows = parsedData.rows
      .map(row => row[selectedColumn])
      .filter(text => text && text.trim().length > 0);

    if (rows.length === 0) {
      alert('No valid text rows found in selected column');
      return;
    }

    setAppState('analyzing');
    setResults([]);
    setProgress({ completed: 0, total: rows.length });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, options }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'row') {
                setResults(prev => [...prev, data.result]);
              } else if (data.type === 'progress') {
                setProgress({ completed: data.completed, total: data.total });
              } else if (data.type === 'complete') {
                setStats(data.stats);
                setAppState('results');
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAppState('preview');
    }
  }, [parsedData, selectedColumn, options]);

  const handleReset = useCallback(() => {
    setAppState('upload');
    setParsedData(null);
    setSelectedColumn('');
    setResults([]);
    setStats(null);
    setProgress({ completed: 0, total: 0 });
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setResults([]);
    setStats(null);
    setAppState('preview');
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <BarChart3 className="size-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dataset Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Analyze your dataset for bias, sentiment, and factual accuracy using AI agents
          </p>
        </div>
        
        {appState !== 'upload' && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="size-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 px-4">
        {['Upload', 'Preview', 'Analyze', 'Results'].map((step, i) => {
          const stepState = ['upload', 'preview', 'analyzing', 'results'][i];
          const isActive = appState === stepState;
          const isPast = ['upload', 'preview', 'analyzing', 'results'].indexOf(appState) > i;
          
          return (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && (
                <div className={cn(
                  'h-0.5 w-8 md:w-16 rounded',
                  isPast ? 'bg-primary' : 'bg-muted'
                )} />
              )}
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                isActive && 'bg-primary text-primary-foreground',
                isPast && !isActive && 'bg-primary/20 text-primary',
                !isActive && !isPast && 'bg-muted text-muted-foreground'
              )}>
                <span className={cn(
                  'size-5 rounded-full flex items-center justify-center text-xs',
                  isActive && 'bg-primary-foreground/20',
                  isPast && !isActive && 'bg-primary/30',
                  !isActive && !isPast && 'bg-muted-foreground/20'
                )}>
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      {appState === 'upload' && (
        <div className="space-y-6">
          <FileUploader onDataParsed={handleDataParsed} />
          
          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={Scale}
              title="Bias Detection"
              description="Identifies gender, religious, and political bias with severity scores"
              color="amber"
            />
            <FeatureCard
              icon={Heart}
              title="Sentiment Analysis"
              description="Classifies emotional tone and provides confidence breakdown"
              color="pink"
            />
            <FeatureCard
              icon={Search}
              title="Smart Fact Check"
              description="Verifies factual claims with web search, skips opinions"
              color="blue"
            />
          </div>
        </div>
      )}

      {appState === 'preview' && parsedData && (
        <div className="space-y-6">
          {/* Analysis Options */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <span className="text-sm font-medium">Analysis Options:</span>
                <OptionToggle
                  icon={Scale}
                  label="Bias Detection"
                  checked={options.checkBias}
                  onChange={(checked) => setOptions(prev => ({ ...prev, checkBias: checked }))}
                  color="amber"
                />
                <OptionToggle
                  icon={Heart}
                  label="Sentiment"
                  checked={options.checkSentiment}
                  onChange={(checked) => setOptions(prev => ({ ...prev, checkSentiment: checked }))}
                  color="pink"
                />
                <OptionToggle
                  icon={Search}
                  label="Fact Check"
                  checked={options.checkFacts}
                  onChange={(checked) => setOptions(prev => ({ ...prev, checkFacts: checked }))}
                  color="blue"
                />
              </div>
            </CardContent>
          </Card>

          <DataPreview
            data={parsedData}
            selectedColumn={selectedColumn}
            onColumnChange={setSelectedColumn}
            onStartAnalysis={handleStartAnalysis}
          />
        </div>
      )}

      {appState === 'analyzing' && (
        <AnalysisProgress
          total={progress.total}
          completed={progress.completed}
          results={results}
          isComplete={false}
        />
      )}

      {appState === 'results' && stats && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-medium">Analysis Complete</span>
              <Badge variant="secondary">{results.length} rows processed</Badge>
            </div>
            <Button variant="outline" onClick={handleNewAnalysis} className="gap-2">
              <ArrowLeft className="size-4" />
              Analyze Again
            </Button>
          </div>
          
          <ResultsDashboard results={results} stats={stats} />
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'amber' | 'pink' | 'blue';
}) {
  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-600',
    pink: 'bg-pink-500/10 text-pink-600',
    blue: 'bg-blue-500/10 text-blue-600',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className={cn('p-2 rounded-lg w-fit mb-3', colorClasses[color])}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function OptionToggle({
  icon: Icon,
  label,
  checked,
  onChange,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: 'amber' | 'pink' | 'blue';
}) {
  const colorClasses = {
    amber: 'text-amber-600',
    pink: 'text-pink-600',
    blue: 'text-blue-600',
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={cn(
        'w-9 h-5 rounded-full transition-colors relative',
        checked ? 'bg-primary' : 'bg-muted'
      )}>
        <div className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
          checked && 'translate-x-4'
        )} />
      </div>
      <Icon className={cn('size-4', checked ? colorClasses[color] : 'text-muted-foreground')} />
      <span className={cn('text-sm', checked ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </label>
  );
}

