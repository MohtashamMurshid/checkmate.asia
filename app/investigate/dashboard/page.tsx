'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShieldAlert, Scale, Clock, ExternalLink, ArrowUpRight, ArrowDownRight, Search as SearchIcon, ShieldCheck as ShieldCheckIcon, Scale as ScaleIcon, Globe as GlobeIcon } from "lucide-react";
import { TextReviewPanel } from "@/components/ai-elements/text-review-panel";
import { HighlightedTextView } from "@/components/ai-elements/highlighted-text-view";
import { FactBiasSentimentSpan } from '@/lib/ai/tools/fact-bias-sentiment';

export default function DashboardPage() {
  const [analyzedText, setAnalyzedText] = useState('');
  const [analyzedSpans, setAnalyzedSpans] = useState<FactBiasSentimentSpan[]>([]);

  const handleAnalysisComplete = (text: string, spans: FactBiasSentimentSpan[]) => {
    setAnalyzedText(text);
    setAnalyzedSpans(spans);
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your investigation insights and trends.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Last 30 Days</Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <TextReviewPanel onAnalyzeComplete={handleAnalysisComplete} />
        
        {analyzedText && (
          <Card className="w-full animate-in fade-in zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Review facts, biases, and sentiment. Click on any highlighted text to verify it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HighlightedTextView 
                text={analyzedText} 
                spans={analyzedSpans} 
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Avg. Author Credibility Score"
          value="87%"
          trend="+2.4%"
          trendUp={true}
          icon={ShieldCheckIcon}
        />
        <StatCard
          title="Bias Detected"
          value="24"
          trend="-5%"
          trendUp={false} // Down is good for bias
          icon={ScaleIcon}
          description="High bias instances"
        />
        <StatCard
          title="Sources Analyzed"
          value="1,420"
          trend="+18%"
          trendUp={true}
          icon={GlobeIcon}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sentiment Analysis Trends</CardTitle>
            <CardDescription>
              Sentiment distribution across investigations over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MockSentimentChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Political Bias Distribution</CardTitle>
            <CardDescription>
              Aggregated political leaning of analyzed content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockBiasDistribution />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Author Credibility</CardTitle>
            <CardDescription>
              Top analyzed domains by author credibility score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockCredibilityList />
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Investigations</CardTitle>
            <CardDescription>
              History of your recent analysis requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockRecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Icons
// import { Search as SearchIcon, ShieldCheck as ShieldCheckIcon, Scale as ScaleIcon, Globe as GlobeIcon } from "lucide-react";

function StatCard({ title, value, trend, trendUp, icon: Icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <span className={trendUp ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
            {trendUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {trend}
          </span>
          <span className="ml-2 opacity-70">from last month</span>
        </p>
      </CardContent>
    </Card>
  );
}

function MockSentimentChart() {
  // Simple CSS bar chart
  const data = [
    { label: "Mon", pos: 65, neg: 12, neu: 23 },
    { label: "Tue", pos: 59, neg: 15, neu: 26 },
    { label: "Wed", pos: 80, neg: 5, neu: 15 },
    { label: "Thu", pos: 81, neg: 8, neu: 11 },
    { label: "Fri", pos: 56, neg: 20, neu: 24 },
    { label: "Sat", pos: 55, neg: 25, neu: 20 },
    { label: "Sun", pos: 40, neg: 30, neu: 30 },
  ];

  return (
    <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-6">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
          <div className="w-full max-w-[40px] flex flex-col gap-1 h-full justify-end">
             {/* Stacked bars */}
             <div 
               className="w-full bg-green-500/80 rounded-t-sm transition-all group-hover:bg-green-500"
               style={{ height: `${item.pos}%` }}
             />
             <div 
               className="w-full bg-gray-400/50 transition-all group-hover:bg-gray-400"
               style={{ height: `${item.neu}%` }}
             />
             <div 
               className="w-full bg-red-500/80 rounded-b-sm transition-all group-hover:bg-red-500"
               style={{ height: `${item.neg}%` }}
             />
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function MockBiasDistribution() {
  const biases = [
    { label: "Left", value: 15, color: "bg-blue-500" },
    { label: "Center-Left", value: 20, color: "bg-blue-300" },
    { label: "Center", value: 30, color: "bg-purple-500" },
    { label: "Center-Right", value: 20, color: "bg-red-300" },
    { label: "Right", value: 15, color: "bg-red-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[300px]">
      {/* Pie visualization using conic-gradient */}
      <div className="relative size-48 rounded-full" 
           style={{ 
             background: `conic-gradient(
               #3b82f6 0% 15%, 
               #93c5fd 15% 35%, 
               #a855f7 35% 65%, 
               #fca5a5 65% 85%, 
               #ef4444 85% 100%
             )` 
           }}>
           <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center flex-col">
             <span className="text-3xl font-bold">128</span>
             <span className="text-xs text-muted-foreground">Total</span>
           </div>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
        {biases.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${b.color}`} />
            <span className="text-muted-foreground">{b.label} ({b.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCredibilityList() {
  const sources = [
    { domain: "reuters.com", score: 98, count: 45 },
    { domain: "apnews.com", score: 97, count: 38 },
    { domain: "nature.com", score: 95, count: 12 },
    { domain: "bbc.com", score: 94, count: 32 },
    { domain: "wsj.com", score: 92, count: 28 },
  ];

  return (
    <div className="space-y-4">
      {sources.map((source, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{source.domain}</p>
            <p className="text-xs text-muted-foreground">{source.count} articles analyzed</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${source.score}%` }}
              />
            </div>
            <span className="text-sm font-medium">{source.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockRecentActivity() {
  const activities = [
    { 
      query: "AI Regulation in EU", 
      time: "2 hours ago", 
      status: "Complete",
      bias: "Neutral"
    },
    { 
      query: "Climate Change Impact 2025", 
      time: "5 hours ago", 
      status: "Complete",
      bias: "Scientific"
    },
    { 
      query: "Tech Stock Market Crash Rumors", 
      time: "1 day ago", 
      status: "Complete",
      bias: "Slight Alarmist"
    },
    { 
      query: "New Health Policy Analysis", 
      time: "2 days ago", 
      status: "Complete",
      bias: "Left Leaning"
    },
  ];

  return (
    <div className="space-y-6">
      {activities.map((item, i) => (
        <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
          <div className="space-y-1">
            <p className="text-sm font-medium">{item.query}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{item.time}</span>
              <span>•</span>
              <span>{item.bias}</span>
            </div>
          </div>
          <Badge variant="secondary">{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

