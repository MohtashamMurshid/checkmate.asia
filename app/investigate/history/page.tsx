'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  Filter, 
  MoreHorizontal, 
  Search, 
  FileText, 
  Trash2, 
  ArrowUpDown 
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const investigations = useQuery(api.investigations.list) || [];

  const filteredHistory = useMemo(() => {
    if (!investigations) return [];
    
    return investigations
      .filter(item => 
        item.userQuery.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => {
        // Extract tags from results
        const tags: string[] = [];
        if (item.results?.visual) {
          const sentiment = item.results.visual?.initialContent?.sentiment?.classification || 
                          item.results.visual?.exaResults?.sentiment?.classification;
          if (sentiment) tags.push(sentiment.charAt(0).toUpperCase() + sentiment.slice(1) + ' Sentiment');
        }
        if (item.results?.comparisonData) {
          tags.push('Cross-Checked');
        }
        if (item.results?.graphData || item.graphData) {
          tags.push('Timeline');
        }
        if (item.results?.citations?.length > 0) {
          tags.push(`${item.results.citations.length} Sources`);
        }
        
        return {
          id: item._id,
          query: item.userQuery,
          date: new Date(item.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }),
          status: 'Completed' as const,
          tags,
        };
      });
  }, [investigations, searchQuery]);

  const handleRowClick = (id: string) => {
    router.push(`/investigate/history/${id}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">History</h2>
          <p className="text-muted-foreground">View and manage your past investigations.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search history..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-card flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Topic / Query</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent font-medium">
                    Date
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {investigations === undefined ? 'Loading...' : 'No investigations found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(item.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted/50 rounded-md">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="truncate max-w-[300px]">{item.query}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {item.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.status === 'Completed' ? 'default' : 'secondary'}
                        className={item.status === 'Completed' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400' : ''}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.length > 0 ? (
                          item.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-5">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(item.id); }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Export PDF</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

