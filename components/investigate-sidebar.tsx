'use client';

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, ShieldCheck, History, X, BarChart3, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvestigateSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InvestigateSidebar({ isOpen = true, onClose }: InvestigateSidebarProps) {
  const pathname = usePathname();
  const analyses = useQuery(api.datasetAnalyses.list);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(
    pathname.startsWith('/investigate/dashboard/analyze')
  );

  return (
    <aside className={cn(
      "border-r border-border/80 bg-background/95 backdrop-blur flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-20",
      isOpen 
        ? "w-64 translate-x-0" 
        : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0"
    )}>
      <div className="p-6 border-b border-border/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <ShieldCheck className="size-6" />
          <span>Checkmate</span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden size-8"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        <SidebarLink 
          href="/investigate" 
          icon={Search} 
          active={pathname === '/investigate'}
          onClick={onClose}
        >
          Investigate
        </SidebarLink>
        <SidebarLink 
          href="/investigate/dashboard" 
          icon={LayoutDashboard} 
          active={pathname === '/investigate/dashboard'}
          onClick={onClose}
        >
          Dashboard
        </SidebarLink>
        <SidebarLink 
          href="/investigate/history" 
          icon={History} 
          active={pathname === '/investigate/history'}
          onClick={onClose}
        >
          History
        </SidebarLink>
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
          <div className="space-y-1">
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith('/investigate/dashboard/analyze')
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="size-4" />
                  <span>Dataset Analysis</span>
                </div>
                {isAnalysisOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              <Link
                href="/investigate/dashboard/analyze"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === '/investigate/dashboard/analyze'
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                New Analysis
              </Link>
              {analyses && analyses.length > 0 && (
                <>
                  <Link
                    href="/investigate/dashboard/analyze/history"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors",
                      pathname === '/investigate/dashboard/analyze/history'
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    All History
                  </Link>
                  <div className="pl-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                    {analyses.slice(0, 10).map((analysis) => (
                      <Link
                        key={analysis._id}
                        href={`/investigate/dashboard/analyze/history/${analysis._id}`}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors group",
                          pathname === `/investigate/dashboard/analyze/history/${analysis._id}`
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <FileText className="size-3 opacity-50 group-hover:opacity-100" />
                        <span className="truncate flex-1">{analysis.fileName}</span>
                      </Link>
                    ))}
                    {analyses.length > 10 && (
                      <div className="px-3 py-1.5 text-xs text-muted-foreground">
                        +{analyses.length - 10} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </nav>
      <div className="p-4 border-t border-border/80 text-xs text-muted-foreground">
        <p>© 2024 Checkmate Inc.</p>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  active,
  children,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}

