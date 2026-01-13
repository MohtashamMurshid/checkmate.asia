'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefCard } from '@/components/nprews/brief-card';
import { LegitimacyTransferCard } from '@/components/nprews/actor-table';
import { PortfolioOverview } from '@/components/nprews/portfolio-card';
import { SignalFeed } from '@/components/nprews/signal-feed';
import {
  Plus,
  Loader2,
  Search,
  Building2,
  Bookmark,
  Zap,
  FileText,
  TrendingUp,
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Risk Intelligence
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Portfolio monitoring and signal detection
          </p>
        </div>
        <Dialog open={analyzeOpen} onOpenChange={setAnalyzeOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">Analyze Content</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Enter a URL or paste text to analyze for risk signals.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              </div>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400">or</span>
                </div>
              </div>
              <Textarea
                placeholder="Paste text content..."
                className="min-h-[180px] text-sm resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || (!inputText && !inputUrl)}
                className="w-full"
                size="sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Portfolio"
          value={portfolioStats?.totalCompanies ?? 0}
          subtext={`${portfolioStats?.highRiskCompanies ?? 0} elevated`}
        />
        <StatCard
          label="Active Signals"
          value={portfolioStats?.totalSignals ?? 0}
          subtext={`${portfolioStats?.newSignals ?? 0} new`}
          highlight={portfolioStats?.newSignals ? portfolioStats.newSignals > 0 : false}
        />
        <StatCard
          label="Critical"
          value={portfolioStats?.criticalSignals ?? 0}
          subtext="Require attention"
          alert={portfolioStats?.criticalSignals ? portfolioStats.criticalSignals > 0 : false}
        />
        <StatCard
          label="Tracking"
          value={portfolioStats?.bookmarkedSignals ?? 0}
          subtext="Bookmarked"
        />
        <StatCard
          label="Briefs"
          value={stats?.briefsThisWeek ?? 0}
          subtext={`${stats?.pendingReview ?? 0} pending`}
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 h-10">
          <TabsTrigger
            value="signals"
            className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm px-4"
          >
            Signals
            {portfolioStats?.newSignals ? (
              <span className="ml-2 text-xs text-zinc-500">{portfolioStats.newSignals}</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm px-4"
          >
            Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm px-4"
          >
            Tracking
            {bookmarkedSignals?.length ? (
              <span className="ml-2 text-xs text-zinc-500">{bookmarkedSignals.length}</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="briefs"
            className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm px-4"
          >
            Briefs
          </TabsTrigger>
        </TabsList>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-6 mt-6">
          {/* Portfolio Overview */}
          {companies && companies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Portfolio Companies
                </h2>
                {selectedCompanyId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-zinc-500"
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

          {/* Empty state */}
          {(!signals || signals.length === 0) && (
            <EmptyState
              icon={Zap}
              title="No Signals"
              description="Run: npx convex run seed:seedDemoData"
            />
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="mt-6">
          {companies && companies.length > 0 ? (
            <PortfolioOverview
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={setSelectedCompanyId}
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No Portfolio Companies"
              description="Run: npx convex run seed:seedDemoData"
            />
          )}
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-6">
          {bookmarkedSignals && bookmarkedSignals.length > 0 ? (
            <SignalFeed
              signals={bookmarkedSignals}
              companies={companies ?? []}
              onToggleBookmark={(id) => toggleBookmark({ id })}
              maxHeight="600px"
            />
          ) : (
            <EmptyState
              icon={Bookmark}
              title="No Tracked Signals"
              description="Bookmark signals to track developments"
            />
          )}
        </TabsContent>

        {/* Briefs Tab */}
        <TabsContent value="briefs" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pending Briefs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Pending Review
                </h2>
                <span className="text-xs text-zinc-500">
                  {pendingBriefs?.length ?? 0} briefs
                </span>
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
                <EmptyState
                  icon={FileText}
                  title="No Pending Briefs"
                  description="Analyze content to generate briefs"
                />
              )}
            </div>

            {/* Legitimacy Transfers */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Legitimacy Transfers
              </h2>

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
                <EmptyState
                  icon={TrendingUp}
                  title="No Transfers"
                  description="No legitimacy transfers detected"
                  compact
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  subtext,
  highlight,
  alert,
}: {
  label: string;
  value: number;
  subtext: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-2xl font-semibold mt-1 ${
          alert
            ? 'text-red-600 dark:text-red-500'
            : highlight
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtext}</p>
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center ${
        compact ? 'py-8' : 'py-16'
      }`}
    >
      <Icon className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-3" />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
    </div>
  );
}
