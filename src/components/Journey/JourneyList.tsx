"use client";
import React, { useState } from "react";
import {
  useGetJourneysQuery,
  useDeleteJourneyMutation,
} from "@/redux/api/college";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Plus, Edit, Trash2, Loader2, Calendar, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JourneyDetail from "./JourneyDetail";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IJourney } from "@/redux/api/college";

const JourneyList = () => {
  const { data: journeys, isLoading } = useGetJourneysQuery();
  const [deleteJourney, { isLoading: isDeleting }] = useDeleteJourneyMutation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<IJourney | null>(null);

  const handleEdit = (journey: IJourney) => {
    setSelectedJourney(journey);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJourney(id).unwrap();
      toast({
        title: "Success",
        description: "Journey deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting journey:", error);
      toast({
        title: "Error",
        description: "Failed to delete journey",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedJourney(null);
  };

  // Sort journeys by year (low to high)
  const sortedJourneys = journeys?.data?.slice().sort((a, b) => {
    const yearA = parseInt(a.year);
    const yearB = parseInt(b.year);
    return yearA - yearB;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4E001C] to-[#72002A] text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">The Atharva Journey</h1>
            <p className="text-white/80 mt-1">
              Track and manage your journey milestones
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-white text-[#4E001C] hover:bg-gray-100 font-semibold shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Journey
          </Button>
        </div>
      </div>

      {sortedJourneys?.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">No journeys found</CardTitle>
          <CardDescription className="mb-4">
            Create your first journey to get started tracking your milestones.
          </CardDescription>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Journey
          </Button>
        </Card>
      ) : (
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#4E001C]/20"></div>

          <div className="space-y-8">
            {sortedJourneys?.map((journey) => (
              <div
                key={journey._id}
                className="relative flex items-start group"
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-[#4E001C] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {journey.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="ml-8 flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#4E001C] mb-2">
                        {journey.year}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        {journey.createdAt && (
                          <span>
                            Created{" "}
                            {formatDistanceToNow(new Date(journey.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {journey.image_url && (
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Image
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - visible on hover */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(journey)}
                        className="text-[#4E001C] hover:bg-[#4E001C]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the journey for year{" "}
                              {journey.year}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(journey._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Journey Image */}
                  {journey.image_url && (
                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4 border">
                      <Image
                        src={journey.image_url}
                        alt={`Journey ${journey.year}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Journey Description */}
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {journey.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Journey Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Journey</DialogTitle>
          </DialogHeader>
          <JourneyDetail onClose={handleCloseModals} />
        </DialogContent>
      </Dialog>

      {/* Edit Journey Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Journey</DialogTitle>
          </DialogHeader>
          {selectedJourney && (
            <JourneyDetail
              journey={selectedJourney}
              onClose={handleCloseModals}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JourneyList;
