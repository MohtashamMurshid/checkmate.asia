'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActorTable, LegitimacyTransferCard } from '@/components/nprews/actor-table';
import { Users, TrendingUp } from 'lucide-react';

export default function ActorsPage() {
  const actorSignals = useQuery(api.signals.getActorSignals, { limit: 50 });
  const legitimacyTransfers = useQuery(
    api.signals.getActorSignalsWithLegitimacyTransfer
  );

  // Aggregate all unique actors from signals
  const allActors = actorSignals?.flatMap((s) => s.actors) ?? [];
  const uniqueActors = Array.from(
    new Map(allActors.map((a) => [a.name, a])).values()
  );

  // Sort by legitimacy score
  const sortedActors = [...uniqueActors].sort(
    (a, b) => b.legitimacyScore - a.legitimacyScore
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Actor Map</h1>
        <p className="text-muted-foreground">
          Actors identified in narrative discourse with legitimacy scoring
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueActors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Legitimacy Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {legitimacyTransfers?.length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              High Legitimacy Actors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueActors.filter((a) => a.legitimacyScore >= 80).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actor Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Identified Actors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sortedActors.length > 0 ? (
                <ActorTable
                  actors={sortedActors.map((a) => ({
                    ...a,
                    role: a.role as 'originator' | 'amplifier' | 'legitimiser',
                  }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No actors identified yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Legitimacy Transfers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Legitimacy Transfers
          </h2>
          {legitimacyTransfers && legitimacyTransfers.length > 0 ? (
            <div className="space-y-3">
              {legitimacyTransfers.map((signal) =>
                signal.legitimacyTransfer ? (
                  <LegitimacyTransferCard
                    key={signal._id}
                    from={signal.legitimacyTransfer.from}
                    to={signal.legitimacyTransfer.to}
                    narrative={signal.legitimacyTransfer.narrative}
                  />
                ) : null
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No legitimacy transfers detected
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
