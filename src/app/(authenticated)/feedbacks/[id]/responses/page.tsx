"use client"
import { useGetFeedbackFormByIdQuery, useGetFeedbackResponsesQuery } from '@/redux/api/college'
import React from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Mail, ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const FeedbackResponsesPage = () => {
    const router = useRouter()
    const params = useParams()
    const feedbackId = params.id as string
    const [openSections, setOpenSections] = React.useState<Set<string>>(new Set())

    const { data: feedbackData, isLoading: isLoadingForm } = useGetFeedbackFormByIdQuery(feedbackId)
    const { data: responsesData, isLoading: isLoadingResponses } = useGetFeedbackResponsesQuery(feedbackId)

    const toggleSection = (email: string) => {
        const newOpenSections = new Set(openSections)
        if (newOpenSections.has(email)) {
            newOpenSections.delete(email)
        } else {
            newOpenSections.add(email)
        }
        setOpenSections(newOpenSections)
    }

    const exportResponses = () => {
        if (!responsesData?.data || !feedbackData?.data) return

        const csvContent = generateCSV(responsesData.data, feedbackData.data)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `feedback-responses-${feedbackData.data.title}-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const generateCSV = (responses: any[], feedback: any) => {
        const headers = ['Respondent Name', 'Email', 'Submitted At']
        feedback.questions?.forEach((q: any, index: number) => {
            headers.push(`Q${index + 1}: ${q.question_text} (${q.category})`)
        })

        const rows = responses.map(response => {
            const row = [
                response.respondent_name,
                response.respondent_email,
                new Date(response.submitted_at).toLocaleString()
            ]

            response.answers.forEach((answer: any) => {
                row.push(answer.rating.toString())
            })

            return row
        })

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        return csvContent
    }

    if (isLoadingForm || isLoadingResponses) {
        return (
            <div className="flex justify-center items-center h-64">
                <Typography variant="p">Loading responses...</Typography>
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
    const responses = responsesData?.data || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/feedbacks/${feedbackId}`)}
                    >
                        <ArrowLeft size={16} />
                        Back to Form
                    </Button>
                    <div>
                        <Typography variant="h1">Feedback Responses</Typography>
                        <Typography variant="p" className="text-muted-foreground">
                            {feedback.title}
                        </Typography>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportResponses}>
                        <Download size={16} />
                        <span className="ml-2">Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{responses.length}</div>
                        <div className="text-sm text-muted-foreground">Total Responses</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{feedback.questions?.length || 0}</div>
                        <div className="text-sm text-muted-foreground">Questions</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {responses.length > 0 ? Math.round((responses.length / (feedback.questions?.length || 1)) * 100) / 100 : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg per Question</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {responses.length > 0 ? new Date(responses[0]?.submitted_at).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Latest Response</div>
                    </CardContent>
                </Card>
            </div>



            {/* Response Submissions by Respondent */}
            <Card>
                <CardHeader>
                    <Typography variant="h2">Response Submissions</Typography>
                </CardHeader>
                <CardContent>
                    {responses.length > 0 ? (
                        <div className="space-y-6">
                            {/* Group responses by respondent email */}
                            {Object.entries(
                                [...responses]
                                    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                                    .reduce((acc: Record<string, any[]>, response: any) => {
                                        const key = response.respondent_email
                                        if (!acc[key]) {
                                            acc[key] = []
                                        }
                                        acc[key].push(response)
                                        return acc
                                    }, {} as Record<string, any[]>)
                            ).map(([email, respondentResponses]: [string, any[]]) => {
                                const firstResponse = respondentResponses[0]
                                const isOpen = openSections.has(email)
                                return (
                                    <Collapsible key={email} open={isOpen} onOpenChange={() => toggleSection(email)}>
                                        <div className="border rounded-lg bg-muted/30">
                                            {/* Respondent Header - Collapsible Trigger */}
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex justify-between items-center p-6 hover:bg-muted/50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                                <Mail size={18} className="text-primary" />
                                                            </div>
                                                            <div className="text-left">
                                                                <Typography variant="h3" className="font-semibold text-lg">
                                                                    {firstResponse.respondent_name}
                                                                </Typography>
                                                                <Typography variant="p" className="text-sm text-muted-foreground">
                                                                    {email}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span>Total Submissions: {respondentResponses.length}</span>
                                                            <span>•</span>
                                                            <span>Latest: {new Date(Math.max(...respondentResponses.map(r => new Date(r.submitted_at).getTime()))).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {respondentResponses.length} submission{respondentResponses.length > 1 ? 's' : ''}
                                                        </Badge>
                                                        {isOpen ? (
                                                            <ChevronDown size={20} className="text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight size={20} className="text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>

                                            {/* Individual Submissions - Collapsible Content */}
                                            <CollapsibleContent>
                                                <Separator />
                                                <div className="p-6">
                                                    <div className="space-y-4">
                                                        {[...respondentResponses]
                                                            .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                                                            .map((response: any, index: number) => (
                                                            <div key={response._id} className="bg-background border rounded-lg p-4">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <Typography variant="h4" className="font-medium">
                                                                        Submission #{index + 1}
                                                                    </Typography>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {new Date(response.submitted_at).toLocaleString()}
                                                                    </div>
                                                                </div>

                                                                <div className="grid gap-3">
                                                                    {response.answers.map((answer: any, answerIndex: number) => {
                                                                        const question = feedback.questions?.find((q: any) => q._id === answer.question_id)
                                                                        return (
                                                                            <div key={answerIndex} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                                                                                <div className="flex-1">
                                                                                    <Typography variant="p" className="text-sm font-medium">
                                                                                        Q{answerIndex + 1}: {question?.question_text}
                                                                                    </Typography>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            {question?.category}
                                                                                        </Badge>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 ml-4">
                                                                                    <div className="text-right">
                                                                                        <div className="text-lg font-semibold text-primary">
                                                                                            {answer.rating}
                                                                                        </div>
                                                                                        <div className="text-xs text-muted-foreground">
                                                                                            /{question?.max_rating || 5}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Typography variant="p" className="text-muted-foreground">
                                No responses received yet for this feedback form.
                            </Typography>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default FeedbackResponsesPage
