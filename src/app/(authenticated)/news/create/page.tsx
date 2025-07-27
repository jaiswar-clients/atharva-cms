"use client"
import React from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NewsDetail from '@/components/News/NewsDetail'

const CreateNewsPage = () => {
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Button>
                <Typography variant="h1">Create News</Typography>
            </div>

            <NewsDetail mode="create" />
        </div>
    )
}

export default CreateNewsPage 