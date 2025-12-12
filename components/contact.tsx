'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Logo } from './logo'
import FooterSection from './footer'

export default function ContactSection() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        useCase: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const submitContactForm = useMutation(api.contacts.submitContactForm)

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
            setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps - 1))
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Only submit if we're on the last step
        if (currentStep !== totalSteps - 1) {
            handleNext()
            return
        }
        
        setIsSubmitting(true)
        setSubmitStatus('idle')
        setErrorMessage('')

        try {
            // Persist to Convex DB and trigger emails via internal action
            await submitContactForm({
                name: formData.name,
                email: formData.email,
                useCase: formData.useCase,
                message: formData.message,
            })

            setSubmitStatus('success')
            // Reset form
            setFormData({
                name: '',
                email: '',
                useCase: '',
                message: '',
            })
            setCurrentStep(0)
        } catch (error) {
            setSubmitStatus('error')
            setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            // Prevent Enter from submitting the entire form before the last step.
            if (currentStep < totalSteps - 1) {
                e.preventDefault()
                if (canProceed()) {
                    handleNext()
                }
            }
        }
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
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16">
                <div className="w-full max-w-5xl">
                    <div className="mb-8 flex justify-center">
                        <Logo clickable={true} href="/" />
                    </div>
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-semibold lg:text-4xl">Get in Touch</h1>
                        <p className="mt-4 text-muted-foreground">We'd love to hear from you and learn how we can help.</p>
                    </div>

                    <Card className="mx-auto max-w-3xl p-8 shadow-md sm:p-16">
                    <div>
                        <h2 className="text-lg font-semibold">Let's get you to the right place</h2>
                        <p className="mt-4 text-sm">Tell us a bit about yourself and how you'd like to use our application.</p>
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

                    {submitStatus === 'success' && (
                        <div className="mt-8 p-4 bg-chart-2/10 dark:bg-chart-2/20 border border-chart-2/30 dark:border-chart-2/40 rounded-lg">
                            <p className="text-chart-2 dark:text-chart-2/90 text-sm">
                                Thank you! Your message has been sent successfully. We'll get back to you soon.
                            </p>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mt-8 p-4 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg">
                            <p className="text-destructive dark:text-destructive/90 text-sm">
                                {errorMessage || 'Failed to submit form. Please try again.'}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="mt-8">
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
                                <Button
                                    key="next"
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    key="submit"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            )}
                        </div>
                    </form>
                    </Card>
                </div>
            </div>
            <FooterSection />
        </div>
    )
}
