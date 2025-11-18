'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EvolutionGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border min-w-[150px]">
      <div className="flex items-center mb-2">
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.date}</div>
        </div>
      </div>
      
      {data.type && (
        <Badge variant="secondary" className="mt-1 text-[10px] px-1 py-0 h-5">
          {data.type}
        </Badge>
      )}
      
      {data.source && (
        <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-[140px]">
          {data.source}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  default: CustomNode,
};

export function EvolutionGraph({ nodes: initialNodes, edges: initialEdges }: EvolutionGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <Card className="w-full h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Evolution Graph</CardTitle>
      </CardHeader>
      <CardContent className="h-[450px] p-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}

