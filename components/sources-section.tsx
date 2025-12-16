import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Scale, Newspaper, GraduationCap } from "lucide-react";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function SourcesSection() {
  const sourceCategories = [
    {
      title: "Gov & Court Records",
      icon: Scale,
      items: [
        { label: "Government portals" },
        { label: "SEC / EDGAR filings" },
        { label: "Court records" },
      ],
      visual: GovVisual
    },
    {
      title: "Research Papers",
      icon: GraduationCap,
      items: [
        { label: "Published Research", caption: "Peer‑reviewed journals / DOI" },
        { label: "arXiv preprints" },
        { label: "Public datasets" },
        { label: "GitHub releases" },
      ],
      visual: ResearchVisual
    },
    {
      title: "Press",
      icon: Newspaper,
      items: [
        { label: "Reputable newsrooms" },
        { label: "Company press releases" },
      ],
      visual: PressVisual
    },
    {
      title: "Social Media",
      icon: MessageSquare,
      items: [
        { label: "X (Twitter)", caption: "Tweets from Prime Ministers" },
        { label: "TikTok", caption: "Posts from brand accounts" },
      ],
      visual: SocialVisual
    },
  ];

  return (
    <section id="sources" className="py-20 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-16 md:mb-24 text-center space-y-4">
          <h2 className={`text-sm md:text-base text-primary uppercase tracking-wider `}>
            Data Integrity
          </h2>
          <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1] text-balance">
            Checkmate cites <span className="text-primary">ONLY</span> from{" "}
            <span className="text-primary">REAL SOURCES</span>
          </h3>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${instrumentSans.className}`}>
            Credible, traceable, and verifiable sources across platforms and publications.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sourceCategories.map((category) => (
            <Card
              key={category.title}
              className="group relative overflow-hidden bg-background/60 hover:bg-background/80 transition-all hover:shadow-lg border-border/60 flex flex-col"
            >
              <CardHeader className="pb-2">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <category.icon className="h-6 w-6" />
                </div>
                <CardTitle className={`text-xl font-semibold tracking-tight ${instrumentSans.className}`}>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-6">
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <span className={`text-sm font-medium text-foreground `}>
                        {item.label}
                      </span>
                      {item.caption && (
                        <p className={`text-xs text-muted-foreground/80 leading-relaxed ${instrumentSans.className}`}>
                          {item.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-4 border-t border-border/40">
                  <div className="h-24 w-full relative overflow-hidden rounded bg-muted/20">
                    <category.visual />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const GovVisual = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-2 opacity-60">
    <div className="w-3/4 h-1.5 bg-primary/20 rounded-full mb-2" />
    <div className="w-full h-1 bg-muted-foreground/20 rounded-full mb-1" />
    <div className="w-5/6 h-1 bg-muted-foreground/20 rounded-full mb-1" />
    <div className="w-4/5 h-1 bg-muted-foreground/20 rounded-full" />
    <div className="mt-2 w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center">
       <div className="w-3 h-3 bg-primary/20 rounded-sm" />
    </div>
  </div>
)

const ResearchVisual = () => (
  <div className="w-full h-full p-2 relative opacity-60">
     <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed border-primary/20 rounded flex items-center justify-center">
        <div className="grid grid-cols-2 gap-1">
           <div className="w-8 h-10 bg-muted-foreground/10 rounded-sm" />
           <div className="w-8 h-10 bg-primary/10 rounded-sm" />
        </div>
     </div>
  </div>
)

const PressVisual = () => (
  <div className="w-full h-full p-3 opacity-60 flex items-end justify-between">
      <div className="w-4 h-10 bg-primary/20 rounded-t-sm" />
      <div className="w-4 h-14 bg-muted-foreground/10 rounded-t-sm" />
      <div className="w-4 h-8 bg-primary/10 rounded-t-sm" />
      <div className="w-4 h-12 bg-muted-foreground/20 rounded-t-sm" />
  </div>
)

const SocialVisual = () => (
   <div className="w-full h-full p-2 opacity-60 relative overflow-hidden">
      <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-blue-400/20" />
      <div className="absolute top-8 right-8 w-4 h-4 rounded-full bg-indigo-400/20" />
      <div className="absolute bottom-4 left-10 w-8 h-8 rounded-full bg-primary/10" />
      
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
   </div>
)


