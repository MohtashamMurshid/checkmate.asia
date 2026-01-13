'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentContribution } from '@/components/nprews/agent-contribution';
import { Activity, FileText, Users, Layers } from 'lucide-react';

export default function SignalsPage() {
  const narrativeSignals = useQuery(api.signals.getNarrativeSignals, { limit: 50 });
  const actorSignals = useQuery(api.signals.getActorSignals, { limit: 50 });
  const clusters = useQuery(api.signals.getNarrativeClusters, { limit: 50 });

  // Combine all signals for the agent contribution view
  const allSignals = [
    ...(narrativeSignals?.map((s) => ({
      id: s._id,
      agentName: s.agentName,
      hypothesis: s.hypothesis,
      confidence: s.confidence,
      type: 'narrative',
    })) ?? []),
    ...(actorSignals?.map((s) => ({
      id: s._id,
      agentName: s.agentName,
      hypothesis: s.hypothesis,
      confidence: s.confidence,
      type: 'actor',
    })) ?? []),
    ...(clusters?.map((s) => ({
      id: s._id,
      agentName: s.agentName,
      hypothesis: s.hypothesis,
      confidence: s.confidence,
      type: 'cluster',
    })) ?? []),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Signal Feed</h1>
        <p className="text-muted-foreground">
          All signals detected by NPREWS agents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSignals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Narratives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{narrativeSignals?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Actor Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actorSignals?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clusters?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Signals</TabsTrigger>
          <TabsTrigger value="narratives">Narratives</TabsTrigger>
          <TabsTrigger value="actors">Actors</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allSignals.length > 0 ? (
            <AgentContribution signals={allSignals} />
          ) : (
            <EmptyState message="No signals detected yet" />
          )}
        </TabsContent>

        <TabsContent value="narratives" className="space-y-4">
          {narrativeSignals && narrativeSignals.length > 0 ? (
            <div className="space-y-3">
              {narrativeSignals.map((signal) => (
                <SignalCard
                  key={signal._id}
                  hypothesis={signal.hypothesis}
                  confidence={signal.confidence}
                  type={signal.frameType}
                  sectors={signal.sectors}
                  timestamp={signal.createdAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No narrative signals detected yet" />
          )}
        </TabsContent>

        <TabsContent value="actors" className="space-y-4">
          {actorSignals && actorSignals.length > 0 ? (
            <div className="space-y-3">
              {actorSignals.map((signal) => (
                <SignalCard
                  key={signal._id}
                  hypothesis={signal.hypothesis}
                  confidence={signal.confidence}
                  type={signal.legitimacyTransfer ? 'transfer' : 'actor'}
                  timestamp={signal.createdAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No actor signals detected yet" />
          )}
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          {clusters && clusters.length > 0 ? (
            <div className="space-y-3">
              {clusters.map((cluster) => (
                <Card key={cluster._id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">
                        {cluster.clusterSize} narratives
                      </Badge>
                      <Badge
                        className={
                          cluster.confidence > 0.8
                            ? 'bg-green-100 text-green-700'
                            : cluster.confidence > 0.6
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {Math.round(cluster.confidence * 100)}%
                      </Badge>
                    </div>
                    <h3 className="font-medium">{cluster.coreThesis}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Moral framing: {cluster.moralFraming}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState message="No clusters formed yet" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SignalCard({
  hypothesis,
  confidence,
  type,
  sectors,
  timestamp,
}: {
  hypothesis: string;
  confidence: number;
  type: string;
  sectors?: string[];
  timestamp: number;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
          <Badge
            className={
              confidence > 0.8
                ? 'bg-green-100 text-green-700'
                : confidence > 0.6
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-700'
            }
          >
            {Math.round(confidence * 100)}%
          </Badge>
        </div>
        <p className="text-sm">{hypothesis}</p>
        {sectors && sectors.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sectors.map((sector) => (
              <Badge key={sector} variant="secondary" className="text-xs capitalize">
                {sector.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
