'use client';

import * as React from 'react';
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ChevronDown, Newspaper, Users, Shield, Globe, Code, Server, ShieldCheck, Activity, TrendingUp, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

interface NavItem {
  label: string;
  sectionId: string;
  columns?: {
    title?: string;
    items: {
      title: string;
      description?: string;
      icon: React.ComponentType<{ className?: string }>;
      href?: string;
    }[];
  }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', sectionId: 'home' },
  { 
    label: 'Product', 
    sectionId: 'features',
    columns: [
      {
        items: [
          { title: "Fact Verification", description: "Cross-reference claims against verified global sources", icon: ShieldCheck, href: "/investigate" },
          { title: "Bias Detection", description: "Uncover hidden political and corporate biases", icon: Activity, href: "/investigate" },
          { title: "Sentiment Analysis", description: "Decode emotional undercurrents and predict reactions", icon: TrendingUp, href: "/investigate" },
          { title: "Source Tracing", description: "Map the complete genealogy of stories", icon: Globe, href: "/investigate" },
          { title: "Creator Profiling", description: "Analyze creator credibility and accuracy records", icon: User, href: "/investigate" },
          { title: "Entity Background", description: "Deep-dive verification of companies and organizations", icon: Building2, href: "/investigate" }
        ]
      }
    ]
  },
  { 
    label: 'Usage', 
    sectionId: 'usage',
    columns: [
      {
        items: [
           { title: "SAAS Enterprise", description: "Fully managed cloud solution", icon: Globe },
           { title: "Enterprise API", description: "Integrate with existing infra", icon: Code },
           { title: "On-prem Agents", description: "Complete data control", icon: Server }
        ]
      }
    ]
  },
  { 
    label: 'Solutions', 
    sectionId: 'use-cases',
    columns: [
      {
        items: [
          { title: "News & Media", description: "Automated fact-checking for newsrooms", icon: Newspaper, href: "/newsreporting" },
          { title: "Public Relations", description: "Monitor brand sentiment in real-time", icon: Users, href: "/publicrelations" },
          { title: "Data Compliance", description: "Regulatory boundaries for AI agents", icon: Shield, href: "/datacompliance" }
        ]
      }
    ]
  },
  { label: 'Sources', sectionId: 'sources' },
  { label: 'Research', sectionId: 'research' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const scrollToSection = (sectionId: string) => {
    setMenuState(false);
    if (sectionId === 'research') {
      window.location.href = '/research';
      return;
    }
   
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
        <nav className="w-full px-2 mt-4" onMouseLeave={() => setHoveredItem(null)}>
            <div className={cn(
                'mx-auto transition-all duration-300 ease-in-out relative',
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
                        <Logo showText={!isScrolled} />

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
                        <ul className="flex gap-1 items-center justify-center">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.sectionId} onMouseEnter={() => setHoveredItem(item.label)}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
                                        onClick={() => scrollToSection(item.sectionId)}
                                    >
                                        {item.label}
                                        {item.columns && <ChevronDown className="ml-1 size-3 transition-transform group-hover:rotate-180" />}
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

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                    {hoveredItem && NAV_ITEMS.find(item => item.label === hoveredItem)?.columns && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 pt-4 mx-auto w-full max-w-4xl z-50"
                        >
                            <div className="bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl overflow-hidden p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {NAV_ITEMS.find(item => item.label === hoveredItem)?.columns?.map((column, idx) => (
                                        <div key={idx} className={cn("space-y-4", 
                                            // If only 1 column, maybe span more?
                                            NAV_ITEMS.find(item => item.label === hoveredItem)?.columns?.length === 1 ? "col-span-full" : ""
                                        )}>
                                            {column.title && (
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                                    {column.title}
                                                </h4>
                                            )}
                                            <div className="grid gap-4">
                                                {column.items.map((subItem, subIdx) => (
                                                    <Link 
                                                        key={subIdx} 
                                                        href={subItem.href || `#${NAV_ITEMS.find(item => item.label === hoveredItem)?.sectionId}`}
                                                        onClick={() => {
                                                            setHoveredItem(null);
                                                            // If it's a hash link, scroll to it? Or just navigation.
                                                            if (!subItem.href) scrollToSection(NAV_ITEMS.find(item => item.label === hoveredItem)?.sectionId || '');
                                                        }}
                                                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group/item"
                                                    >
                                                        <div className="mt-1 p-2 rounded-md bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors">
                                                            <subItem.icon className="size-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-medium text-foreground group-hover/item:text-primary transition-colors">
                                                                {subItem.title}
                                                            </h5>
                                                            {subItem.description && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    {subItem.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    </header>
  );
}
