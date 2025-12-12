import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, Code, Server, Globe } from 'lucide-react'
import { ReactNode } from 'react'
import localFont from "next/font/local";
import { Instrument_Sans } from "next/font/google";
import { EnterpriseApiVisual, AgentDeploymentVisual } from '@/components/feature-visualizations'

const departureMono = localFont({ src: "../fonts/DepartureMono-Regular.woff2" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function Features10() {
    return (
        <section id="solutions" className="bg-muted/30 py-16 md:py-24 lg:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-2xl px-4 md:px-6 lg:max-w-6xl">
                <div className="mb-12 space-y-4 text-center md:mb-16">
                    <h1 className={`text-3xl md:text-5xl font-semibold tracking-tight ${departureMono.className}`}>
                        Solutions
                    </h1>
                    <p className={`text-lg text-muted-foreground ${instrumentSans.className}`}>
                        Comprehensive AI-powered tools to detect, verify, and combat misinformation across all digital platforms
                    </p>
                </div>
                <div className="mx-auto grid gap-6 lg:grid-cols-3">
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Globe}
                                title="SAAS Enterprise"
                                description="Fully managed cloud solution with enterprise-grade security, scalability, and support"
                            />
                        </CardHeader>

                        <CardContent className="pt-0 pb-6">
                            <div className="flex flex-wrap justify-center gap-6 overflow-hidden">
                            <CircularUI
                                label="Prescriptive"
                                circles={[{ pattern: 'primary' }, { pattern: 'none' }]}
                            />

                            <CircularUI
                                label="Descriptive"
                                circles={[{ pattern: 'border' }, { pattern: 'primary' }]}
                            />

                            <CircularUI
                                label="Diagnostic"
                                circles={[{ pattern: 'blue' }, { pattern: 'none' }]}
                            />

                            <CircularUI
                                label="Predictive"
                                circles={[{ pattern: 'primary' }, { pattern: 'border' }]}
                                className="hidden sm:flex"
                            />
                        </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Code}
                                title="Enterprise API"
                                description="Integrate Checkmate seamlessly with your existing infrastructure through our powerful REST API"
                            />
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="relative border-t border-border/60 border-dashed">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--primary)/0.1),transparent_100%)]"
                                />
                                <div className="aspect-[76/59] p-1 px-6">
                                    <EnterpriseApiVisual />
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Server}
                                title="On prem Agent Deployment"
                                description="Deploy Checkmate agents directly on your infrastructure for complete data control and security"
                            />
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="relative overflow-hidden rounded-xl border border-border/60">
                                <div className="aspect-[76/59] overflow-hidden">
                                    <AgentDeploymentVisual />
                                </div>
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
    <Card className={cn('group relative rounded-xl border-border/60 bg-background/60 backdrop-blur-sm shadow-xl transition-all hover:shadow-2xl hover:bg-background/80', className)}>
        <CardDecorator />
        {children}
    </Card>
)

const CardDecorator = () => (
    <>
        <span className="border-border/60 absolute -left-px -top-px block size-2 border-l-2 border-t-2"></span>
        <span className="border-border/60 absolute -right-px -top-px block size-2 border-r-2 border-t-2"></span>
        <span className="border-border/60 absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"></span>
        <span className="border-border/60 absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"></span>
    </>
)

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-6">
        <span className={`text-muted-foreground flex items-center gap-2 text-sm font-medium ${instrumentSans.className}`}>
            <Icon className="size-4" />
            {title}
        </span>
        <p className={`mt-4 text-xl md:text-2xl font-semibold tracking-tight leading-tight ${instrumentSans.className}`}>{description}</p>
    </div>
)

interface CircleConfig {
    pattern: 'none' | 'border' | 'primary' | 'blue'
}

interface CircularUIProps {
    label: string
    circles: CircleConfig[]
    className?: string
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
    <div className={cn('flex flex-col items-center', className)}>
        <div className="bg-gradient-to-b from-border to-transparent size-fit rounded-2xl p-px">
            <div className="bg-gradient-to-b from-background to-muted/25 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={cn('size-7 rounded-full border sm:size-8', {
                            'border-primary bg-transparent': circle.pattern === 'none',
                            'border-primary bg-[repeating-linear-gradient(-45deg,hsl(var(--border)),hsl(var(--border))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
                            'border-primary bg-background bg-[repeating-linear-gradient(-45deg,hsl(var(--primary)),hsl(var(--primary))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
                            'bg-background z-10 border-primary bg-[repeating-linear-gradient(-45deg,hsl(var(--primary)),hsl(var(--primary))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
                        })}></div>
                ))}
            </div>
        </div>
        <span className={`text-muted-foreground mt-1.5 block text-center text-sm ${instrumentSans.className}`}>{label}</span>
    </div>
)
