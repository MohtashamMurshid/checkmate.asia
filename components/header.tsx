'use client';

import * as React from 'react';
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

interface NavItem {
  label: string;
  sectionId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', sectionId: 'home' },
  { label: 'Features', sectionId: 'features' },
  { label: 'Solutions', sectionId: 'solutions' },
  { label: 'Sources', sectionId: 'sources' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const scrollToSection = (sectionId: string) => {
    setMenuState(false);
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn("fixed top-0 z-50 w-full", instrumentSans.className)}>
        <nav className="w-full px-2 mt-4">
            <div className={cn(
                'mx-auto transition-all duration-300 ease-in-out',
                // Scrolled state (pill shape) vs Default state (wide)
                isScrolled && !menuState
                    ? 'bg-background/80 max-w-4xl rounded-2xl border border-border/60 backdrop-blur-md shadow-md py-2 px-6' 
                    : 'max-w-5xl py-3 px-4',
                // Mobile menu open state overrides everything
                menuState && 'bg-background max-w-lg rounded-3xl border border-border/20 shadow-2xl p-6 backdrop-blur-xl'
            )}>
                <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0">
                    {/* Logo & Mobile Toggle */}
                    <div className="flex w-full justify-between lg:w-auto">
                        <Logo />

                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                            className="relative z-20 ml-auto block cursor-pointer p-2 lg:hidden text-foreground"
                        >
                            <Menu className={cn("size-6 transition-all duration-200", menuState ? "rotate-180 scale-0 opacity-0 hidden" : "block")} />
                            <X className={cn("size-6 transition-all duration-200", menuState ? "block rotate-0 scale-100 opacity-100" : "hidden -rotate-180 scale-0 opacity-0")} />
                        </button>
                    </div>

                    {/* Desktop Center Nav */}
                    <div className={cn(
                        "absolute left-1/2 -translate-x-1/2 hidden lg:block transition-all duration-300",
                        isScrolled ? "opacity-100" : "opacity-100"
                    )}>
                        <ul className="flex gap-1 items-center">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.sectionId}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => scrollToSection(item.sectionId)}
                                    >
                                        {item.label}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-2">
                        {pathname === '/investigate' && (
                            <Link href="/investigate">
                                <Button variant="default" size="sm">Investigate</Button>
                            </Link>
                        )}
                        
                        <Button variant="ghost" size="icon" className="cursor-pointer shrink-0" aria-label="Toggle theme" onClick={toggleTheme}>
                            <Sun className="size-4 hidden dark:block" />
                            <Moon className="size-4 block dark:hidden" />
                        </Button>

                        <Button size="sm" onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/contact';
                        }}>
                            Book a Demo
                        </Button>
                    </div>

                    {/* Mobile Menu Dropdown (Integrated) */}
                    <div className={cn(
                        "w-full flex-col gap-6 lg:hidden transition-all duration-300 ease-in-out",
                         menuState ? "flex mt-4 opacity-100" : "hidden opacity-0 h-0"
                    )}>
                        <ul className="space-y-4 text-base px-2">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.sectionId}>
                                    <button
                                        onClick={() => scrollToSection(item.sectionId)}
                                        className="text-muted-foreground hover:text-foreground block duration-150 w-full text-left font-medium"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="h-px bg-border/50 w-full" />
                        
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                    <Sun className="size-4 hidden dark:block" />
                                    <Moon className="size-4 block dark:hidden" />
                                </Button>
                            </div>
                            
                            {pathname === '/investigate' && (
                                <Link href="/investigate" className="w-full">
                                    <Button variant="outline" className="w-full justify-start">Investigate</Button>
                                </Link>
                            )}
                            <Button className="w-full" onClick={() => window.location.href = '/contact'}>
                                Book a Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>
  );
}
