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
    <section id="sources" className="py-12 md:py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-balance text-3xl font-semibold md:text-5xl">
            Checkmate cites <span className="text-primary">ONLY</span> from{" "}
            <span className="text-primary">REAL SOURCES</span>
          </h2>
          <p className="text-muted-foreground">
            Credible, traceable, and verifiable sources across platforms and publications.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sourceCategories.map((category) => (
            <div
              key={category.title}
              className="bg-card/50 hover:bg-card transition-colors rounded-2xl border p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.label}>
                    <span className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-medium">
                      {item.label}
                    </span>
                    {item.caption && (
                      <p className="text-muted-foreground mt-2 text-xs">
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


