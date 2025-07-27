"use client"
import { useGetNewsByIdQuery, useCreateNewsMutation, useUpdateNewsMutation } from '@/redux/api/college'
import React, {  useEffect } from 'react'
import Typography from '../ui/typography'
import { Save } from 'lucide-react'
import { Button } from '../ui/button'
// import Image from 'next/image'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
// import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '../ui/card'

interface IProps {
    mode: 'create' | 'edit'
    id?: string
}

export interface INewsFormInputs {
    title: string;
    // image_url: string;
    link?: string;
}

const NewsDetail = ({ mode, id }: IProps) => {
    // const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
    // const { uploadFile, uploading } = useFileUpload()
    const router = useRouter()

    const { data: newsData } = useGetNewsByIdQuery(id!, { skip: mode === 'create' || !id })
    const [createNews, { isLoading: creating }] = useCreateNewsMutation()
    const [updateNews, { isLoading: updating }] = useUpdateNewsMutation()

    const form = useForm<INewsFormInputs>({
        defaultValues: {
            title: '',
            // image_url: '',
            link: ''
        }
    })

    useEffect(() => {
        if (mode === 'edit' && newsData?.data) {
            form.reset({
                title: newsData.data.name,
                // image_url: newsData.data.image_url,
                link: newsData.data.link || ''
            })
        }
    }, [newsData, form, mode])

    const onSubmit = async (data: INewsFormInputs) => {
        try {
            const payload = {
                name: data.title, // Backend expects 'name' but we use 'title' in UI
                // image_url: data.image_url,
                link: data.link || ''
            }

            if (mode === 'create') {
                await createNews(payload).unwrap()
                toast({
                    title: "Success",
                    description: "News created successfully",
                    variant: "default"
                })
            } else if (mode === 'edit' && id) {
                await updateNews({ id, data: payload }).unwrap()
                toast({
                    title: "Success",
                    description: "News updated successfully",
                    variant: "default"
                })
            }
            
            router.push('/news')
        } catch (error) {
            toast({
                title: "Error",
                description: mode === 'create' ? "Failed to create news" : "Failed to update news",
                variant: "destructive"
            })
            console.error(error)
        }
    }

    // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = e.target.files
    //     if (!files || files.length === 0) return

    //     const file = files[0]
    //     const url = await uploadFile(file)
    //     if (url) {
    //         form.setValue('image_url', url, { shouldDirty: true })
    //     }
    // }

    // const ImageViewDialog = () => (
    //     <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
    //         <DialogContent className="max-w-3xl">
    //         <DialogHeader>
    //             <DialogTitle>Image Preview</DialogTitle>
    //         </DialogHeader>
    //         {viewImageUrl && (
    //             <div className="relative w-full h-[60vh]">
    //             <Image
    //                 src={viewImageUrl}
    //                 alt="Preview"
    //                 fill
    //                 className="object-contain"
    //             />
    //             </div>
    //         )}
    //     </DialogContent>
    //     </Dialog>
    // )

    const isLoading = creating || updating

    return (
        <div className="space-y-6">
            {/* <ImageViewDialog /> */}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <Typography variant="h2">
                            {mode === 'create' ? 'Create New News' : 'Edit News'}
                        </Typography>
                        <Button 
                            onClick={form.handleSubmit(onSubmit)} 
                            loading={{ isLoading }} 
                            disabled={isLoading}
                        >
                            <Save size={20} />
                            <span>{mode === 'create' ? 'Create' : 'Update'}</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>News Title *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter news title"
                                                required
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="image_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-4 mb-2">
                                            <FormLabel>News Image *</FormLabel>
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setViewImageUrl(field.value)}
                                                >
                                                    <Eye size={16} />
                                                    <span>Preview</span>
                                                </Button>
                                            )}
                                        </div>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                                <Typography variant="p" className="text-muted-foreground">
                                                    or
                                                </Typography>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter image URL"
                                                    required
                                                />
                                            </div>
                                        </FormControl>
                                        {field.value && (
                                            <div className="mt-2">
                                                <div className="relative aspect-video w-full max-w-md">
                                                    <Image
                                                        src={field.value}
                                                        alt="News preview"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            /> */}

                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>External Link (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter external link URL"
                                                type="url"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default NewsDetail 