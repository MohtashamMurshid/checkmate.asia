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
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredHistory = mockHistory.filter(item => 
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (id: string) => {
    // Only top 3 are clickable for this demo
    if (['1', '2', '3'].includes(id)) {
      router.push(`/investigate/history/${id}`);
    } else {
      // Optional: alert user that this is a mock item without details
      // alert("Details not available for this mock item.");
    }
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
                    No investigations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((item) => (
                  <TableRow 
                    key={item.id}
                    className={['1', '2', '3'].includes(item.id) ? "cursor-pointer hover:bg-muted/50" : ""}
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
                        {item.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {tag}
                          </Badge>
                        ))}
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

const mockHistory = [
  {
    id: '1',
    query: 'AI Regulation in EU vs US',
    date: 'Nov 18, 2025 • 2:30 PM',
    status: 'Completed',
    tags: ['Neutral Bias', 'High Confidence'],
  },
  {
    id: '2',
    query: 'Impact of Quantum Computing on Encryption',
    date: 'Nov 17, 2025 • 10:15 AM',
    status: 'Completed',
    tags: ['Scientific', 'Tech'],
  },
  {
    id: '3',
    query: 'Recent Tech Stock Volatility Reasons',
    date: 'Nov 16, 2025 • 4:45 PM',
    status: 'Completed',
    tags: ['Financial', 'Mixed Sentiment'],
  },
  {
    id: '4',
    query: 'Global Renewable Energy Targets 2030',
    date: 'Nov 15, 2025 • 9:00 AM',
    status: 'Completed',
    tags: ['Policy', 'Positive Trend'],
  },
  {
    id: '5',
    query: 'Deepfake Detection Tools Comparison',
    date: 'Nov 14, 2025 • 1:20 PM',
    status: 'Draft',
    tags: ['Incomplete'],
  },
  {
    id: '6',
    query: 'Mars Colonization Feasibility Study',
    date: 'Nov 12, 2025 • 11:30 AM',
    status: 'Completed',
    tags: ['Scientific', 'Speculative'],
  },
  {
    id: '7',
    query: 'History of Digital Currencies',
    date: 'Nov 10, 2025 • 3:15 PM',
    status: 'Completed',
    tags: ['Historical', 'Finance'],
  },
  {
    id: '8',
    query: 'Corporate Tax Rates by Country 2025',
    date: 'Nov 08, 2025 • 10:00 AM',
    status: 'Completed',
    tags: ['Data Heavy', 'Neutral'],
  },
];
