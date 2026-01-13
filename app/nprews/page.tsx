'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefCard } from '@/components/nprews/brief-card';
import { LegitimacyTransferCard } from '@/components/nprews/actor-table';
import { PortfolioOverview } from '@/components/nprews/portfolio-card';
import { SignalFeed } from '@/components/nprews/signal-feed';
import {
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Plus,
  Loader2,
  Search,
  Building2,
  Bookmark,
  Zap,
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    Id<'portfolioCompanies'> | undefined
  >(undefined);

  // Fetch NPREWS data from Convex
  const stats = useQuery(api.briefs.getDashboardStats);
  const pendingBriefs = useQuery(api.briefs.getPendingBriefs);
  const actorSignals = useQuery(api.signals.getActorSignalsWithLegitimacyTransfer);

  // Fetch Signals data from Convex
  const companies = useQuery(api.portfolio.getCompanies);
  const portfolioStats = useQuery(api.portfolio.getPortfolioStats);
  const signals = useQuery(api.signalsData.getSignals, { limit: 50 });
  const bookmarkedSignals = useQuery(api.signalsData.getBookmarkedSignals);

  // Mutations
  const toggleBookmark = useMutation(api.signalsData.toggleBookmark);
  const markTracking = useMutation(api.signalsData.markAsTracking);

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
          <h1 className="text-2xl font-bold">Risk Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Portfolio monitoring & narrative early-warning system
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
                Enter text or a URL to analyze for risk signals.
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
                    Analyzing with AI Agents...
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats?.totalCompanies ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats?.highRiskCompanies ?? 0} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats?.totalSignals ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats?.newSignals ?? 0} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {portfolioStats?.criticalSignals ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats?.bookmarkedSignals ?? '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bookmarked signals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Narrative Briefs</CardTitle>
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
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Signals
            {portfolioStats?.newSignals ? (
              <Badge variant="secondary" className="ml-1">
                {portfolioStats.newSignals}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Tracking
            {bookmarkedSignals?.length ? (
              <Badge variant="secondary" className="ml-1">
                {bookmarkedSignals.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="briefs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Briefs
          </TabsTrigger>
        </TabsList>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-6">
          {/* Portfolio Overview - Clickable to filter signals */}
          {companies && companies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Portfolio Companies</h2>
                {selectedCompanyId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCompanyId(undefined)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <PortfolioOverview
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={setSelectedCompanyId}
              />
            </div>
          )}

          {/* Signal Feed */}
          {signals && companies && (
            <SignalFeed
              signals={signals}
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onToggleBookmark={(id) => toggleBookmark({ id })}
              onMarkTracking={(id) => markTracking({ id })}
              maxHeight="500px"
            />
          )}

          {/* Empty state if no signals */}
          {(!signals || signals.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Signals Yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Seed demo data by running: npx convex run seed:seedDemoData
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          {companies && companies.length > 0 ? (
            <PortfolioOverview
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Portfolio Companies</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Seed demo data by running: npx convex run seed:seedDemoData
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookmarks/Tracking Tab */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarkedSignals && bookmarkedSignals.length > 0 ? (
            <SignalFeed
              signals={bookmarkedSignals}
              companies={companies ?? []}
              onToggleBookmark={(id) => toggleBookmark({ id })}
              maxHeight="600px"
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Tracked Signals</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bookmark signals to track developing situations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Briefs Tab */}
        <TabsContent value="briefs" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
