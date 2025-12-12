'use client';

import { useState } from 'react';
import { FileText, ChevronDown, Check, AlertTriangle, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ParsedData } from './file-uploader';

interface DataPreviewProps {
  data: ParsedData;
  selectedColumn: string;
  onColumnChange: (column: string) => void;
  onStartAnalysis: () => void;
  className?: string;
}

export function DataPreview({
  data,
  selectedColumn,
  onColumnChange,
  onStartAnalysis,
  className,
}: DataPreviewProps) {
  const [showAllRows, setShowAllRows] = useState(false);
  
  const previewRows = showAllRows ? data.rows : data.rows.slice(0, 5);
  const hasMoreRows = data.rows.length > 5;

  // Check if selected column has content
  const columnHasContent = data.rows.every(row => {
    const value = row[selectedColumn];
    return value && value.trim().length > 0;
  });

  const emptyRowCount = data.rows.filter(row => {
    const value = row[selectedColumn];
    return !value || value.trim().length === 0;
  }).length;

  return (
    <Card className={cn('border', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{data.fileName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.rows.length} rows • {data.headers.length} columns • {data.fileType.toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Columns className="size-4" />
                  {selectedColumn}
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {data.headers.map((header) => (
                  <DropdownMenuItem
                    key={header}
                    onClick={() => onColumnChange(header)}
                    className="gap-2"
                  >
                    {header === selectedColumn && <Check className="size-4" />}
                    {header !== selectedColumn && <div className="size-4" />}
                    {header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Column warning */}
        {emptyRowCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-chart-3/10 border border-chart-3/20 text-chart-3 dark:text-chart-3 text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              {emptyRowCount} row{emptyRowCount > 1 ? 's have' : ' has'} empty values in "{selectedColumn}" column.
              These will be skipped during analysis.
            </span>
          </div>
        )}

        {/* Data table preview */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="min-w-[300px]">
                  <span className="flex items-center gap-2">
                    {selectedColumn}
                    <Badge variant="secondary" className="text-xs font-normal">
                      Text to Analyze
                    </Badge>
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, index) => {
                const text = row[selectedColumn] || '';
                const isEmpty = !text.trim();
                
                return (
                  <TableRow key={index} className={cn(isEmpty && 'bg-muted/30 opacity-60')}>
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {isEmpty ? (
                        <span className="text-muted-foreground italic">Empty</span>
                      ) : (
                        <span className="line-clamp-2 text-sm">{text}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Show more/less */}
        {hasMoreRows && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllRows(!showAllRows)}
            className="w-full text-muted-foreground"
          >
            {showAllRows 
              ? 'Show less' 
              : `Show all ${data.rows.length} rows`
            }
          </Button>
        )}

        {/* Analysis options summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Ready to analyze <strong>{data.rows.length - emptyRowCount}</strong> rows
          </div>
          <Button onClick={onStartAnalysis} size="lg" className="gap-2">
            Start Analysis
            <span className="text-xs opacity-70">
              ~{Math.ceil((data.rows.length - emptyRowCount) / 3 * 5)}s
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

