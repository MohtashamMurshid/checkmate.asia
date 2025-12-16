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
      "bg-background border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80",
      className,
    )}
  >
    {/* Visualization / Image Section */}
    <div className="relative flex-1 w-full overflow-hidden bg-muted/20 p-5 flex items-center justify-center min-h-[14rem]">
       {/* Ambient Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/5 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

       <div className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
          {background}
       </div>
    </div>

    {/* Text Section */}
    <div className="flex flex-col gap-3 p-6 z-10 bg-card/50 backdrop-blur-sm border-t border-border/5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">
            {name}
        </h3>
      </div>
      <p className="max-w-lg text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
      
      <div className="pt-2">
        <Button variant="link" asChild size="sm" className="pl-0 h-auto text-primary hover:text-primary/80 transition-colors p-0">
            <a href={href} className="flex items-center text-xs font-semibold">
            {cta}
            <ArrowRightIcon className="ml-2 h-3.5 w-3.5" />
            </a>
        </Button>
      </div>
    </div>
  </div>
);

export { BentoCard, BentoGrid };
