'use client'

import { useGetPagesQuery } from '@/redux/api/content';
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from 'next/navigation';
import Typography from '@/components/ui/typography';

const Page = () => {
    const { data, isLoading } = useGetPagesQuery();
    const router = useRouter();

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading...</div>
    }

    return (
        <div className="w-full">
            <div className=""> 
                <Typography variant='h3' className='font-bold'>Pages</Typography>
                <Typography variant='p' className='mt-2 mb-4 text-gray-600'>Use this section to manage and update the elements of designated pages, such as Home and Introduction.</Typography>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-muted-foreground">Page</TableHead>
                        <TableHead className="text-muted-foreground">Content</TableHead>
                        <TableHead className="text-muted-foreground">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data.map((page) => (
                        <TableRow key={page.page} onClick={() => router.push(`/pages/${page.page}`)} className='cursor-pointer'>
                            <TableCell className="font-medium capitalize">{page.page}</TableCell>
                            <TableCell className={page.content ? "text-foreground" : "text-muted-foreground"}>{page.content ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatDistanceToNow(new Date(page.createdAt), { addSuffix: true })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default Page