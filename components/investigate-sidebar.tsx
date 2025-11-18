'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, ShieldCheck, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestigateSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InvestigateSidebar({ isOpen = true, onClose }: InvestigateSidebarProps) {
  const pathname = usePathname();

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
      <nav className="flex-1 p-4 space-y-2">
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
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
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

