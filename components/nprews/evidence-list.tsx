'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Quote } from 'lucide-react';

interface Evidence {
  source: string;
  quote: string;
  url?: string;
  publishedAt?: string;
  sourceType: string;
}

interface EvidenceListProps {
  evidence: Evidence[];
  className?: string;
  maxItems?: number;
}

const sourceTypeLabels: Record<string, { label: string; color: string }> = {
  parliamentary: {
    label: 'Parliament',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  regulatory: {
    label: 'Regulatory',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  media: {
    label: 'Media',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  social: {
    label: 'Social',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  analysis: {
    label: 'Analysis',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
};

export function EvidenceList({
  evidence,
  className,
  maxItems = 10,
}: EvidenceListProps) {
  const displayEvidence = evidence.slice(0, maxItems);

  return (
    <div className={cn('space-y-3', className)}>
      {displayEvidence.map((item, index) => (
        <EvidenceItem key={index} evidence={item} index={index + 1} />
      ))}
      {evidence.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center py-2">
          +{evidence.length - maxItems} more evidence items
        </p>
      )}
    </div>
  );
}

interface EvidenceItemProps {
  evidence: Evidence;
  index: number;
}

function EvidenceItem({ evidence, index }: EvidenceItemProps) {
  const sourceType = sourceTypeLabels[evidence.sourceType] || sourceTypeLabels.analysis;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {index}
          </span>
          <span className="font-medium text-sm">{evidence.source}</span>
        </div>
        <Badge className={cn('text-xs shrink-0', sourceType.color)}>
          {sourceType.label}
        </Badge>
      </div>

      {/* Quote */}
      <div className="flex gap-2 pl-7">
        <Quote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          {evidence.quote}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pl-7 pt-1">
        {evidence.publishedAt && (
          <span className="text-xs text-muted-foreground">
            {new Date(evidence.publishedAt).toLocaleDateString()}
          </span>
        )}
        {evidence.url && (
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </a>
        )}
      </div>
    </div>
  );
}
