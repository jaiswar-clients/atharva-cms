"use client"
import { useGetFeedbackFormByIdQuery, useUpdateFeedbackFormMutation, useDeleteFeedbackFormMutation } from '@/redux/api/college'
import React, { useState } from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import QuestionForm, { FeedbackQuestion } from '@/components/Feedback/QuestionForm'

const FeedbackDetailPage = () => {
    const router = useRouter()
    const params = useParams()
    const feedbackId = params.id as string

    const { data: feedbackData, isLoading } = useGetFeedbackFormByIdQuery(feedbackId)
    const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackFormMutation()
    const [deleteFeedback] = useDeleteFeedbackFormMutation()

    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_active: false
    })
    const [questions, setQuestions] = useState<FeedbackQuestion[]>([])

    React.useEffect(() => {
        if (feedbackData?.data) {
            setFormData({
                title: feedbackData.data.title,
                description: feedbackData.data.description || '',
                is_active: feedbackData.data.is_active
            })
            setQuestions(feedbackData.data.questions || [])
        }
    }, [feedbackData])

    const handleSave = async () => {
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
            await updateFeedback({
                id: feedbackId,
                data: {
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
            }).unwrap()

            toast({
                title: "Success",
                description: "Feedback form updated successfully",
                variant: "default"
            })
            setIsEditing(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update feedback form",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteFeedback(feedbackId).unwrap()
            toast({
                title: "Success",
                description: "Feedback form deleted successfully",
                variant: "default"
            })
            router.push('/feedbacks')
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete feedback form",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    const toggleActiveStatus = async () => {
        try {
            await updateFeedback({
                id: feedbackId,
                data: { is_active: !formData.is_active }
            }).unwrap()

            setFormData(prev => ({ ...prev, is_active: !prev.is_active }))

            toast({
                title: "Success",
                description: `Feedback form ${!formData.is_active ? 'activated' : 'deactivated'} successfully`,
                variant: "default"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update form status",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Typography variant="p">Loading feedback form...</Typography>
            </div>
        )
    }

    if (!feedbackData?.data) {
        return (
            <div className="text-center py-12">
                <Typography variant="h3" className="mb-4">Feedback Form Not Found</Typography>
                <Button onClick={() => router.push('/feedbacks')}>
                    Back to Feedbacks
                </Button>
            </div>
        )
    }

    const feedback = feedbackData.data

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/feedbacks')}
                    >
                        <ArrowLeft size={16} />
                        Back to Feedbacks
                    </Button>
                    <div>
                        <Typography variant="h1">
                            {isEditing ? 'Edit Feedback Form' : 'Feedback Form Details'}
                        </Typography>
                        <Typography variant="p" className="text-muted-foreground">
                            {feedback.title}
                        </Typography>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant={feedback.is_active ? "default" : "secondary"}>
                        {feedback.is_active ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Typography variant="h2">Form Information</Typography>
                                <div className="flex gap-2">
                                    {!isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit Form
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleActiveStatus}
                                                disabled={isUpdating}
                                            >
                                                {formData.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                <span className="ml-1">
                                                    {formData.is_active ? 'Deactivate' : 'Activate'}
                                                </span>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    // Reset form data
                                                    if (feedbackData?.data) {
                                                        setFormData({
                                                            title: feedbackData.data.title,
                                                            description: feedbackData.data.description || '',
                                                            is_active: feedbackData.data.is_active
                                                        })
                                                        setQuestions(feedbackData.data.questions || [])
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={isUpdating}
                                            >
                                                <Save size={16} />
                                                <span className="ml-1">Save</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                {isEditing ? (
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="mt-1"
                                    />
                                ) : (
                                    <Typography variant="p" className="mt-1 p-2 bg-muted rounded">
                                        {feedback.title}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                {isEditing ? (
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-1"
                                        rows={3}
                                    />
                                ) : (
                                    <Typography variant="p" className="mt-1 p-2 bg-muted rounded min-h-[80px]">
                                        {feedback.description || 'No description provided'}
                                    </Typography>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Questions Section - Full Width */}
                <div className="lg:col-span-2">
                    <QuestionForm
                        questions={questions}
                        onChange={setQuestions}
                        isReadOnly={!isEditing}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <Typography variant="h3">Statistics</Typography>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Questions:</span>
                                <span className="font-medium">{feedback.questions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Responses:</span>
                                <span className="font-medium">{feedback.responses?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium text-sm">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="font-medium text-sm">
                                    {new Date(feedback.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card>
                        <CardHeader>
                            <Typography variant="h3">Actions</Typography>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/feedbacks/${feedbackId}/responses`)}
                            >
                                <Eye size={16} />
                                <span className="ml-2">View Responses</span>
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full" variant="destructive">
                                        <Trash2 size={16} />
                                        <span className="ml-2">Delete Form</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Feedback Form</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &quot;{feedback.title}&quot;? This action cannot be undone and will also delete all associated responses.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default FeedbackDetailPage
