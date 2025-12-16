import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[32rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // Styles
      "bg-card border border-border/60 shadow-sm",
      className,
    )}
  >
    {/* Visualization / Image Section */}
    <div className="relative flex-1 w-full overflow-hidden bg-muted/20 p-5 flex items-center justify-center">
       {/* Ambient Glow matching landing.tsx */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-orange-400/20 blur-[80px] rounded-full pointer-events-none opacity-60 dark:opacity-40" />

       <div className="w-full h-full relative z-10">
          {background}
       </div>
    </div>

    {/* Text Section */}
    <div className="flex flex-col gap-2 p-6 z-10 bg-card border-t border-border/10">
      <div className="flex items-center gap-3 mb-1">
        <Icon className="h-6 w-6 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
            {name}
        </h3>
      </div>
      <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">{description}</p>
      
      <div className="mt-2">
        <Button variant="ghost" asChild size="sm" className="pl-0 h-auto hover:bg-transparent hover:text-primary transition-colors">
            <a href={href} className="flex items-center text-xs font-medium">
            {cta}
            <ArrowRightIcon className="ml-2 h-3 w-3" />
            </a>
        </Button>
      </div>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
