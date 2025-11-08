export function SourcesSection() {
  const primarySources: Array<{ label: string; caption: string }> = [
    { label: "X (Twitter)", caption: "Tweets from Prime Ministers" },
    { label: "TikTok", caption: "Posts from brand accounts" },
    { label: "Published Research", caption: "Peer‑reviewed journals / DOI" },
  ]

  const otherSources: string[] = [
    "Government portals",
    "Reputable newsrooms",
    "SEC / EDGAR filings",
    "Company press releases",
    "GitHub releases",
    "arXiv preprints",
    "Court records",
    "Public datasets",
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

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primarySources.map((s) => (
            <div
              key={s.label}
              className="bg-card/50 hover:bg-card transition-colors rounded-2xl border p-5 md:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-medium">
                  {s.label}
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">{s.caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {otherSources.map((label) => (
            <span
              key={label}
              className="text-sm rounded-full border bg-background px-3 py-1.5 text-foreground/80 hover:text-foreground transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}


