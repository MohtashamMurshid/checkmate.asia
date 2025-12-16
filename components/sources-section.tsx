import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function SourcesSection() {
  const sourceCategories: Array<{
    title: string
    items: Array<{ label: string; caption?: string }>
  }> = [
    {
      title: "Social Media",
      items: [
        { label: "X (Twitter)", caption: "Tweets from Prime Ministers" },
        { label: "TikTok", caption: "Posts from brand accounts" },
      ],
    },
    {
      title: "Gov & Court Records",
      items: [
        { label: "Government portals" },
        { label: "SEC / EDGAR filings" },
        { label: "Court records" },
      ],
    },
    {
      title: "Press",
      items: [
        { label: "Reputable newsrooms" },
        { label: "Company press releases" },
      ],
    },
    {
      title: "Research Papers",
      items: [
        { label: "Published Research", caption: "Peer‑reviewed journals / DOI" },
        { label: "arXiv preprints" },
        { label: "Public datasets" },
        { label: "GitHub releases" },
      ],
    },
  ]

  return (
    <section id="sources" className="py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1] text-balance">
            Checkmate cites <span className="text-primary">ONLY</span> from{" "}
            <span className="text-primary">REAL SOURCES</span>
          </h2>
          <p className={`text-muted-foreground ${instrumentSans.className}`}>
            Credible, traceable, and verifiable sources across platforms and publications.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sourceCategories.map((category) => (
            <div
              key={category.title}
              className="bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors rounded-xl border border-border/60 p-5 md:p-6 shadow-xl"
            >
              <h3 className={`text-lg font-semibold mb-4 tracking-tight ${instrumentSans.className}`}>{category.title}</h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.label}>
                    <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                      {item.label}
                    </span>
                    {item.caption && (
                      <p className={`text-muted-foreground mt-2 text-xs ${instrumentSans.className}`}>
                        {item.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


