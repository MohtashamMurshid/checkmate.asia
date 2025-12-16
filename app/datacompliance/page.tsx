'use client';

import { Header } from '@/components/header';
import FooterSection from '@/components/footer';
import { ArrowRight, Shield, Lock, CheckCircle2, FileCheck, AlertTriangle, Database, Code, Server, BarChart3, Scale, Heart, Search, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import localFont from 'next/font/local';
import { Instrument_Sans } from 'next/font/google';

const departureMono = localFont({ src: "../../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function DataCompliancePage() {
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
                <Shield className="size-6" />
              </div>
              <span className={`text-sm uppercase tracking-wider text-muted-foreground ${departureMono.className}`}>
                Use Case
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight ${instrumentSans.className}`}>
              Data Compliance & Agentic Solutions
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
              Ensure AI agents operate within regulatory boundaries with verified data. 
              Build compliant, trustworthy AI systems that meet the highest standards of data governance and regulatory compliance.
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
                As AI agents become integral to business operations, organizations face increasing regulatory 
                pressure to ensure these systems operate within legal and ethical boundaries. GDPR, CCPA, 
                and emerging AI regulations require companies to verify data sources, maintain audit trails, 
                and prevent AI systems from generating or propagating false information.
              </p>
              <p>
                Checkmate provides comprehensive compliance infrastructure for AI agents, enabling organizations 
                to verify data sources, track information lineage, detect potential regulatory violations, and 
                maintain complete audit trails. Our platform ensures that AI agents only use verified, compliant 
                data sources and can provide documentation for regulatory audits.
              </p>
              <p>
                Whether you're building customer-facing chatbots, internal knowledge assistants, or automated 
                decision-making systems, Checkmate ensures your AI agents operate with verified data and 
                maintain compliance with evolving regulations.
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
                    <FileCheck className="size-5" />
                  </div>
                  <CardTitle>Data Source Verification</CardTitle>
                  <CardDescription>
                    Verify and validate all data sources before agent use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Before AI agents access or use data, Checkmate verifies source credibility, checks for 
                    regulatory compliance, and validates data accuracy. Only verified sources are approved 
                    for agent consumption.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Database className="size-5" />
                  </div>
                  <CardTitle>Information Lineage Tracking</CardTitle>
                  <CardDescription>
                    Complete audit trail of data flow and transformations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track how information flows through your AI systems, including source origins, 
                    transformations, and usage. Maintain complete lineage for regulatory audits and 
                    compliance reporting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <AlertTriangle className="size-5" />
                  </div>
                  <CardTitle>Compliance Violation Detection</CardTitle>
                  <CardDescription>
                    Identify potential regulatory violations in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monitor AI agent outputs for potential GDPR violations, data privacy issues, or 
                    regulatory non-compliance. Get alerts when agents access or generate potentially 
                    problematic content.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    <Lock className="size-5" />
                  </div>
                  <CardTitle>Agent Safety Controls</CardTitle>
                  <CardDescription>
                    Prevent hallucination and ensure ethical boundaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ensure AI agents operate within strict ethical boundaries, preventing hallucination, 
                    maintaining neutrality on sensitive topics, and avoiding generation of false or 
                    misleading information.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Dataset Analysis Section */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Dataset Analysis & Pre-Flight Checks
            </h2>
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground leading-relaxed mb-8">
                <p>
                  Before deploying AI agents into production, organizations must ensure their training data 
                  and datasets meet compliance standards. Checkmate's Dataset Analysis tool provides comprehensive 
                  pre-flight checks that identify bias, verify factual accuracy, and assess risk levels across 
                  entire datasets—enabling compliance teams to catch issues before they become regulatory problems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="mb-2 p-2 rounded-lg bg-chart-3/10 text-chart-3 w-fit">
                      <Scale className="size-5" />
                    </div>
                    <CardTitle>Bias Detection</CardTitle>
                    <CardDescription>
                      Identify gender, religious, and political bias with severity scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyze datasets for discriminatory patterns across gender, religion, and political 
                      dimensions. Get flagged items with severity scores and detailed breakdowns to ensure 
                      training data meets fairness requirements.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <div className="mb-2 p-2 rounded-lg bg-chart-4/10 text-chart-4 w-fit">
                      <Heart className="size-5" />
                    </div>
                    <CardTitle>Sentiment Analysis</CardTitle>
                    <CardDescription>
                      Classify emotional tone and assess content appropriateness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Understand the emotional distribution of your dataset. Identify potentially problematic 
                      content with negative sentiment or emotional manipulation that could violate compliance 
                      standards or ethical guidelines.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <div className="mb-2 p-2 rounded-lg bg-primary/10 text-primary w-fit">
                      <Search className="size-5" />
                    </div>
                    <CardTitle>Smart Fact Checking</CardTitle>
                    <CardDescription>
                      Verify factual claims with web search, skip opinions automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Automatically verify factual claims in your dataset against trusted sources. The system 
                      intelligently skips opinions and subjective content, focusing verification efforts on 
                      verifiable claims that could impact compliance.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="size-5" />
                    </div>
                    <CardTitle>Risk Assessment & Compliance Scoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Every analyzed row receives a comprehensive risk score (0-100) that assesses compliance 
                    risk across multiple dimensions:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="size-4 text-destructive" />
                        <span className="text-sm font-semibold">Risk Levels</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                        <li>• Critical: Immediate compliance risk</li>
                        <li>• High: Requires review before use</li>
                        <li>• Medium: Monitor closely</li>
                        <li>• Low: Compliant and safe</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="size-4 text-primary" />
                        <span className="text-sm font-semibold">Smart Routing</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Intelligent routing determines which AI agents need to analyze each row, optimizing 
                        cost and ensuring comprehensive coverage. Safe content is automatically skipped, 
                        reducing unnecessary processing while maintaining compliance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="size-5 text-primary" />
                  Comprehensive Analysis Dashboard
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-2">Analysis Features:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Risk heatmaps for visual compliance assessment</li>
                      <li>Bias breakdown by category (gender, religion, political)</li>
                      <li>Sentiment distribution analysis</li>
                      <li>Fact-check verification status</li>
                      <li>Per-row detailed verdicts with confidence scores</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Compliance Benefits:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Export results as JSON/CSV for audit documentation</li>
                      <li>Complete audit trail of all analyses</li>
                      <li>Cache performance metrics for cost tracking</li>
                      <li>Router decision logs showing compliance checks</li>
                      <li>Historical analysis tracking for trend monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="size-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Try Dataset Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload CSV or JSONL files to analyze your datasets for bias, sentiment, and factual accuracy. 
                    Get comprehensive risk assessments and compliance reports in minutes.
                  </p>
                </div>
                <Button asChild variant="default">
                  <Link href="/investigate/dashboard/analyze">
                    Analyze Dataset
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              How Organizations Use Checkmate for Compliance
            </h2>
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <BarChart3 className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Pre-Flight Dataset Analysis</h3>
                    <p className="text-muted-foreground">
                      Before training AI agents, compliance teams use Checkmate's Dataset Analysis tool to 
                      scan entire datasets for bias, verify factual claims, and assess risk levels. This 
                      pre-flight check ensures training data meets regulatory requirements and identifies 
                      problematic content before it enters the training pipeline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <Code className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">AI Agent Development</h3>
                    <p className="text-muted-foreground">
                      During development, engineering teams use Checkmate to verify training data sources, 
                      validate information accuracy, and ensure agents only learn from compliant, verified 
                      datasets. This prevents compliance issues before agents go into production.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <Server className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Production Monitoring</h3>
                    <p className="text-muted-foreground">
                      In production, Checkmate continuously monitors AI agent behavior, verifying data 
                      sources accessed in real-time, tracking information lineage, and detecting potential 
                      compliance violations. Automated alerts notify compliance teams of issues.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <FileCheck className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Regulatory Audits</h3>
                    <p className="text-muted-foreground">
                      When regulators request documentation, organizations use Checkmate's audit trail 
                      features to generate comprehensive reports showing data sources, verification status, 
                      and compliance measures. Complete lineage documentation satisfies audit requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <Shield className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Data Governance</h3>
                    <p className="text-muted-foreground">
                      Data governance teams use Checkmate to establish policies for which data sources are 
                      approved for AI agent use, maintain source whitelists and blacklists, and ensure 
                      consistent compliance across all AI systems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-4">
                  <Lock className="size-5 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Privacy Compliance</h3>
                    <p className="text-muted-foreground">
                      Ensure AI agents comply with GDPR, CCPA, and other privacy regulations by verifying 
                      that personal data is sourced appropriately, tracking consent, and preventing agents 
                      from accessing or generating unauthorized personal information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Regulatory Frameworks */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Regulatory Frameworks Supported
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-semibold mb-2">GDPR (EU)</h3>
                <p className="text-sm text-muted-foreground">
                  Verify data sources, track consent, and maintain audit trails for EU General Data 
                  Protection Regulation compliance.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-semibold mb-2">CCPA (California)</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure California Consumer Privacy Act compliance with verified data sources and 
                  consumer data tracking.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-semibold mb-2">EU AI Act</h3>
                <p className="text-sm text-muted-foreground">
                  Prepare for EU AI Act requirements with comprehensive risk assessment, data verification, 
                  and compliance documentation.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-semibold mb-2">Industry-Specific</h3>
                <p className="text-sm text-muted-foreground">
                  Support for HIPAA, SOX, PCI-DSS, and other industry-specific regulations with tailored 
                  compliance checks and audit capabilities.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className={`text-2xl md:text-3xl font-medium mb-8 ${instrumentSans.className}`}>
              Benefits for Compliance Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Shield className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Reduced Risk</h3>
                <p className="text-sm text-muted-foreground">
                  Proactively identify and prevent compliance violations before they result in regulatory 
                  penalties or reputational damage.
                </p>
              </div>
              <div className="space-y-2">
                <FileCheck className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Audit Readiness</h3>
                <p className="text-sm text-muted-foreground">
                  Maintain complete documentation and audit trails that satisfy regulatory requirements 
                  and streamline audit processes.
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="size-6 text-primary mb-2" />
                <h3 className="font-semibold">Automated Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Automate compliance checks and verification processes, reducing manual effort and 
                  ensuring consistent enforcement across all AI systems.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 pt-12 border-t border-border">
            <div className="text-center space-y-6">
              <h2 className={`text-2xl md:text-3xl font-medium ${instrumentSans.className}`}>
                Build Compliant AI Systems
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how Checkmate can help ensure your AI agents operate within regulatory boundaries 
                and maintain compliance with evolving data governance requirements.
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

