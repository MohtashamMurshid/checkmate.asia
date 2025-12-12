import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function HeroSubtitle() {
  return (
    <section id="about" className="py-12 md:py-20 flex flex-col items-center justify-center container mx-auto px-4 md:px-6">
      <h2 className={`text-2xl md:text-4xl font-semibold text-center mb-3 tracking-tight ${departureMono.className}`}>
        Noisy world, noisy data
      </h2>
      <p className={`text-lg md:text-xl text-muted-foreground font-medium text-center max-w-2xl ${instrumentSans.className}`}>
        Quality decisions require factually&nbsp;accurate data
      </p>
    </section>
  );
}

