"use client"
import { useGetFeedbackFormsQuery, useCreateFeedbackFormMutation } from '@/redux/api/college'
import React, { useEffect, useState } from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import QuestionForm, { FeedbackQuestion } from '@/components/Feedback/QuestionForm'

const CreateFeedbackPage = () => {
    const router = useRouter()
    const { data: feedbacksData, isLoading } = useGetFeedbackFormsQuery()
    const [createFeedback, { isLoading: isCreating }] = useCreateFeedbackFormMutation()

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_active: false
    })
    const [questions, setQuestions] = useState<FeedbackQuestion[]>([])

    // Check if there's any active feedback form
    const hasActiveFeedback = feedbacksData?.data?.some(feedback => feedback.is_active) || false

    useEffect(() => {
        if (!isLoading && hasActiveFeedback) {
            toast({
                title: "Cannot Create Form",
                description: "An active feedback form already exists. Please deactivate it before creating a new one.",
                variant: "destructive"
            })
            router.push('/feedbacks')
        }
    }, [hasActiveFeedback, isLoading, router])

    const handleCreateForm = async () => {
        if (!formData.title.trim()) {
            toast({
                title: "Error",
                description: "Form title is required",
                variant: "destructive"
            })
            return
        }

        if (questions.length === 0) {
            toast({
                title: "Error",
                description: "At least one question is required",
                variant: "destructive"
            })
            return
        }

        // Validate all questions
        for (const question of questions) {
            if (!question.question_text.trim()) {
                toast({
                    title: "Error",
                    description: "All questions must have text",
                    variant: "destructive"
                })
                return
            }
        }

        try {
            const newForm = {
                title: formData.title,
                description: formData.description,
                is_active: formData.is_active,
                questions: questions.map(q => ({
                    question_text: q.question_text,
                    category: q.category,
                    max_rating: q.max_rating,
                    order: q.order
                }))
            }

            const result = await createFeedback(newForm).unwrap()
            toast({
                title: "Success",
                description: "Feedback form created successfully",
                variant: "default"
            })
            router.push(`/feedbacks/${result.data._id}`)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create feedback form",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Typography variant="p">Loading...</Typography>
            </div>
        )
    }

    if (hasActiveFeedback) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/feedbacks')}
                    >
                        <ArrowLeft size={16} />
                        Back to Feedbacks
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive">Access Denied</Badge>
                        </div>
                        <Typography variant="h2">Cannot Create New Form</Typography>
                    </CardHeader>
                    <CardContent>
                        <Typography variant="p" className="text-muted-foreground">
                            An active feedback form already exists in the system. You must deactivate the current active form before creating a new one.
                        </Typography>
                        <div className="mt-4">
                            <Button onClick={() => router.push('/feedbacks')}>
                                Go Back to Manage Forms
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/feedbacks')}
                >
                    <ArrowLeft size={16} />
                    Back to Feedbacks
                </Button>
                <Typography variant="h1">Create New Feedback Form</Typography>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Typography variant="h2">Form Information</Typography>
                        <Typography variant="p" className="text-muted-foreground">
                            Set up your feedback form details and questions.
                        </Typography>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Form Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter form title..."
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter form description..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="rounded"
                            />
                            <Label htmlFor="is_active">Activate form immediately</Label>
                        </div>
                    </CardContent>
                </Card>

                <QuestionForm
                    questions={questions}
                    onChange={setQuestions}
                    isReadOnly={false}
                />

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <Button
                                onClick={handleCreateForm}
                                disabled={isCreating}
                                size="lg"
                            >
                                {isCreating ? 'Creating...' : 'Create Feedback Form'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/feedbacks')}
                                size="lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CreateFeedbackPage
