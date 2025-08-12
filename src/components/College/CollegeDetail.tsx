"use client"
import { useGetCollegeByIdQuery, useUpdateCollegeByIdMutation } from '@/redux/api/college'
import React, { useState, useEffect } from 'react'
import Typography from '../ui/typography'
import { X, Eye, Plus, Edit, Check } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useFieldArray, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { toast } from '@/hooks/use-toast'
import CollegeTabs from './CollegeTabs'
import { Separator } from '../ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface IProps {
    id: string
}

export interface ICollegeFormInputs {
    name: string;
    description: string;
    logo: string;
    banner_image: string;
    carousel_images: { url: string }[];
}

const CollegeDetail = ({ id }: IProps) => {
    // Local edit states for clear scoping of Save buttons
    const [isEditingBranding, setIsEditingBranding] = useState(false)
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [isEditingCarousel, setIsEditingCarousel] = useState(false)
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null)
    const [showCarouselModal, setShowCarouselModal] = useState(false)
    const { uploadFile, uploading } = useFileUpload()

    const { data } = useGetCollegeByIdQuery(id)
    const [updateCollegeApi, { isLoading: updating }] = useUpdateCollegeByIdMutation()

    const form = useForm<ICollegeFormInputs>({
        defaultValues: {
            name: '',
            description: '',
            logo: '',
            banner_image: '',
            carousel_images: []
        }
    })


    const { fields: carouselImages, append: appendCarouselImage, remove: removeCarouselImage } = useFieldArray({
        control: form.control,
        name: 'carousel_images'
    })

    useEffect(() => {
        if (data?.data) {
            form.reset({
                name: data.data.name,
                description: data.data.description,
                logo: data.data.logo,
                banner_image: data.data.banner_image,
                carousel_images: data.data.carousel_images.map((image) => ({ url: image })) || []
            })
        }
    }, [data, form])


    const submitAllFields = async (data: ICollegeFormInputs) => {
        try {
            const carouselImages = data.carousel_images.map((image) => image.url)
            await updateCollegeApi({ data: { ...data, carousel_images: carouselImages }, id }).unwrap()
            toast({
                title: "Success",
                description: "College updated successfully",
                variant: "default"
            })
            return true
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
            console.log(error)
            return false
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ICollegeFormInputs) => {
        const files = e.target.files
        if (!files) return

        for (const file of files) {
            const url = await uploadFile(file)
            if (url) {
                if (fieldName === 'carousel_images') {
                    appendCarouselImage({ url })
                } else {
                    form.setValue(fieldName, url, { shouldDirty: true })
                }
            }
        }
    }

    const ImageViewDialog = () => (
        <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Image Preview</DialogTitle>
                </DialogHeader>
                {viewImageUrl && (
                    <div className="relative w-full h-[60vh]">
                        <Image
                            src={viewImageUrl}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )

    // derive scoped dirty states for better UX
    const dirty = form.formState.dirtyFields as Partial<Record<keyof ICollegeFormInputs, any>>
    const isBrandingDirty = !!(dirty.logo || dirty.banner_image)
    const isInfoDirty = !!(dirty.name || dirty.description)
    const isCarouselDirty = !!dirty.carousel_images

    // scoped save handlers
    const saveBranding = () =>
        form.handleSubmit(async (values) => {
            const ok = await submitAllFields(values)
            if (ok) setIsEditingBranding(false)
        })()

    const saveInfo = () =>
        form.handleSubmit(async (values) => {
            const ok = await submitAllFields(values)
            if (ok) setIsEditingInfo(false)
        })()

    const saveCarousel = () =>
        form.handleSubmit(async (values) => {
            const ok = await submitAllFields(values)
            if (ok) setIsEditingCarousel(false)
        })()

    return (
        <div className="space-y-6">
            <ImageViewDialog />

            {/* Title */}
            <div className="flex flex-row items-center gap-3">
                <Image
                    src={form.watch('logo') || "/placeholder.svg"}
                    alt={`${form.watch('name')} logo`}
                    width={52}
                    height={52}
                />
                <Typography variant="h2" className="ml-1 !text-xl !font-semibold tracking-tight">
                    {form.watch('name')}
                </Typography>
            </div>

            <Form {...form}>
                {/* Branding Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Branding</CardTitle>
                        {isEditingBranding ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingBranding(false)} className="gap-2">
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                                <Button onClick={saveBranding} size="sm" className="gap-2" loading={{ isLoading: updating }} disabled={!isBrandingDirty || updating}>
                                    <Check className="h-4 w-4" />
                                    <span>Save</span>
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsEditingBranding(true)} size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form className="grid grid-cols-1 gap-6">
                            <div className="flex flex-row gap-4 justify-between">
                                <FormField
                                    control={form.control}
                                    name="logo"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <div>
                                                <FormLabel>Logo</FormLabel>
                                                <br />
                                                {!isEditingBranding && field.value && (
                                                    <Button type='button' size="sm" variant="outline" className="gap-2"
                                                        onClick={() => setViewImageUrl(field.value)}>
                                                        <Eye className="h-4 w-4" />
                                                        <span>View</span>
                                                    </Button>
                                                )}
                                            </div>
                                            <FormControl>
                                                {isEditingBranding && (
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'logo')}
                                                        disabled={uploading}
                                                    />
                                                )}
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="banner_image"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <div>
                                                <FormLabel>Banner Image</FormLabel>
                                                <br />
                                                {!isEditingBranding && field.value && (
                                                    <Button type='button' size="sm" variant="outline" className="gap-2"
                                                        onClick={() => setViewImageUrl(field.value)}>
                                                        <Eye className="h-4 w-4" />
                                                        <span>View</span>
                                                    </Button>
                                                )}
                                            </div>
                                            <FormControl>
                                                {isEditingBranding && (
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'banner_image')}
                                                        disabled={uploading}
                                                    />
                                                )}
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Basic Info Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Basic Info</CardTitle>
                        {isEditingInfo ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(false)} className="gap-2">
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                                <Button onClick={saveInfo} size="sm" className="gap-2" loading={{ isLoading: updating }} disabled={!isInfoDirty || updating}>
                                    <Check className="h-4 w-4" />
                                    <span>Save</span>
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsEditingInfo(true)} size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form className="grid grid-cols-1 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>College Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={!isEditingInfo}
                                                placeholder="Enter college name"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                disabled={!isEditingInfo}
                                                placeholder="Enter college description"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </CardContent>
                </Card>

                {/* Carousel Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Carousel Images</CardTitle>
                        {isEditingCarousel ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingCarousel(false)} className="gap-2">
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                                <Button onClick={saveCarousel} size="sm" className="gap-2" loading={{ isLoading: updating }} disabled={!isCarouselDirty || updating}>
                                    <Check className="h-4 w-4" />
                                    <span>Save</span>
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsEditingCarousel(true)} size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <FormLabel>Images</FormLabel>
                            {isEditingCarousel && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setShowCarouselModal(true)}
                                >
                                    <Plus size={30} />
                                    <Typography variant='p'>Add Image</Typography>
                                </Button>
                            )}
                        </div>
                        {carouselImages?.length > 0 ? (
                            <div className="relative">
                                <Carousel
                                    opts={{ align: "start" }}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {carouselImages.map((image, index) => (
                                            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                                                <div className="p-1">
                                                    <div className="relative aspect-video">
                                                        <Image
                                                            src={image.url}
                                                            alt={`Carousel image ${index + 1}`}
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        {isEditingCarousel && (
                                                            <div className="flex justify-center items-center size-7 absolute bottom-2 right-2 rounded-full bg-destructive hover:bg-destructive/90 transition-colors cursor-pointer" onClick={() => removeCarouselImage(index)}>
                                                                <X className='text-white h-3 w-3' />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-2" type='button' />
                                    <CarouselNext className="right-2" type='button' />
                                </Carousel>
                                <Typography variant="p" className="text-sm text-gray-500 mt-2 text-center">
                                    {carouselImages.length} image{carouselImages.length !== 1 ? 's' : ''}
                                </Typography>
                            </div>
                        ) : (
                            <Typography variant="p" className="text-sm text-gray-500">
                                No carousel images added yet
                            </Typography>
                        )}

                        <Dialog open={showCarouselModal} onOpenChange={setShowCarouselModal}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Add Carousel Images</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {isEditingCarousel && (
                                        <div className="flex gap-3">
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'carousel_images')}
                                                disabled={uploading}
                                            />
                                            <Typography variant="p" className="text-sm text-gray-500">
                                                or
                                            </Typography>
                                            <Input
                                                placeholder="Add image URL and press Enter"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const input = e.target as HTMLInputElement
                                                        if (input.value.trim()) {
                                                            appendCarouselImage({ url: input.value.trim() })
                                                            input.value = ''
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </Form>

            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                    <CollegeTabs collegeId={id} />
                </CardContent>
            </Card>
        </div>
    )
}

export default CollegeDetail