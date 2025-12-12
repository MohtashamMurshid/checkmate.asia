import Link from "next/link";
import { Button } from "@/components/ui/button";
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function CTASection() {
  return (
    <section id="cta" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className={`text-3xl md:text-5xl font-semibold tracking-tight ${departureMono.className}`}>
            Ready to Investigate?
          </h2>
          <p className={`text-lg md:text-xl text-muted-foreground ${instrumentSans.className}`}>
            Join thousands of users investigating information with AI-powered fact-checking
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button asChild size="lg">
              <Link href="/contact">
                Book a Demo
              </Link>
            </Button>
          
          </div>
        </div>
      </div>
    </section>
  );
}

