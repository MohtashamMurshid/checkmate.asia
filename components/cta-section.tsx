import Link from "next/link";
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function CTASection() {
  return (
    <section id="cta" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className={`text-3xl md:text-5xl font-semibold tracking-tight ${departureMono.className}`}>
            Ready to Investigate?
          </h2>
          <p className={`text-lg md:text-xl text-muted-foreground ${instrumentSans.className}`}>
            Join thousands of users investigating information with AI-powered fact-checking
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-foreground text-background hover:bg-foreground/90 h-10 px-5"
            >
              Book a Demo
            </Link>
          
          </div>
        </div>
      </div>
    </section>
  );
}

