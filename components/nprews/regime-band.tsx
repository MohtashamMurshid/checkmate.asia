'use client';

import { cn } from '@/lib/utils';

interface RegimeBandIndicatorProps {
  band: 'dormant' | 'emerging' | 'normalising' | 'pre_formal' | 'imminent';
  showLabels?: boolean;
  className?: string;
}

const bands = [
  { id: 'dormant', label: 'Dormant', color: 'bg-slate-400' },
  { id: 'emerging', label: 'Emerging', color: 'bg-blue-500' },
  { id: 'normalising', label: 'Normalising', color: 'bg-amber-500' },
  { id: 'pre_formal', label: 'Pre-Formal', color: 'bg-orange-500' },
  { id: 'imminent', label: 'Imminent', color: 'bg-red-500' },
];

export function RegimeBandIndicator({
  band,
  showLabels = false,
  className,
}: RegimeBandIndicatorProps) {
  const currentIndex = bands.findIndex((b) => b.id === band);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="flex gap-1">
        {bands.map((b, index) => (
          <div
            key={b.id}
            className={cn(
              'h-2 flex-1 rounded-full transition-all',
              index <= currentIndex ? b.color : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {bands.map((b, index) => (
            <span
              key={b.id}
              className={cn(
                'text-center',
                index === currentIndex && 'font-semibold text-foreground'
              )}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface RegimeBandBadgeProps {
  band: 'dormant' | 'emerging' | 'normalising' | 'pre_formal' | 'imminent';
  className?: string;
}

export function RegimeBandBadge({ band, className }: RegimeBandBadgeProps) {
  const config = bands.find((b) => b.id === band);
  if (!config) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        band === 'dormant' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        band === 'emerging' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        band === 'normalising' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        band === 'pre_formal' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        band === 'imminent' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        className
      )}
    >
      <div className={cn('h-1.5 w-1.5 rounded-full', config.color)} />
      {config.label}
    </div>
  );
}
