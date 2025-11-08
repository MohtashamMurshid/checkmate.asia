'use client';

import Link from "next/link";
import localFont from "next/font/local";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="mt-4 mb-4 rounded-xl border border-border/60 bg-background/60 shadow-sm">
          <nav className="flex h-14 items-center justify-between px-3 sm:px-4">
            {/* Brand */}
            <Link href="/" className={`text-sm sm:text-base tracking-tight ${departureMono.className}`}>
              Checkmate
            </Link>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => scrollToSection('home')}>
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollToSection('features')}>
                Features
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollToSection('solutions')}>
                Solutions
              </Button>
              <Button variant="ghost" size="sm" onClick={() => scrollToSection('sources')}>
                Sources
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon-sm" aria-label="Toggle theme" onClick={toggleTheme}>
                <Sun className="hidden dark:block" />
                <Moon className="block dark:hidden" />
              </Button>
              <Button size="sm" className="h-9 px-4" onClick={() => scrollToSection('cta')}>
                Get started
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}


