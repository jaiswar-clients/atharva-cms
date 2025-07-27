"use client"
import { useGetNewsQuery, useDeleteNewsMutation } from '@/redux/api/college'
import React from 'react'
import Typography from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const NewsPage = () => {
    const router = useRouter()
    const { data: newsData, isLoading } = useGetNewsQuery()
    const [deleteNews] = useDeleteNewsMutation()

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteNews(id).unwrap()
            toast({
                title: "Success",
                description: `News "${name}" deleted successfully`,
                variant: "default"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete news",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Typography variant="p">Loading news...</Typography>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Typography variant="h1">News Management</Typography>
                <Button onClick={() => router.push('/news/create')}>
                    <Plus size={20} />
                    <span>Add News</span>
                </Button>
            </div>

            {newsData?.data && newsData.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsData.data.map((news) => (
                        <Card key={news._id} className="overflow-hidden">
                            {/* <CardHeader className="p-0">
                                <div className="relative aspect-video">
                                    <Image
                                        src={news.image_url}
                                        alt={news.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CardHeader> */}
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <Typography variant="p" className="line-clamp-2">
                                        {news.name          }
                                    </Typography>
                                
                                    <Typography variant="p" className="text-muted-foreground">
                                        Created: {new Date(news.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/news/${news._id}`)}
                                            >
                                                <Pencil size={16} />
                                                <span>Edit</span>
                                            </Button>
                                            {news.link && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(news.link, '_blank')}
                                                >
                                                    <ExternalLink size={16} />
                                                    <span>Link</span>
                                                </Button>
                                            )}
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete News</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete &quot;{news.name}&quot;? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(news._id, news.name)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Typography variant="h3" className="mb-4">No News Found</Typography>
                    <Typography variant="p" className="text-muted-foreground mb-6">
                        Get started by adding your first news item.
                    </Typography>
                    <Button onClick={() => router.push('/news/create')}>
                        <Plus size={20} />
                        <span>Add News</span>
                    </Button>
                </div>
            )}
        </div>
    )
}

export default NewsPage 