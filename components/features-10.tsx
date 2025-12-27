import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, Code, Server, Globe, Shield} from 'lucide-react'
import { ReactNode } from 'react'
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function Features10() {
    return (
        <section id="deployment" className="bg-muted/30 py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-2xl px-4 md:px-6 lg:max-w-6xl">
                <div className="mb-12 space-y-4 text-center md:mb-16">
                    <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
                       Deployment
                    </h1>
                    <p className={`text-lg text-muted-foreground ${instrumentSans.className}`}>
                        Comprehensive AI-powered tools to detect, verify, and combat misinformation across all digital platforms
                    </p>
                </div>
                <div className="mx-auto grid gap-6 lg:grid-cols-3">
                    <FeatureCard>
                        <CardHeader className="pb-3 relative z-10">
                            <CardHeading
                                icon={Globe}
                                title="SAAS Enterprise"
                                description="Fully managed cloud solution with enterprise-grade security, scalability, and support"
                            />
                        </CardHeader>

                        <CardContent className="pt-0 pb-6 relative z-10 px-0">
                            <div className="relative mx-6 h-[200px] overflow-hidden rounded-lg border-2 border-foreground/20 bg-muted/50 shadow-md ring-1 ring-foreground/10">
                                <SaaSDashboardVisual />
                            </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3 relative z-10">
                            <CardHeading
                                icon={Code}
                                title="Enterprise API"
                                description="Integrate Checkmate seamlessly with your existing infrastructure through our powerful REST API"
                            />
                        </CardHeader>

                        <CardContent className="pt-0 pb-6 relative z-10 px-0">
                            <div className="relative mx-6 h-[200px] overflow-hidden rounded-lg border-2 border-foreground/20 bg-muted/50 shadow-md ring-1 ring-foreground/10">
                                <ApiInterfaceVisual />
                            </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3 relative z-10">
                            <CardHeading
                                icon={Server}
                                title="On prem Agents"
                                description="Deploy Checkmate agents directly on your infrastructure for complete data control and security"
                            />
                        </CardHeader>

                        <CardContent className="pt-0 pb-6 relative z-10 px-0">
                            <div className="relative mx-6 h-[200px] overflow-hidden rounded-lg border-2 border-foreground/20 bg-muted/50 shadow-md ring-1 ring-foreground/10">
                                <SecurityMapVisual />
                            </div>
                        </CardContent>
                    </FeatureCard>

                </div>
            </div>
        </section>
    )
}

interface FeatureCardProps {
    children: ReactNode
    className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
    <Card className={cn('group relative overflow-hidden rounded-xl border-border/60 bg-gradient-to-b from-background to-muted/20 shadow-sm transition-all hover:shadow-md hover:border-border/80', className)}>
        <CardDecorator />
        {children}
    </Card>
)

const CardDecorator = () => (
    <>
        <span className="border-primary/20 absolute -left-px -top-px block size-2 border-l-2 border-t-2 opacity-50 group-hover:opacity-100 transition-opacity"></span>
        <span className="border-primary/20 absolute -right-px -top-px block size-2 border-r-2 border-t-2 opacity-50 group-hover:opacity-100 transition-opacity"></span>
        <span className="border-primary/20 absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 opacity-50 group-hover:opacity-100 transition-opacity"></span>
        <span className="border-primary/20 absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 opacity-50 group-hover:opacity-100 transition-opacity"></span>
    </>
)

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-6">
        <div className={`flex flex-col gap-2 mb-2 ${instrumentSans.className}`}>
            <Icon className="size-6 text-primary mb-2" />
            <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                {title}
            </h3>
        </div>
        <p className={`text-sm text-muted-foreground leading-relaxed ${instrumentSans.className}`}>
            {description}
        </p>
    </div>
)

// Visual Components

const SaaSDashboardVisual = () => (
    <div className="flex h-full w-full flex-col bg-background text-[8px] text-muted-foreground select-none p-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
            <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary/50" />
                <span className="font-medium text-foreground">Dashboard</span>
            </div>
            <div className="flex gap-1">
                <div className="size-3 rounded bg-muted" />
                <div className="size-3 rounded bg-muted" />
            </div>
        </div>
        {/* Content */}
        <div className="flex gap-2 h-full">
            {/* Sidebar */}
            <div className="w-8 flex flex-col gap-1.5 border-r border-border pr-2">
                <div className="h-1.5 w-full rounded bg-muted" />
                <div className="h-1.5 w-3/4 rounded bg-muted" />
                <div className="h-1.5 w-full rounded bg-muted" />
                <div className="mt-auto h-3 w-3 rounded-full bg-muted mx-auto" />
            </div>
            {/* Main Area */}
            <div className="flex-1 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded border border-border bg-muted/30 p-1.5">
                        <div className="mb-1 h-1 w-8 rounded bg-muted-foreground/20" />
                        <div className="h-3 w-full rounded bg-primary/10" />
                    </div>
                    <div className="rounded border border-border bg-muted/30 p-1.5">
                        <div className="mb-1 h-1 w-8 rounded bg-muted-foreground/20" />
                        <div className="h-3 w-full rounded bg-primary/10" />
                    </div>
                </div>
                <div className="flex-1 rounded border border-border bg-muted/30 p-2">
                    <div className="flex items-end gap-1 h-full pb-1">
                        <div className="w-full bg-primary/20 rounded-t h-[40%]" />
                        <div className="w-full bg-primary/40 rounded-t h-[70%]" />
                        <div className="w-full bg-primary/60 rounded-t h-[50%]" />
                        <div className="w-full bg-primary/80 rounded-t h-[85%]" />
                        <div className="w-full bg-primary rounded-t h-[60%]" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const ApiInterfaceVisual = () => (
    <div className="flex h-full w-full flex-col bg-background text-[10px] font-mono p-3 select-none">
        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-border pb-2 mb-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">POST</span>
            <span className="text-muted-foreground">/v1/analyze</span>
        </div>
        {/* Code Content */}
        <div className="flex-1 space-y-1 text-muted-foreground">
            <div className="flex gap-2">
                <span className="text-muted-foreground/50">1</span>
                <span><span className="text-purple-500">const</span> response <span className="text-blue-500">=</span> <span className="text-purple-500">await</span> api.verify({'{'}</span>
            </div>
            <div className="flex gap-2">
                <span className="text-muted-foreground/50">2</span>
                <span className="pl-4">url: <span className="text-green-500">"https://news.com/..."</span>,</span>
            </div>
            <div className="flex gap-2">
                <span className="text-muted-foreground/50">3</span>
                <span className="pl-4">mode: <span className="text-green-500">"deep_scan"</span></span>
            </div>
            <div className="flex gap-2">
                <span className="text-muted-foreground/50">4</span>
                <span>{'}'});</span>
            </div>
            <div className="flex gap-2 mt-2 border-t border-border pt-2">
                <span className="text-muted-foreground/50">5</span>
                <span className="text-muted-foreground/60">// Response</span>
            </div>
            <div className="flex gap-2">
                <span className="text-muted-foreground/50">6</span>
                <span>{'{'} <span className="text-blue-500">"score"</span>: <span className="text-orange-500">0.98</span>, <span className="text-blue-500">"verified"</span>: <span className="text-purple-500">true</span> {'}'}</span>
            </div>
        </div>
    </div>
)

const SecurityMapVisual = () => (
    <div className="relative h-full w-full bg-background p-3 select-none overflow-hidden">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-20" 
             style={{ 
                 backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }} 
        />
        
        {/* Central Secure Node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative flex items-center justify-center size-12 rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                <Shield className="size-5 text-primary" />
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium text-primary bg-background/80 px-1.5 py-0.5 rounded border border-primary/20 backdrop-blur-sm">
                SECURE AGENT
            </div>
        </div>

        {/* Satellite Nodes */}
        {[
            { x: '20%', y: '30%', delay: '0s' },
            { x: '80%', y: '25%', delay: '1s' },
            { x: '15%', y: '70%', delay: '2s' },
            { x: '85%', y: '65%', delay: '0.5s' }
        ].map((pos, i) => (
            <div 
                key={i}
                className="absolute size-2 rounded-full bg-muted-foreground/40 border border-muted-foreground/20"
                style={{ left: pos.x, top: pos.y }}
            >
                <div 
                    className="absolute inset-0 rounded-full bg-muted-foreground/30 animate-pulse opacity-50"
                    style={{ animationDelay: pos.delay }} 
                />
            </div>
        ))}

        {/* Connection Lines (SVG Overlay) */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none text-muted-foreground/20">
            <path d="M 150 100 L 70 60" className="stroke-current" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 150 100 L 230 50" className="stroke-current" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 150 100 L 60 140" className="stroke-current" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 150 100 L 240 130" className="stroke-current" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
    </div>
)
