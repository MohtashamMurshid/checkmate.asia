'use client';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import Link from "next/link";

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
  const router = useRouter();

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
            <Logo />

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-1.5">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.sectionId}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer hover:underline"
                  onClick={() => scrollToSection(item.sectionId)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {pathname === '/investigate' && (
                <div className="hidden md:flex items-center gap-1.5 mr-2">
                  <Link href="/investigate">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="h-9 px-4"
                    >
                      Investigate
                    </Button>
                  </Link>
                </div>
              )}
              <Button variant="ghost" size="icon-sm" className="cursor-pointer" aria-label="Toggle theme" onClick={toggleTheme}>
                <Sun className="hidden dark:block" />
                <Moon className="block dark:hidden" />
              </Button>
              <Button size="sm" className="h-9 px-4" onClick={(
                e: React.MouseEvent<HTMLButtonElement>
              ) => {
                e.preventDefault();
                window.location.href = '/contact';
              }}>
                Book a Demo
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}


