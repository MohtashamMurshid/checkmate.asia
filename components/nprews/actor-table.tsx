'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Actor {
  name: string;
  category: string;
  role: 'originator' | 'amplifier' | 'legitimiser';
  legitimacyScore: number;
  quote?: string;
}

interface ActorTableProps {
  actors: Actor[];
  className?: string;
}

const categoryLabels: Record<string, string> = {
  minister: 'Minister',
  regulator: 'Regulator',
  central_bank: 'Central Bank',
  mp: 'MP',
  ngo_major: 'NGO',
  industry_body: 'Industry',
  tier1_media: 'Media',
  academic: 'Academic',
  analyst: 'Analyst',
};

const roleConfig: Record<string, { label: string; color: string }> = {
  originator: { label: 'Originator', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  amplifier: { label: 'Amplifier', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  legitimiser: { label: 'Legitimiser', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

export function ActorTable({ actors, className }: ActorTableProps) {
  // Sort by legitimacy score (highest first), then by role importance
  const sortedActors = [...actors].sort((a, b) => {
    const roleOrder = { legitimiser: 0, originator: 1, amplifier: 2 };
    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    return b.legitimacyScore - a.legitimacyScore;
  });

  return (
    <div className={cn('rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Legitimacy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActors.map((actor, index) => (
            <TableRow key={`${actor.name}-${index}`}>
              <TableCell>
                <div>
                  <div className="font-medium">{actor.name}</div>
                  {actor.quote && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                      "{actor.quote}"
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {categoryLabels[actor.category] || actor.category}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={cn('text-xs', roleConfig[actor.role].color)}>
                  {roleConfig[actor.role].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      'h-2 w-16 rounded-full bg-muted overflow-hidden'
                    )}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full',
                        actor.legitimacyScore >= 80
                          ? 'bg-green-500'
                          : actor.legitimacyScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      )}
                      style={{ width: `${actor.legitimacyScore}%` }}
                    />
                  </div>
                  <span className="text-sm tabular-nums w-8">
                    {actor.legitimacyScore}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface LegitimacyTransferCardProps {
  from: string;
  to: string;
  narrative: string;
  className?: string;
}

export function LegitimacyTransferCard({
  from,
  to,
  narrative,
  className,
}: LegitimacyTransferCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center shrink-0">
          <span className="text-lg">⚠️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
            Legitimacy Transfer Detected
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            <span className="font-medium">{from}</span> narrative adopted by{' '}
            <span className="font-medium">{to}</span>
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
            "{narrative}"
          </p>
        </div>
      </div>
    </div>
  );
}
