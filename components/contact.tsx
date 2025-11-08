'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export default function ContactSection() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        useCase: '',
        message: '',
    })

    const useCases = [
        { 
            value: 'investment-consulting', 
            title: 'Investment/Consulting',
            subtitle: 'Due diligence'
        },
        { 
            value: 'info-platforms', 
            title: 'Info platforms (news, socmed)',
            subtitle: 'Source tracing & political bias'
        },
        { 
            value: 'data-compliance', 
            title: 'Data compliance (enterprise data preprocessing)',
            subtitle: 'Data Compliance'
        },
    ]

    const totalSteps = 4

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission here
        console.log('Form submitted:', formData)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return formData.name.trim() !== ''
            case 1:
                return formData.email.trim() !== '' && formData.email.includes('@')
            case 2:
                return formData.useCase !== ''
            case 3:
                return true
            default:
                return false
        }
    }

    return (
        <section >
            <div className="mx-auto max-w-5xl px-8 lg:px-0">
                <h1 className="text-center text-3xl font-semibold lg:text-4xl">Contact Sales</h1>
                <p className="mt-4 text-center">We'll help you find the right plan and pricing for your business.</p>

                <Card className="mx-auto mt-12 max-w-3xl p-8 shadow-md sm:p-16">
                    <div>
                        <h2 className="text-lg font-semibold">Let's get you to the right place</h2>
                        <p className="mt-4 text-sm">Reach out to our sales team! We're eager to learn more about how you plan to use our application.</p>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-8 mb-8">
                        <div className="flex items-center justify-between">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div key={index} className="flex items-center flex-1">
                                    <div
                                        className={`h-2 flex-1 rounded-full ${
                                            index <= currentStep ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    />
                                    {index < totalSteps - 1 && (
                                        <div
                                            className={`h-2 w-2 rounded-full mx-1 ${
                                                index < currentStep ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            Step {currentStep + 1} of {totalSteps}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8">
                        {/* Step 1: Name/Company name */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name/Company name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="mt-2"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Email */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="mt-2"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Use case */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="use-case">What kind</Label>
                                    <div className="mt-4 grid gap-3">
                                        {useCases.map((useCase) => (
                                            <Card
                                                key={useCase.value}
                                                className={`cursor-pointer transition-all hover:border-primary ${
                                                    formData.useCase === useCase.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border'
                                                }`}
                                                onClick={() => setFormData({ ...formData, useCase: useCase.value })}
                                            >
                                                <div className="p-4">
                                                    <h3 className="text-base font-semibold">{useCase.title}</h3>
                                                    <p className="mt-1 text-xs text-muted-foreground">{useCase.subtitle}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Message */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="msg">Message</Label>
                                    <Textarea
                                        id="msg"
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="mt-2"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="mt-8 flex justify-between gap-4">
                            {currentStep > 0 ? (
                                <Button type="button" variant="outline" onClick={handlePrevious}>
                                    Previous
                                </Button>
                            ) : (
                                <div />
                            )}
                            {currentStep < totalSteps - 1 ? (
                                <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit">Submit</Button>
                            )}
                        </div>
                    </form>
                </Card>
            </div>
        </section>
    )
}
