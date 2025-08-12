'use client'
import React, { useState } from 'react'
import { useGetCollegesQuery } from '@/redux/api/college'
import Typography from '../ui/typography'
import CollegeList from './CollegeList'
import { Button } from '../ui/button'
import { Plus, ArrowUpDown } from 'lucide-react'
import CreateCollegeModal from './CreateCollegeModal'

const College = () => {
    const { data } = useGetCollegesQuery()
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Typography variant="h1" className='text-2xl !font-semibold tracking-tight'>Colleges</Typography>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowOrderModal(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="hidden md:inline">Change Order</span>
                    </Button>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Add College</span>
                    </Button>
                </div>
            </div>
            <br />
            <CollegeList 
                organizations={data?.data || []} 
                showOrderModal={showOrderModal}
                onSetShowOrderModal={setShowOrderModal}
            />
            
            <CreateCollegeModal
                open={createModalOpen} 
                onOpenChange={setCreateModalOpen} 
            />
        </div>
    )
}

export default College