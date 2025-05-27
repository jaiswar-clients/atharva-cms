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
        <div>
            <div className="flex flex-row justify-between items-center">
                <Typography variant="h1" className='text-2xl'>Colleges</Typography>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setShowOrderModal(true)}
                        variant="outline"
                        className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Change Order
                    </Button>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus size={20} />
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