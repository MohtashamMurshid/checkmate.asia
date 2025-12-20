'use client';

import { Header } from '@/components/header';
import FooterSection from '@/components/footer';
import { ArrowRight, Newspaper, CheckCircle2, AlertTriangle, TrendingUp, Shield, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import localFont from 'next/font/local';
import { Instrument_Sans } from 'next/font/google';

const departureMono = localFont({ src: "../../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function NewsReportingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/#use-cases"
            className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to Use Cases
          </Link>

          {/* Header Section */}
          <header className="mb-12 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Newspaper className="size-6" />
              </div>
              <span className={`text-sm uppercase tracking-wider text-muted-foreground ${departureMono.className}`}>
                Use Case
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight ${instrumentSans.className}`}>
              News Reporting
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              Automated fact-checking and bias detection for modern newsrooms. 
              Empower your editorial team with real-time verification tools that ensure accuracy and maintain trust.
            </p>
          </header>

          <div className="h-px bg-border w-full mb-12" />

          {/* Overview Section */}
          <section className="mb-16 space-y-6">
            <h2 className={`text-2xl md:text-3xl font-medium ${instrumentSans.className}`}>
              Overview
            </h2>
            <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground leading-relaxed">
              <p>
                In today's fast-paced media landscape, newsrooms face unprecedented pressure to publish accurate, 
                unbiased content while maintaining speed and competitiveness. Checkmate provides comprehensive 
                verification infrastructure that integrates seamlessly into your editorial workflow, enabling 
                journalists to verify claims, detect bias, and trace sources in seconds—not hours.
              </p>
              <p>
                Our platform cross-references claims against trusted databases, real-time web sources, and 
                historical archives to determine accuracy with high confidence. Whether you're verifying a 
                breaking news story or conducting deep investigative research, Checkmate ensures your reporting 
                meets the highest standards of journalistic integrity.
              </p>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Key Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Zap className="size-5" />
                  </div>
                  <CardTitle>Real-Time Fact Verification</CardTitle>
                  <CardDescription>
                    Verify claims against trusted sources in under 2 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our AI-powered verification engine cross-references statements against verified databases, 
                    academic sources, and real-time web data to provide confidence scores and source citations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <AlertTriangle className="size-5" />
                  </div>
                  <CardTitle>Bias Detection</CardTitle>
                  <CardDescription>
                    Identify political leaning and emotional manipulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    High-dimensional vector models quantify political bias, emotional framing, and subjective 
                    language patterns to help maintain editorial neutrality.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Shield className="size-5" />
                  </div>
                  <CardTitle>Source Intelligence</CardTitle>
                  <CardDescription>
                    Map reputation and history of domains and authors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Understand the credibility and background of information sources, including domain reputation, 
                    author history, and organizational affiliations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Clock className="size-5" />
                  </div>
                  <CardTitle>Citation Lineage</CardTitle>
                  <CardDescription>
                    Trace the origin and evolution of claims
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Follow the citation trail to understand how information has been shared, modified, or 
                    repurposed across different sources and platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              How Newsrooms Use Checkmate
            </h2>
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Breaking News Verification</h3>
                    <p className="text-muted-foreground">
                      When a major story breaks, journalists use Checkmate to quickly verify key claims, 
                      check source credibility, and identify potential bias before publication. This enables 
                      faster, more accurate reporting without compromising on fact-checking rigor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Investigative Research</h3>
                    <p className="text-muted-foreground">
                      For deep-dive investigations, reporters leverage Checkmate's citation lineage tools to 
                      trace claims back to their original sources, identify patterns of misinformation, and 
                      build comprehensive source networks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Editorial Review</h3>
                    <p className="text-muted-foreground">
                      Editors use Checkmate during the review process to verify facts, check for bias, and 
                      ensure articles meet publication standards. Automated reports provide confidence scores 
                      and highlight areas that need additional verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Social Media Monitoring</h3>
                    <p className="text-muted-foreground">
                      Newsrooms monitor trending topics and viral claims on social platforms, using Checkmate 
                      to quickly separate fact from fiction and identify stories worth covering with proper 
                      verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Benefits for News Organizations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <TrendingUp className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Faster Publication</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce fact-checking time from hours to minutes, enabling faster response to breaking news 
                  while maintaining accuracy.
                </p>
              </div>
              <div className="space-y-2">
                <Shield className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Reduced Errors</h3>
                <p className="text-sm text-muted-foreground">
                  Catch factual errors and bias before publication, protecting your organization's reputation 
                  and maintaining reader trust.
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Editorial Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Make data-driven decisions about what to publish with confidence scores and comprehensive 
                  source documentation.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 pt-12 border-t border-border">
            <div className="text-center space-y-6">
              <h2 className={`text-2xl md:text-3xl font-medium ${instrumentSans.className}`}>
                Ready to Transform Your Newsroom?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how Checkmate can integrate into your editorial workflow and help your team publish 
                accurate, verified content faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Book a Demo
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/investigate">
                    Try Investigation Tool
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}




