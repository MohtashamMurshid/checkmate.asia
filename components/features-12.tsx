'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FileText, Network, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: '/due-diligence.png',
            alt: 'Due diligence - PDF validation',
        },
        'item-2': {
            image: '/trace-source.png',
            alt: 'Trace information source - node visualization',
        },
        'item-3': {
            image: '/political-bias.png',
            alt: 'Political bias detection - node visualization',
        },
        'item-4': {
            image: '/data-compliance.png',
            alt: 'Data compliance - text correction',
        },
    }

    return (
        <section className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">AI-Powered Solutions</h2>
                    <p>Accurate and unbiased data in seconds</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex flex-col items-start gap-1 text-left">
                                    <div className="flex items-center gap-2 text-base font-medium">
                                        <FileText className="size-4" />
                                        Investment/Consulting
                                    </div>
                                    <span className="text-sm text-muted-foreground">Due diligence</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm">
                                    <span className="font-medium">Checkmate helps businesses validate claims and assumptions found in pitch decks, reports, or market research.</span> It reviews external documents, identifies exaggeration or weak evidence, and provides clearer context to decision-makers.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex flex-col items-start gap-1 text-left">
                                    <div className="flex items-center gap-2 text-base font-medium">
                                        <Network className="size-4" />
                                        Info platforms (news, socmed)
                                    </div>
                                    <span className="text-sm text-muted-foreground">Trace Information source</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm">
                                    Checkmate traces and visually maps out how information connects and where the true verified information actually came from.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex flex-col items-start gap-1 text-left">
                                    <div className="flex items-center gap-2 text-base font-medium">
                                        <AlertTriangle className="size-4" />
                                        Info platforms (news, socmed)
                                    </div>
                                    <span className="text-sm text-muted-foreground">Political bias</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm">
                                    <span className="font-medium">Checkmate maps political narratives by tracing possible hidden agendas, beneficiary groups, and incentive structures</span> to provide clearer context on why the narrative may be promoted.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex flex-col items-start gap-1 text-left">
                                    <div className="flex items-center gap-2 text-base font-medium">
                                        <CheckCircle2 className="size-4" />
                                        Data compliance (enterprise data preprocessing)
                                    </div>
                                    <span className="text-sm text-muted-foreground">Data Compliance</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm">
                                    Checkmate integrates with your enterprise data to filter and correct inaccurate data, ensuring it reflects the real world.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="size-full object-cover object-left-top dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
