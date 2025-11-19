'use client';

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { InvestigateSidebar } from "@/components/investigate-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InvestigateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <InvestigateSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border/80 bg-background/90 backdrop-blur p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="size-8"
            >
              <Menu className="size-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5" />
              <span>Checkmate</span>
            </Link>
          </div>
        </header>

        {/* Desktop Sidebar Toggle */}
        <div className={cn(
          "hidden md:block fixed top-4 z-30 transition-all duration-300",
          isSidebarOpen ? "left-[280px]" : "left-4"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="size-8 bg-background/95 backdrop-blur border shadow-sm"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        {children}
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[15] md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
