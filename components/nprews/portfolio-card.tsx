'use client';

import { cn } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

interface PortfolioCardProps {
  id: Id<'portfolioCompanies'>;
  name: string;
  region: string;
  sector: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  activeSignalCount: number;
  onClick?: () => void;
  selected?: boolean;
}

const riskConfig = {
  low: { dot: 'bg-zinc-400', text: 'text-zinc-500' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-600' },
  high: { dot: 'bg-red-500', text: 'text-red-600' },
};

export function PortfolioCard({
  id,
  name,
  region,
  sector,
  description,
  riskLevel,
  activeSignalCount,
  onClick,
  selected,
}: PortfolioCardProps) {
  const risk = riskConfig[riskLevel];

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 cursor-pointer transition-all',
        selected && 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950',
        !selected && 'hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{name}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{region}</p>
        </div>
        {activeSignalCount > 0 && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              activeSignalCount >= 5
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            )}
          >
            {activeSignalCount} signal{activeSignalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{sector}</span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className={cn('h-1.5 w-1.5 rounded-full', risk.dot)} />
          <span className={cn('capitalize', risk.text)}>{riskLevel}</span>
        </span>
      </div>
    </div>
  );
}

interface PortfolioOverviewProps {
  companies: Array<{
    _id: Id<'portfolioCompanies'>;
    name: string;
    region: string;
    sector: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    activeSignalCount: number;
  }>;
  selectedCompanyId?: Id<'portfolioCompanies'>;
  onSelectCompany?: (id: Id<'portfolioCompanies'> | undefined) => void;
}

export function PortfolioOverview({
  companies,
  selectedCompanyId,
  onSelectCompany,
}: PortfolioOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <PortfolioCard
          key={company._id}
          id={company._id}
          name={company.name}
          region={company.region}
          sector={company.sector}
          description={company.description}
          riskLevel={company.riskLevel}
          activeSignalCount={company.activeSignalCount}
          selected={selectedCompanyId === company._id}
          onClick={() => {
            if (onSelectCompany) {
              onSelectCompany(
                selectedCompanyId === company._id ? undefined : company._id
              );
            }
          }}
        />
      ))}
    </div>
  );
}
