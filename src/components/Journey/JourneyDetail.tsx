'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { Loader2, Upload, X } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { IJourney, useCreateJourneyMutation, useUpdateJourneyMutation } from '@/redux/api/college'
import Image from 'next/image'

const journeySchema = z.object({
  year: z.string().min(1, 'Year is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().optional(),
})

export type JourneyFormInputs = z.infer<typeof journeySchema>

interface JourneyDetailProps {
  journey?: IJourney
  onClose: () => void
}

const JourneyDetail: React.FC<JourneyDetailProps> = ({ journey, onClose }) => {
  const isEditing = Boolean(journey)
  const { uploadFile } = useFileUpload()
  const [createJourney, { isLoading: isCreating }] = useCreateJourneyMutation()
  const [updateJourney, { isLoading: isUpdating }] = useUpdateJourneyMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(journey?.image_url || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<JourneyFormInputs>({
    resolver: zodResolver(journeySchema),
    defaultValues: {
      year: journey?.year || '',
      description: journey?.description || '',
      image_url: journey?.image_url || '',
    },
  })

  useEffect(() => {
    if (journey) {
      form.reset({
        year: journey.year,
        description: journey.description,
        image_url: journey.image_url || '',
      })
      setImagePreview(journey.image_url || null)
    }
  }, [journey, form])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        form.setValue('image_url', url)
        setImagePreview(url)
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    form.setValue('image_url', '')
    setImagePreview(null)
  }

  const onSubmit = async (data: JourneyFormInputs) => {
    try {
      if (isEditing && journey) {
        await updateJourney({
          id: journey._id,
          data,
        }).unwrap()
        toast({
          title: 'Success',
          description: 'Journey updated successfully',
        })
      } else {
        await createJourney(data).unwrap()
        toast({
          title: 'Success',
          description: 'Journey created successfully',
        })
      }
      onClose()
    } catch (error) {
      console.error('Error saving journey:', error)
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} journey`,
        variant: 'destructive',
      })
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2024" {...field} />
              </FormControl>
              <FormMessage />
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
                  placeholder="Describe the journey..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Journey Image (Optional)</FormLabel>
          
          {imagePreview ? (
            <div className="relative">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Journey preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Click to upload an image
                  </span>
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
                {isUploadingImage && (
                  <div className="mt-2 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploadingImage}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Journey' : 'Create Journey'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default JourneyDetail 