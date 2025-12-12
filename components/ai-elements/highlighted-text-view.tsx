'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FactBiasSentimentSpan } from '@/lib/ai/tools/fact-bias-sentiment';
import { FactVerificationResult } from '@/lib/ai/tools/fact-verification';

interface HighlightedTextViewProps {
  text: string;
  spans: FactBiasSentimentSpan[];
  context?: string; // Optional context for the verification step
}

export function HighlightedTextView({ text, spans, context }: HighlightedTextViewProps) {
  const [selectedSpan, setSelectedSpan] = useState<FactBiasSentimentSpan | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<FactVerificationResult | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  // Helper to construct the text with highlight spans
  const renderHighlightedText = () => {
    if (!spans || spans.length === 0) return <p className="whitespace-pre-wrap">{text}</p>;

    // Sort spans by start index
    const sortedSpans = [...spans].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sortedSpans.forEach((span, i) => {
      // Add non-highlighted text before this span
      if (span.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, span.start)}
          </span>
        );
      }

      // Determine style based on type
      let className = "cursor-pointer transition-colors px-1 py-0.5 rounded ";
      if (span.type === 'fact') {
        className += "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30 border-b-2 border-primary/30 dark:border-primary/40";
      } else if (span.type === 'bias') {
        className += "bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:hover:bg-destructive/30 border-b-2 border-destructive/30 dark:border-destructive/40";
      } else if (span.type === 'sentiment') {
        className += "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 dark:bg-chart-3/20 dark:text-chart-3 dark:hover:bg-chart-3/30 border-b-2 border-chart-3/30 dark:border-chart-3/40";
      } else {
        className += "bg-muted text-muted-foreground hover:bg-muted/80 dark:bg-muted dark:text-muted-foreground border-b-2 border-border";
      }

      // Add the highlighted span
      elements.push(
        <TooltipProvider key={`span-${i}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span 
                className={className}
                onClick={() => handleSpanClick(span)}
              >
                {text.slice(span.start, span.end)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold capitalize text-xs mb-1">{span.type}</p>
              <p className="text-xs max-w-xs">{span.shortExplanation}</p>
              <p className="text-[10px] opacity-70 mt-1">Click to verify</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = span.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  const handleSpanClick = async (span: FactBiasSentimentSpan) => {
    setSelectedSpan(span);
    setVerificationResult(null);
    setIsVerificationOpen(true);
    
    // Only auto-verify for facts or bias claims
    if (span.type === 'fact' || span.type === 'bias') {
      await runVerification(span);
    }
  };

  const runVerification = async (span: FactBiasSentimentSpan) => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claim: text.slice(span.start, span.end),
          context: context || text // Send full text as context if not provided
        }),
      });

      if (!res.ok) throw new Error('Verification request failed');
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error(err);
      // We'll just show the error state in the dialog if needed, 
      // but for now we rely on the null result + !isVerifying check
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper for verdict icon
  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'supported': return <CheckCircle2 className="h-5 w-5 text-chart-2" />;
      case 'contradicted': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'mixed': return <AlertTriangle className="h-5 w-5 text-chart-3" />;
      default: return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'supported': return 'Supported by evidence';
      case 'contradicted': return 'Contradicted by evidence';
      case 'mixed': return 'Mixed evidence';
      default: return 'Unverifiable / Unknown';
    }
  };

  return (
    <>
      <div className="bg-background border rounded-lg p-6 min-h-[200px]">
        {renderHighlightedText()}
      </div>

      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Verification</DialogTitle>
            <DialogDescription>
              Analyzing the selected claim against web search results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-muted/50 p-4 rounded-md border text-sm italic border-l-4 border-l-primary">
              "{selectedSpan ? text.slice(selectedSpan.start, selectedSpan.end) : ''}"
            </div>

            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Checking authoritative sources...</p>
              </div>
            ) : verificationResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 p-4 border rounded-md bg-card">
                  {getVerdictIcon(verificationResult.verdict)}
                  <div>
                    <h4 className="font-semibold text-sm">Verdict: {getVerdictLabel(verificationResult.verdict)}</h4>
                    <p className="text-xs text-muted-foreground">Confidence: {Math.round(verificationResult.confidence * 100)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Explanation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {verificationResult.explanation}
                  </p>
                </div>

                {verificationResult.evidence.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Key Evidence</h4>
                    {verificationResult.evidence.map((item, i) => (
                      <div key={i} className="text-sm border-l-2 pl-3 py-1 space-y-1">
                        <p className="text-muted-foreground italic">"{item.quote}"</p>
                        {item.sourceTitle && <p className="text-xs font-medium text-primary">— {item.sourceTitle}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {verificationResult.sources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors text-primary dark:text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {source.title || new URL(source.url).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Click verify to check this claim.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 block mx-auto"
                  onClick={() => selectedSpan && runVerification(selectedSpan)}
                >
                  Run Verification
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

