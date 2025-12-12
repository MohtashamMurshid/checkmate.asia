'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight } from 'lucide-react';
import { FactBiasSentimentSpan } from '@/lib/ai/tools/fact-bias-sentiment';

interface TextReviewPanelProps {
  onAnalyzeComplete: (text: string, spans: FactBiasSentimentSpan[]) => void;
}

export function TextReviewPanel({ onAnalyzeComplete }: TextReviewPanelProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      onAnalyzeComplete(data.text, data.spans || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fillMockData = () => {
    setText(`The GDP of the United States grew by 2.9% in Q4 2023, beating analyst expectations. However, this clearly shows that the current administration's disastrous economic policies are finally failing, despite what the mainstream media wants you to believe. I am absolutely furious that more people aren't talking about this crisis! On a brighter note, the tech sector added 15,000 jobs last month, which is wonderful news for innovation.`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Text Review</CardTitle>
        <CardDescription>
          Paste text from an LLM or other source to check for facts, bias, and sentiment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste text here to analyze..."
          className="min-h-[150px] font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={fillMockData}
            className="text-xs text-muted-foreground"
          >
            Fill Mock Data
          </Button>

          <Button 
            onClick={handleAnalyze} 
            disabled={!text.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Text
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

