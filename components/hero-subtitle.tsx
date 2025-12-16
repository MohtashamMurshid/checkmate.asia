import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export function HeroSubtitle() {
  return (
    <section id="about" className="py-12 md:py-20 flex flex-col items-center justify-center container mx-auto px-4 md:px-6">
      <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1] text-center mb-3">
        Noisy world, noisy data
      </h2>
      <p className={`text-lg md:text-xl text-muted-foreground font-medium text-center max-w-2xl ${instrumentSans.className}`}>
        Quality decisions require factually&nbsp;accurate data
      </p>
    </section>
  );
}

