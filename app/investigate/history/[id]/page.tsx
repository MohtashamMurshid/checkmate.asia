'use client';

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share, Download, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Visualization } from "@/components/ai-elements/visualization";

// Reuse mock types
type TimelineEntry = {
  id: string;
  kind: 'user' | 'assistant' | 'tool';
  title: string;
  body: string;
  toolName?: string;
  state?: string;
};

// Mock Data Store (in a real app this would be in a database)
const mockInvestigations: Record<string, any> = {
  '1': {
    query: 'AI Regulation in EU vs US',
    date: 'Nov 18, 2025 • 2:30 PM',
    status: 'Completed',
    summary: 'Analysis of AI regulation approaches reveals significant divergence. EU emphasizes comprehensive risk-based framework (AI Act), while US favors sector-specific guidelines and innovation-friendly policies.',
    credibility: 92,
    bias: 'Neutral',
    timeline: [
      { id: '1-1', kind: 'user', title: 'User query', body: 'AI Regulation in EU vs US' },
      { id: '1-2', kind: 'tool', title: 'Search Regulations', body: 'Searching EU AI Act and US Executive Orders...', toolName: 'search_regulations' },
      { id: '1-3', kind: 'assistant', title: 'Response', body: 'The EU AI Act categorizes AI systems by risk level. US approach is more decentralized...' },
    ],
    insights: [
      {
        id: 'res-1',
        title: 'Regulatory Approaches',
        summary: 'EU: Precautionary principle, centralized enforcement. US: Light-touch, market-driven.',
        visual: {
            type: 'investigation_visualization',
            initialContent: {
              sentiment: { classification: 'neutral', confidence: 0.9 },
              politicalLeaning: { classification: 'center', confidence: 0.8 }
            },
            comparison: {
              sentimentDiff: { match: true },
              politicalDiff: { match: true }
            }
        }
      }
    ]
  },
  '2': {
    query: 'Impact of Quantum Computing on Encryption',
    date: 'Nov 17, 2025 • 10:15 AM',
    status: 'Completed',
    summary: 'Quantum computers pose a significant threat to current public-key cryptography (RSA, ECC). Post-Quantum Cryptography (PQC) standardization is underway by NIST.',
    credibility: 95,
    bias: 'Scientific',
    timeline: [
       { id: '2-1', kind: 'user', title: 'User query', body: 'Impact of Quantum Computing on Encryption' },
       { id: '2-2', kind: 'tool', title: 'Analyze Tech', body: 'Searching quantum threat timelines...', toolName: 'analyze_tech' },
    ],
    insights: [
        {
            id: 'res-2',
            title: 'Threat Timeline',
            summary: 'Experts estimate a cryptographically relevant quantum computer could emerge by 2030-2035.',
            visual: {
                sentiment: { classification: 'negative', confidence: 0.7 }, // Negative sentiment regarding security threat
                politicalLeaning: { classification: 'center', confidence: 0.9 }
            }
        }
    ]
  },
  '3': {
    query: 'Recent Tech Stock Volatility Reasons',
    date: 'Nov 16, 2025 • 4:45 PM',
    status: 'Completed',
    summary: 'Recent volatility driven by mixed earnings reports from major AI chipmakers and uncertainty regarding interest rate cuts.',
    credibility: 88,
    bias: 'Mixed',
    timeline: [
        { id: '3-1', kind: 'user', title: 'User query', body: 'Recent Tech Stock Volatility Reasons' },
    ],
    insights: [
        {
            id: 'res-3',
            title: 'Market Factors',
            summary: 'Primary drivers: Earnings misses in semiconductor sector, Federal Reserve comments.',
            visual: {
                sentiment: { classification: 'neutral', confidence: 0.6 },
                politicalLeaning: { classification: 'center', confidence: 0.8 }
            }
        }
    ]
  }
};

export default function HistoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = mockInvestigations[id];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <AlertTriangle className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Investigation Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The investigation details you requested could not be found or are not available in this mock demo.
        </p>
        <Button asChild variant="outline">
          <Link href="/investigate/history">Return to History</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" asChild>
              <Link href="/investigate/history">
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
            <span className="text-sm">Back to History</span>
            <span className="text-sm">•</span>
            <span className="text-sm flex items-center gap-1">
              <Clock className="size-3" /> {data.date}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{data.query}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3" />
              Score: {data.credibility}/100
            </Badge>
            <Badge variant="outline">{data.bias} Bias</Badge>
            <Badge className={data.status === 'Completed' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400 border-0' : ''}>
              {data.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="size-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Timeline */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Investigation Timeline</h3>
          <div className="space-y-4">
            {data.timeline.map((entry: TimelineEntry, index: number) => (
              <div key={entry.id} className="rounded-lg border p-4 bg-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <Badge variant={entry.kind === 'tool' ? 'default' : 'outline'} className="text-xs">
                      {entry.kind === 'tool' ? 'Tool' : entry.kind === 'user' ? 'User' : 'Assistant'}
                    </Badge>
                    <h4 className="font-medium mt-2">{entry.title}</h4>
                  </div>
                  <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground">{entry.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights / Visuals */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Key Findings</h3>
          <div className="space-y-4">
            {data.insights.map((insight: any) => (
              <Card key={insight.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{insight.summary}</p>
                  {insight.visual && <Visualization data={insight.visual} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

