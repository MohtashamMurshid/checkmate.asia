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
         
          <h3 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1] text-balance">
            Checkmate cites <span className="text-primary">ONLY</span> from{" "}
            <span className="text-primary">REAL SOURCES</span>
          </h3>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto ${instrumentSans.className}`}>
            Credible, traceable, and verifiable sources across platforms and publications.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sourceCategories.map((category) => (
            <Card
              key={category.title}
              className="group relative overflow-hidden bg-background/60 hover:bg-background/80 transition-all hover:shadow-lg border-border/60 flex flex-col md:flex-row h-full md:h-80"
            >
              <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className={`text-xl font-semibold tracking-tight ${instrumentSans.className}`}>
                    {category.title}
                  </h3>
                </div>
                
                <div className="space-y-3 mt-6">
                  {category.items.map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <span className={`text-base font-semibold text-foreground/90`}>
                        {item.label}
                      </span>
                      {item.caption && (
                        <p className={`text-xs text-muted-foreground leading-relaxed mt-0.5 ${instrumentSans.className}`}>
                          {item.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden bg-muted/20 min-h-[200px] md:min-h-0">
                 <div className="absolute inset-0 p-6 flex items-center justify-center">
                    <category.visual />
                 </div>
                 {/* Gradient overlay for blending */}
                 <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-background/10 pointer-events-none" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const GovVisual = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 scale-110">
    <div className="w-32 h-40 bg-background border border-border/60 shadow-md rounded-lg relative flex flex-col items-center p-4 ring-1 ring-border/5">
       <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 mb-4 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
       </div>
       <div className="w-full h-2 bg-primary/20 rounded-full mb-3" />
       <div className="w-full h-1.5 bg-muted-foreground/20 rounded-full mb-2" />
       <div className="w-3/4 h-1.5 bg-muted-foreground/20 rounded-full mb-2" />
       <div className="w-5/6 h-1.5 bg-muted-foreground/20 rounded-full mb-auto" />
       
       <div className="w-full flex gap-2 mt-auto pt-2 border-t border-dashed border-border/50">
          <div className="flex-1 h-6 bg-muted-foreground/10 rounded-sm" />
          <div className="flex-1 h-6 bg-primary/10 rounded-sm" />
       </div>
       
       <div className="absolute -right-3 top-6 w-8 h-8 rounded-full bg-background shadow-sm border border-border flex items-center justify-center">
         <div className="w-3 h-3 rounded-full bg-green-500" />
       </div>
    </div>
  </div>
)

const ResearchVisual = () => (
  <div className="w-full h-full p-4 relative flex items-center justify-center">
     <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-48 h-48 rounded-full border border-dashed border-primary/40 animate-[spin_10s_linear_infinite]" />
     </div>
     <div className="grid grid-cols-2 gap-4 relative z-10 scale-110">
        <div className="w-20 h-24 bg-background border border-border/60 shadow-md rounded-lg p-2.5 flex flex-col gap-2 ring-1 ring-border/5">
           <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mb-1">
             <div className="w-4 h-4 bg-primary/40 rounded-sm" />
           </div>
           <div className="w-full h-1.5 bg-foreground/20 rounded-full" />
           <div className="w-2/3 h-1.5 bg-foreground/20 rounded-full" />
        </div>
        <div className="w-20 h-24 bg-background border border-border/60 shadow-md rounded-lg p-2.5 flex flex-col gap-2 translate-y-6 ring-1 ring-border/5">
           <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center mb-1">
             <div className="w-4 h-4 bg-indigo-500/40 rounded-sm" />
           </div>
           <div className="w-full h-1.5 bg-foreground/20 rounded-full" />
           <div className="w-2/3 h-1.5 bg-foreground/20 rounded-full" />
        </div>
     </div>
     
     {/* Connection lines */}
     <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ strokeWidth: 2 }}>
        <path d="M 50% 40% L 60% 60%" stroke="currentColor" className="text-primary/20" strokeDasharray="4 4" />
        <circle cx="50%" cy="40%" r="3" className="fill-primary" />
        <circle cx="60%" cy="60%" r="3" className="fill-indigo-500" />
     </svg>
  </div>
)

const PressVisual = () => (
  <div className="w-full h-full p-4 flex items-center justify-center relative">
      <div className="w-56 h-36 bg-background border border-border/60 shadow-lg rounded-xl overflow-hidden flex flex-col ring-1 ring-border/5 relative z-10">
         <div className="h-12 bg-muted/50 p-3 flex items-center justify-between border-b border-border/50">
             <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-red-400/80" />
               <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
               <div className="w-2 h-2 rounded-full bg-green-400/80" />
             </div>
             <div className="w-24 h-4 bg-background rounded-full border border-border/40" />
         </div>
         <div className="p-4 flex gap-4">
            <div className="w-16 h-16 bg-muted/50 rounded-md border border-border/20 shrink-0 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div className="flex-1 space-y-2 py-1">
               <div className="w-full h-3 bg-foreground/80 rounded-full" />
               <div className="w-3/4 h-3 bg-foreground/80 rounded-full" />
               <div className="w-1/2 h-2 bg-muted-foreground/40 rounded-full mt-2" />
            </div>
         </div>
      </div>
      
      <div className="absolute top-2 right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-2 left-4 w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl -z-10" />
  </div>
)

const SocialVisual = () => (
   <div className="w-full h-full p-4 relative flex items-center justify-center">
      <div className="relative w-full max-w-[240px] h-full flex items-center justify-center">
         <div className="absolute top-2 left-0 bg-background border border-border/60 shadow-md rounded-2xl p-4 w-44 transform -rotate-6 transition-transform hover:-rotate-3 ring-1 ring-border/5">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-500">X</span>
               </div>
               <div className="w-20 h-2.5 bg-foreground/10 rounded-full" />
            </div>
            <div className="w-full h-2 bg-muted-foreground/20 rounded-full mb-2" />
            <div className="w-5/6 h-2 bg-muted-foreground/20 rounded-full" />
         </div>
         
         <div className="absolute bottom-2 right-0 bg-background border border-border/60 shadow-md rounded-2xl p-4 w-44 transform rotate-6 transition-transform hover:rotate-3 ring-1 ring-border/5 z-10">
            <div className="flex items-center gap-3 mb-3 flex-row-reverse">
               <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">Tk</span>
               </div>
               <div className="w-20 h-2.5 bg-foreground/10 rounded-full" />
            </div>
            <div className="w-full h-2 bg-muted-foreground/20 rounded-full mb-2" />
            <div className="w-5/6 h-2 bg-muted-foreground/20 rounded-full" />
         </div>
         
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-background/80 rounded-full flex items-center justify-center border border-primary/20 shadow-lg backdrop-blur-md z-20">
             <MessageSquare className="w-6 h-6 text-primary" />
         </div>
      </div>
   </div>
)


