/**
 * Investigation Report Component
 * Displays structured investigation results with truthfulness analysis
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InvestigationResult } from '@/lib/investigation/types';

interface InvestigationReportProps {
  result: InvestigationResult;
}

export function InvestigationReport({ result }: InvestigationReportProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'false':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'partially-true':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Investigation Report</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Investigation Type: <span className="font-medium capitalize">{result.investigationType}</span>
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(result.truthfulnessScore)}`}>
                {result.truthfulnessScore}/100
              </div>
              <Badge className={`mt-2 ${getVerdictColor(result.verdict)}`}>
                {result.verdict.toUpperCase().replace('-', ' ')}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>

          {/* Evidence */}
          {result.evidence && result.evidence.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Evidence</h3>
              <div className="space-y-2">
                {result.evidence.map((evidence, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-md">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{evidence.claim}</span>
                      <Badge
                        variant={
                          evidence.verification === 'verified'
                            ? 'default'
                            : evidence.verification === 'disputed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="ml-2"
                      >
                        {evidence.verification}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Source: {evidence.source}
                    </p>
                    <p className="text-sm">{evidence.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div>
            <h3 className="font-semibold mb-2">Reasoning</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Sources</h3>
              <div className="space-y-2">
                {result.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <div>
                      <span className="font-medium text-sm">{source.name}</span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline ml-2"
                        >
                          {source.url}
                        </a>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({source.type})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {source.reliability}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Actions */}
          {result.agentActions && result.agentActions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Investigation Steps</h3>
              <div className="space-y-1">
                {result.agentActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/20 rounded"
                  >
                    <span className="font-mono text-[10px]">{action.timestamp}</span>
                    <span className="flex-1">{action.action}</span>
                    {action.tool && (
                      <Badge variant="outline" className="text-[10px]">
                        {action.tool}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        action.status === 'completed'
                          ? 'default'
                          : action.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {action.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

