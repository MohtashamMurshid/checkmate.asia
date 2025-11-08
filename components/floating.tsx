import { Button } from './ui/button'
import Link from 'next/link'

export default function floating() {
  return (
    
              <div className="relative mx-auto mt-12 w-full max-w-4xl">
            <div className="rounded-xl border border-border/70 bg-background/60 p-5 text-left shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Welcome to Checkmate — your truth companion.</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  Mohtasham
                  <span className="relative inline-flex h-2 w-2 items-center justify-center">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-80" />
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="rounded-full border-border/60 bg-transparent hover:bg-muted/50" asChild>
                  <Link href="/">
                    Analyze content
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-border/60 bg-transparent hover:bg-muted/50" asChild>
                  <Link href="/api">
                    Explore API
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-border/60 bg-transparent hover:bg-muted/50" asChild>
                  <Link href="/news">
                    Get news
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-border/60 bg-transparent hover:bg-muted/50" asChild>
                  <Link href="/crowdsource">
                   Vote on news
                  </Link>
                </Button>
                <button aria-label="Play" className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background hover:bg-muted/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
  )
}
