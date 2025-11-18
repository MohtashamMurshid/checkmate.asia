'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ExternalLink, 
  Calendar, 
  Info,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

interface EvolutionGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 150; // Estimated base height, dynamic sizing is harder with dagre pre-calc

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Adjust logic if we want different handle positions for LR layout
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const CustomNode = ({ data, isConnectable }: { data: any, isConnectable: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const isPrimary = data.type === 'primary';
  const credibility = typeof data.credibility === 'number' ? data.credibility : null;
  
  // Use theme-aware colors for credibility
  let credibilityColor = 'text-muted-foreground';
  let credibilityIconColor = 'text-muted-foreground';
  if (credibility !== null) {
    if (credibility >= 7) {
      credibilityColor = 'text-green-600 dark:text-green-400';
      credibilityIconColor = 'text-green-600 dark:text-green-400';
    } else if (credibility >= 4) {
      credibilityColor = 'text-yellow-600 dark:text-yellow-400';
      credibilityIconColor = 'text-yellow-600 dark:text-yellow-400';
    } else {
      credibilityColor = 'text-red-600 dark:text-red-400';
      credibilityIconColor = 'text-red-600 dark:text-red-400';
    }
  }

  return (
    <div className={cn(
      "w-[280px] shadow-md rounded-xl bg-card border transition-all duration-200",
      isPrimary ? "border-primary/50 ring-2 ring-primary/10" : "border-border",
      "hover:shadow-lg hover:border-primary/30"
    )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-muted-foreground !w-3 !h-1 !rounded-sm"
      />
      
      <div className="p-3">
        {/* Header: Type & Date */}
        <div className="flex items-center justify-between mb-2">
           <Badge 
            variant={isPrimary ? "default" : "secondary"} 
            className="text-[10px] px-1.5 py-0 h-5 font-normal uppercase tracking-wider"
          >
            {data.type || 'Event'}
          </Badge>
          {data.date && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {data.date}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="font-semibold text-sm leading-tight mb-2 text-foreground">
          {data.label}
        </div>

        {/* Source Line */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
            {data.url ? <Globe className="size-3 shrink-0" /> : <LinkIcon className="size-3 shrink-0" />}
            <span className="truncate">{data.source || 'Unknown Source'}</span>
          </div>
          
          {credibility !== null && (
            <div className={cn("flex items-center gap-1 text-[10px] font-medium", credibilityColor)} title={`Credibility Score: ${credibility}/10`}>
              {credibility >= 7 ? <ShieldCheck className={cn("size-3", credibilityIconColor)} /> : <ShieldAlert className={cn("size-3", credibilityIconColor)} />}
              {credibility}/10
            </div>
          )}
        </div>

        {/* Summary / Details */}
        {data.summary && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
               <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 w-full justify-between text-muted-foreground hover:text-foreground">
                  <span>{isOpen ? 'Hide Details' : 'Show Details'}</span>
                  <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              
              {data.url && (
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-muted-foreground hover:text-primary transition-colors"
                  title="Open Source"
                >
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            
            <CollapsibleContent className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-md leading-relaxed">
              {data.summary}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-muted-foreground !w-3 !h-1 !rounded-sm"
      />
    </div>
  );
};

const nodeTypes = {
  default: CustomNode,
};

export function EvolutionGraph({ nodes: initialNodes, edges: initialEdges }: EvolutionGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    
    // Get edge color based on current theme
    const getEdgeColor = () => {
      // Use resolvedTheme to handle 'system' theme
      const isDark = resolvedTheme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
      return 'hsl(var(--muted-foreground))';
    };
    
    const edgeColor = getEdgeColor();
    const styledEdges = layoutedEdges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: edgeColor, strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
      },
      labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 500, fontSize: 11 },
      labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.95 },
    }));

    setNodes(layoutedNodes);
    setEdges(styledEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges, resolvedTheme]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
    [setEdges],
  );

  return (
    <Card className="w-full h-[600px] border-none shadow-none bg-transparent">
      <CardContent className="h-[600px] p-0 border rounded-xl overflow-hidden bg-muted/5 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          attributionPosition="bottom-right"
          className="react-flow-theme"
        >
          <Background 
            color="hsl(var(--muted-foreground))" 
            gap={16} 
            size={1} 
            className="opacity-10 dark:opacity-20" 
          />
          <Controls 
            className="bg-background border-border shadow-sm [&_button]:bg-background [&_button]:border-border [&_button]:text-foreground hover:[&_button]:bg-muted" 
          />
        </ReactFlow>
        
        {/* Legend / Info Overlay */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-sm text-xs space-y-2 z-10 max-w-[200px]">
           <h4 className="font-medium flex items-center gap-2 mb-2">
             <Info className="size-3" /> Graph Legend
           </h4>
           <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary"></span>
              <span className="text-muted-foreground">Primary Event</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground/30"></span>
              <span className="text-muted-foreground">Secondary/Related</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="size-3 text-green-600 dark:text-green-400" />
              <span className="text-muted-foreground">High Credibility</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
