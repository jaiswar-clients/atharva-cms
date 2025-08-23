"use client"
import { useGetFeedbackFormsQuery, useDeleteFeedbackFormMutation } from '@/redux/api/college'
import React from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

const FeedbacksPage = () => {
    const router = useRouter()
    const { data: feedbacksData, isLoading } = useGetFeedbackFormsQuery()
    const [deleteFeedback] = useDeleteFeedbackFormMutation()

    // Check if there's any active feedback form
    const hasActiveFeedback = feedbacksData?.data?.some(feedback => feedback.is_active) || false

    const handleDelete = async (id: string, title: string) => {
        try {
            await deleteFeedback(id).unwrap()
            toast({
                title: "Success",
                description: `Feedback form "${title}" deleted successfully`,
                variant: "default"
            })
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
        // This would typically call an API to toggle active status
        // For now, we'll just show a message
        toast({
            title: "Info",
            description: "Active status toggle functionality would be implemented here",
            variant: "default"
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Typography variant="p">Loading feedback forms...</Typography>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Typography variant="h1">Feedback Forms Management</Typography>
                <Button
                    onClick={() => router.push('/feedbacks/create')}
                    disabled={hasActiveFeedback}
                    title={hasActiveFeedback ? "Cannot create new form while an active form exists" : "Create new feedback form"}
                >
                    <Plus size={20} />
                    <span>Add Feedback Form</span>
                </Button>
            </div>

            {hasActiveFeedback && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-amber-600" />
                        <Typography variant="p" className="text-amber-800 font-medium">
                            Active Feedback Form Detected
                        </Typography>
                    </div>
                    <Typography variant="p" className="text-amber-700 text-sm mt-1">
                        You cannot create a new feedback form while an existing form is active. Deactivate or delete the active form first.
                    </Typography>
                </div>
            )}

            {feedbacksData?.data && feedbacksData.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacksData.data.map((feedback) => (
                        <Card key={feedback._id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Typography variant="h3" className="line-clamp-2">
                                        {feedback.title}
                                    </Typography>
                                    <Badge variant={feedback.is_active ? "default" : "secondary"}>
                                        {feedback.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {feedback.description && (
                                        <Typography variant="p" className="text-muted-foreground text-sm line-clamp-2">
                                            {feedback.description}
                                        </Typography>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Questions: {feedback.questions?.length || 0}</span>
                                        <span>Responses: {feedback.responses?.length || 0}</span>
                                    </div>

                                    <Typography variant="p" className="text-muted-foreground text-xs">
                                        Created: {new Date(feedback.createdAt).toLocaleDateString()}
                                    </Typography>

                                    <div className="flex justify-between items-center gap-2">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/feedbacks/${feedback._id}`)}
                                            >
                                                <Pencil size={16} />
                                                <span>Edit</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/feedbacks/${feedback._id}/responses`)}
                                            >
                                                <Eye size={16} />
                                                <span>Responses</span>
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleActiveStatus()}
                                                title={feedback.is_active ? "Deactivate form" : "Activate form"}
                                            >
                                                {feedback.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="destructive">
                                                        <Trash2 size={16} />
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
                                                            onClick={() => handleDelete(feedback._id, feedback.title)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Typography variant="h3" className="mb-4">No Feedback Forms Found</Typography>
                    <Typography variant="p" className="text-muted-foreground mb-6">
                        Get started by creating your first feedback form.
                    </Typography>
                    <Button
                        onClick={() => router.push('/feedbacks/create')}
                        disabled={hasActiveFeedback}
                    >
                        <Plus size={20} />
                        <span>Create Feedback Form</span>
                    </Button>
                </div>
            )}
        </div>
    )
}

export default FeedbacksPage
