'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileType: 'csv' | 'jsonl';
  textColumn: string | null;
}

interface FileUploaderProps {
  onDataParsed: (data: ParsedData) => void;
  className?: string;
}

export function FileUploader({ onDataParsed, className }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const detectTextColumn = (headers: string[]): string | null => {
    // Priority order for text column detection
    const candidates = ['text', 'content', 'message', 'body', 'comment', 'post', 'review', 'description'];
    
    for (const candidate of candidates) {
      const found = headers.find(h => h.toLowerCase() === candidate);
      if (found) return found;
    }
    
    // Check for partial matches
    for (const candidate of candidates) {
      const found = headers.find(h => h.toLowerCase().includes(candidate));
      if (found) return found;
    }
    
    // Fallback to first string-looking column
    return headers[0] || null;
  };

  const parseCSV = (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
            return;
          }

          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string>[];
          const textColumn = detectTextColumn(headers);

          resolve({
            headers,
            rows,
            fileName: file.name,
            fileType: 'csv',
            textColumn,
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  };

  const parseJSONL = async (file: File): Promise<ParsedData> => {
    const text = await file.text();
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('JSONL file is empty');
    }

    const rows: Record<string, string>[] = [];
    const headerSet = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      try {
        const obj = JSON.parse(lines[i]);
        if (typeof obj !== 'object' || obj === null) {
          throw new Error(`Line ${i + 1} is not a valid JSON object`);
        }
        
        // Convert all values to strings
        const row: Record<string, string> = {};
        for (const [key, value] of Object.entries(obj)) {
          headerSet.add(key);
          row[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        rows.push(row);
      } catch (e) {
        throw new Error(`Invalid JSON at line ${i + 1}: ${e instanceof Error ? e.message : 'Parse error'}`);
      }
    }

    const headers = Array.from(headerSet);
    const textColumn = detectTextColumn(headers);

    return {
      headers,
      rows,
      fileName: file.name,
      fileType: 'jsonl',
      textColumn,
    };
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const fileName = file.name.toLowerCase();
      let parsedData: ParsedData;

      if (fileName.endsWith('.csv')) {
        parsedData = await parseCSV(file);
      } else if (fileName.endsWith('.jsonl') || fileName.endsWith('.json')) {
        parsedData = await parseJSONL(file);
      } else {
        throw new Error('Unsupported file type. Please upload a CSV or JSONL file.');
      }

      if (parsedData.rows.length === 0) {
        throw new Error('File contains no data rows');
      }

      if (parsedData.rows.length > 100) {
        throw new Error(`File has ${parsedData.rows.length} rows. Maximum 100 rows allowed for real-time analysis.`);
      }

      onDataParsed(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <Card
        className={cn(
          'relative border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          isProcessing && 'pointer-events-none opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
          <input
            type="file"
            accept=".csv,.jsonl,.json"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className={cn(
            'p-4 rounded-full mb-4 transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}>
            {isProcessing ? (
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className={cn(
                'size-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-1">
            {isProcessing ? 'Processing...' : 'Drop your dataset here'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Upload a CSV or JSONL file with text data to analyze
          </p>
          
          <Button variant="outline" size="sm" disabled={isProcessing} className="pointer-events-none">
            <FileText className="size-4 mr-2" />
            Choose File
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Supports .csv and .jsonl files (max 100 rows)
          </p>
        </label>
      </Card>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Upload Error</p>
            <p className="text-destructive/80">{error}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto size-6 shrink-0" 
            onClick={() => setError(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

