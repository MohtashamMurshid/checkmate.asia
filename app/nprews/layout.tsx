'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Overview',
    href: '/nprews',
    icon: LayoutDashboard,
  },
  {
    name: 'Briefs',
    href: '/nprews/briefs',
    icon: FileText,
  },
  {
    name: 'Actors',
    href: '/nprews/actors',
    icon: Users,
  },
  {
    name: 'Signals',
    href: '/nprews/signals',
    icon: Activity,
  },
];

export default function NPREWSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 flex flex-col',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Header */}
        <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-white dark:text-zinc-900">RI</span>
              </div>
              <div>
                <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Risk Intel</h1>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="h-7 w-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center mx-auto">
              <span className="text-xs font-semibold text-white dark:text-zinc-900">RI</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center h-8 text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">{children}</main>
    </div>
  );
}
