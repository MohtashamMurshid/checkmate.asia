'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BriefCard } from '@/components/nprews/brief-card';
import { RegimeBandIndicator } from '@/components/nprews/regime-band';
import { LegitimacyTransferCard } from '@/components/nprews/actor-table';
import {
  AlertTriangle,
  FileText,
  TrendingUp,
  Users,
  Activity,
  Plus,
  Loader2,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function NPREWSDashboard() {
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch data from Convex
  const stats = useQuery(api.briefs.getDashboardStats);
  const pendingBriefs = useQuery(api.briefs.getPendingBriefs);
  const actorSignals = useQuery(api.signals.getActorSignalsWithLegitimacyTransfer);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/nprews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          inputUrl ? { url: inputUrl } : { text: inputText, source: 'Manual Input' }
        ),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      console.log('Analysis result:', result);

      // Close dialog and refresh
      setAnalyzeOpen(false);
      setInputText('');
      setInputUrl('');
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NPREWS Dashboard</h1>
          <p className="text-muted-foreground">
            Narrative & Policy Regime Early-Warning System
          </p>
        </div>
        <Dialog open={analyzeOpen} onOpenChange={setAnalyzeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Analyze Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Analyze New Content</DialogTitle>
              <DialogDescription>
                Enter text or a URL to analyze for narrative risk signals.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or paste text
                  </span>
                </div>
              </div>
              <Textarea
                placeholder="Paste speech, article, or policy document text here..."
                className="min-h-[200px]"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || (!inputText && !inputUrl)}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with NPREWS Agents...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Briefs This Week
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.briefsThisWeek ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingReview ?? 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Narratives Detected
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.narrativesThisWeek ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Legitimacy Transfers
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.legitimacyTransfersThisWeek ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Key regime signals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requires Escalation
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.requiresEscalation ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Regime Band Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Regime Band Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end h-24">
              {(['dormant', 'emerging', 'normalising', 'pre_formal', 'imminent'] as const).map(
                (band) => {
                  const count = stats.byRegimeBand[band] || 0;
                  const maxCount = Math.max(...Object.values(stats.byRegimeBand), 1);
                  const height = (count / maxCount) * 100;
                  return (
                    <div
                      key={band}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          band === 'dormant'
                            ? 'bg-slate-400'
                            : band === 'emerging'
                            ? 'bg-blue-500'
                            : band === 'normalising'
                            ? 'bg-amber-500'
                            : band === 'pre_formal'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {band.replace('_', '-')}
                      </span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Briefs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Review</h2>
            <Badge variant="outline">
              {pendingBriefs?.length ?? 0} briefs
            </Badge>
          </div>

          {pendingBriefs && pendingBriefs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {pendingBriefs.slice(0, 4).map((brief) => (
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
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">No Pending Briefs</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyze content to generate narrative briefs
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Legitimacy Transfers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Legitimacy Transfers</h2>

          {actorSignals && actorSignals.length > 0 ? (
            <div className="space-y-3">
              {actorSignals.slice(0, 3).map((signal) =>
                signal.legitimacyTransfer ? (
                  <LegitimacyTransferCard
                    key={signal._id}
                    from={signal.legitimacyTransfer.from}
                    to={signal.legitimacyTransfer.to}
                    narrative={signal.legitimacyTransfer.narrative}
                  />
                ) : null
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No legitimacy transfers detected yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
