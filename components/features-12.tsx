'use client'
import { FileText, Network, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'
import { Instrument_Sans } from "next/font/google";
import { DueDiligenceVisual, SourceTracingVisual, DataComplianceVisual } from '@/components/feature-visualizations'

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const visuals = {
        'item-1': DueDiligenceVisual,
        'item-2': SourceTracingVisual,
        'item-4': DataComplianceVisual,
    }

    const features: Array<{
        key: ImageKey
        icon: React.ReactNode
        title: string
        description: string
    }> = [
        {
            key: 'item-1',
            icon: <FileText className="size-4 text-foreground" />,
            title: 'Due diligence',
            description:
                'Checkmate helps businesses validate claims and assumptions found in pitch decks, reports, or market research. It reviews external documents, identifies exaggeration or weak evidence, and provides clearer context to decision-makers.',
        },
        {
            key: 'item-2',
            icon: <Network className="size-4 text-foreground" />,
            title: 'Source tracing & political bias',
            description:
                'Checkmate maps how information spreads—tracing original sources, incentives, and potential agendas—to reveal bias and provide clearer context.',
        },
        {
            key: 'item-4',
            icon: <CheckCircle2 className="size-4 text-foreground" />,
            title: 'Data Compliance',
            description:
                'Checkmate integrates with your enterprise data to filter and correct inaccurate data, ensuring it reflects the real world.',
        },
    ]

    return (
        <section id="features" className="py-16 md:py-24 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1] text-balance">AI-Powered Solutions</h2>
                    <p className={`text-muted-foreground ${instrumentSans.className}`}>Accurate and unbiased data in seconds</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <div
                        className="w-full"
                        onMouseLeave={() => setActiveItem('item-1')}
                    >
                        <div className="relative z-10 w-full">
                            <div className="absolute -inset-x-6 -inset-y-3 sm:static"></div>
                            <div className="w-full">
                                {features.map((f, idx) => {
                                    const isActive = activeItem === f.key
                                    return (
                                        <div
                                            key={f.key}
                                            className="group border-b border-border/60 last:border-transparent hover:border-foreground/30 dark:hover:border-foreground/50 transition-all duration-300 cursor-pointer"
                                            onMouseEnter={() => setActiveItem(f.key)}
                                        >
                                            <p
                                                className={`w-full pt-6 pb-2 text-2xl leading-10 text-left ${
                                                    isActive
                                                        ? "text-foreground"
                                                        : "text-foreground/70"
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-2 align-middle font-bold">
                                                    {f.icon}
                                                    {f.title}
                                                </span>
                                            </p>
                                            <p className={`pb-6 overflow-hidden transition-colors ${instrumentSans.className} ${
                                                isActive
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground group-hover:text-foreground/80'
                                            }`}>
                                                {f.description}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-background/60 backdrop-blur-sm relative flex overflow-hidden rounded-xl border border-border/70 p-2 shadow-xl">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l border-border/60 bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-full rounded-xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
                                    <div className="size-full p-8 flex items-center justify-center">
                                        {(() => {
                                            const VisualComponent = visuals[activeItem]
                                            return <VisualComponent />
                                        })()}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    
                    </div>
                </div>
            </div>
        </section>
    )
}
