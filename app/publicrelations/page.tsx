'use client';

import { Header } from '@/components/header';
import FooterSection from '@/components/footer';
import { ArrowRight, Users, TrendingUp, AlertCircle, BarChart3, Shield, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import localFont from 'next/font/local';
import { Instrument_Sans } from 'next/font/google';

const departureMono = localFont({ src: "../../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function PublicRelationsPage() {
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
                <Users className="size-6" />
              </div>
              <span className={`text-sm uppercase tracking-wider text-muted-foreground ${departureMono.className}`}>
                Use Case
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight ${instrumentSans.className}`}>
              Public Relations
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              Monitor brand sentiment and verify public statements in real-time. 
              Protect your reputation with comprehensive monitoring and verification tools that keep you ahead of the narrative.
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
                In the digital age, public relations teams must navigate an increasingly complex information 
                landscape where misinformation spreads faster than truth. Checkmate empowers PR professionals 
                to monitor brand mentions, verify public statements, track sentiment trends, and respond 
                quickly to emerging narratives—both positive and negative.
              </p>
              <p>
                Our platform provides real-time monitoring across news outlets, social media platforms, and 
                online forums, enabling PR teams to understand how their brand is being discussed, verify 
                the accuracy of claims made about their organization, and identify potential reputation risks 
                before they escalate.
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
                    <Eye className="size-5" />
                  </div>
                  <CardTitle>Real-Time Brand Monitoring</CardTitle>
                  <CardDescription>
                    Track mentions and sentiment across all channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor brand mentions, executive statements, and company news across news sites, social 
                    media, forums, and blogs. Get instant alerts when your brand is mentioned with sentiment 
                    analysis and credibility scoring.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Shield className="size-5" />
                  </div>
                  <CardTitle>Statement Verification</CardTitle>
                  <CardDescription>
                    Verify claims made about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    When claims are made about your company or executives, quickly verify their accuracy 
                    against your internal records and public sources. Generate verification reports for 
                    crisis management and legal purposes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <TrendingUp className="size-5" />
                  </div>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Track emotional tone and public perception trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Understand how public sentiment toward your brand evolves over time. Identify positive 
                    trends to amplify and negative patterns to address proactively.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <AlertCircle className="size-5" />
                  </div>
                  <CardTitle>Crisis Detection</CardTitle>
                  <CardDescription>
                    Identify potential reputation risks early
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detect emerging narratives, misinformation campaigns, and potential crisis situations 
                    before they gain traction. Get early warnings with source credibility analysis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              How PR Teams Use Checkmate
            </h2>
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <MessageSquare className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Press Release Verification</h3>
                    <p className="text-muted-foreground">
                      Before issuing press releases or public statements, PR teams use Checkmate to verify 
                      all factual claims, check for potential bias, and ensure statements align with 
                      previously published information. This prevents contradictions and maintains message consistency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <BarChart3 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Media Coverage Analysis</h3>
                    <p className="text-muted-foreground">
                      Track how your organization is covered across different media outlets. Analyze coverage 
                      for accuracy, identify biased reporting, and understand which publications are most 
                      influential in shaping public perception.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <AlertCircle className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Crisis Management</h3>
                    <p className="text-muted-foreground">
                      During a crisis, PR teams use Checkmate to monitor the spread of information, verify 
                      or debunk claims in real-time, track sentiment shifts, and identify the most credible 
                      sources to engage with for damage control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <TrendingUp className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Competitive Intelligence</h3>
                    <p className="text-muted-foreground">
                      Monitor competitor mentions and claims, verify their public statements, and understand 
                      how their messaging compares to yours. Identify opportunities to differentiate your 
                      brand based on verified information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <Shield className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Executive Reputation Management</h3>
                    <p className="text-muted-foreground">
                      Track mentions of executives and key personnel, verify claims about their background 
                      or statements, and monitor for potential reputation risks. Ensure accurate information 
                      is available when executives are profiled or quoted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Benefits for PR Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Eye className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">360° Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive monitoring across all channels gives you complete visibility into how your 
                  brand is being discussed and perceived.
                </p>
              </div>
              <div className="space-y-2">
                <Shield className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Proactive Risk Management</h3>
                <p className="text-sm text-muted-foreground">
                  Identify and address potential reputation risks before they escalate into full-blown crises, 
                  saving time and resources.
                </p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Data-Driven Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  Make informed decisions about messaging, media relations, and crisis response based on 
                  verified data and sentiment trends.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 pt-12 border-t border-border">
            <div className="text-center space-y-6">
              <h2 className={`text-2xl md:text-3xl font-medium ${instrumentSans.className}`}>
                Protect Your Brand Reputation
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how Checkmate can help your PR team monitor sentiment, verify claims, and manage 
                reputation in real-time.
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




