'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
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
  low: {
    label: 'Low Risk',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  medium: {
    label: 'Medium Risk',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  high: {
    label: 'High Risk',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
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
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                {region}
              </div>
            </div>
          </div>
          {activeSignalCount > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0',
                activeSignalCount >= 5 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              )}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {activeSignalCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {sector}
          </Badge>
          <Badge className={cn('text-xs', risk.color)}>
            <div className={cn('h-1.5 w-1.5 rounded-full mr-1', risk.dotColor)} />
            {risk.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
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
