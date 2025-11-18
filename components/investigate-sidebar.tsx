'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, ShieldCheck, History } from "lucide-react";

export function InvestigateSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/80 bg-background/95 backdrop-blur hidden md:flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-border/80">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <ShieldCheck className="size-6" />
          <span>Checkmate</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink 
          href="/investigate" 
          icon={Search} 
          active={pathname === '/investigate'}
        >
          Investigate
        </SidebarLink>
        <SidebarLink 
          href="/investigate/dashboard" 
          icon={LayoutDashboard} 
          active={pathname === '/investigate/dashboard'}
        >
          Dashboard
        </SidebarLink>
        <SidebarLink 
          href="/investigate/history" 
          icon={History} 
          active={pathname === '/investigate/history'}
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
}: {
  href: string;
  icon: React.ElementType;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
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

