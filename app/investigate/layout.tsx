import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { InvestigateSidebar } from "@/components/investigate-sidebar";

export default function InvestigateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <InvestigateSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border/80 bg-background/90 backdrop-blur p-4 flex items-center justify-between sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5" />
            <span>Checkmate</span>
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
