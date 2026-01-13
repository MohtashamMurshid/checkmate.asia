'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Bot, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Signal {
  id: string;
  agentName: string;
  hypothesis: string;
  confidence: number;
  type?: string;
}

interface AgentContributionProps {
  signals: Signal[];
  className?: string;
}

const agentConfig: Record<
  string,
  { color: string; description: string }
> = {
  NarrativeAgent: {
    color: 'bg-blue-500',
    description: 'Detects narrative frames and shifts',
  },
  ActorLegitimacyAgent: {
    color: 'bg-amber-500',
    description: 'Maps actors and legitimacy transfers',
  },
  ClusterAgent: {
    color: 'bg-green-500',
    description: 'Groups related narratives',
  },
  SynthesizerAgent: {
    color: 'bg-purple-500',
    description: 'Generates narrative briefs',
  },
};

export function AgentContribution({ signals, className }: AgentContributionProps) {
  // Group signals by agent
  const byAgent = signals.reduce(
    (acc, signal) => {
      if (!acc[signal.agentName]) {
        acc[signal.agentName] = [];
      }
      acc[signal.agentName].push(signal);
      return acc;
    },
    {} as Record<string, Signal[]>
  );

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Bot className="h-4 w-4" />
        Agent Contributions
      </h3>

      <div className="space-y-2">
        {Object.entries(byAgent).map(([agentName, agentSignals]) => (
          <AgentSection
            key={agentName}
            agentName={agentName}
            signals={agentSignals}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentSectionProps {
  agentName: string;
  signals: Signal[];
}

function AgentSection({ agentName, signals }: AgentSectionProps) {
  const [open, setOpen] = useState(false);
  const config = agentConfig[agentName] || {
    color: 'bg-slate-500',
    description: 'Agent',
  };

  const avgConfidence =
    signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn('h-2 w-2 rounded-full', config.color)} />
            <div className="text-left">
              <div className="font-medium text-sm">{agentName}</div>
              <div className="text-xs text-muted-foreground">
                {config.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {signals.length} signal{signals.length !== 1 ? 's' : ''}
            </Badge>
            <Badge
              className={cn(
                'text-xs',
                avgConfidence > 0.8
                  ? 'bg-green-100 text-green-700'
                  : avgConfidence > 0.6
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              )}
            >
              {Math.round(avgConfidence * 100)}%
            </Badge>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 ml-5 space-y-2 border-l-2 border-muted pl-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="p-2 rounded-md bg-muted/30 text-sm"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground">{signal.hypothesis}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {Math.round(signal.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
