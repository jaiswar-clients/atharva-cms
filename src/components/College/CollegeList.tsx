"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ICollege,
  useDeleteCollegeMutation,
  useChangeCollegeOrderMutation,
} from "@/redux/api/college";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";

function trimDescription(description: string, maxLength = 100) {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength)}...`;
}

interface OrganizationsTableProps {
  organizations: ICollege[];
  showOrderModal: boolean;
  onSetShowOrderModal: (show: boolean) => void;
}

export default function OrganizationsTable({
  organizations,
  showOrderModal,
  onSetShowOrderModal,
}: OrganizationsTableProps) {
  const router = useRouter();
  const [deleteCollege] = useDeleteCollegeMutation();
  const [changeCollegeOrder, { isLoading: isChangingOrder }] =
    useChangeCollegeOrderMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collegeToDelete, setCollegeToDelete] = useState<ICollege | null>(null);
  const [collegeOrder, setCollegeOrder] = useState<
    Array<{ id: string; index: number; name: string }>
  >([]);

  useEffect(() => {
    if (organizations) {
      // Sort by index if available, otherwise by creation date
      const sortedColleges = [...organizations].sort((a, b) => {
        if (a.index !== undefined && b.index !== undefined) {
          return a.index - b.index;
        }
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      setCollegeOrder(
        sortedColleges.map((college, index) => ({
          id: college._id,
          index: college.index ?? index,
          name: college.name,
        }))
      );
    }
  }, [organizations]);

  const handleDelete = async (e: React.MouseEvent, college: ICollege) => {
    e.stopPropagation(); // Prevent row click event
    setCollegeToDelete(college);
  };

  const confirmDelete = async () => {
    if (!collegeToDelete) return;

    try {
      setDeletingId(collegeToDelete._id);
      await deleteCollege(collegeToDelete._id).unwrap();
      toast({
        title: "Success",
        description: "College deleted successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setCollegeToDelete(null);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(collegeOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update indexes
    const updatedItems = items.map((item, index) => ({
      ...item,
      index,
    }));

    setCollegeOrder(updatedItems);
  };

  const handleSaveOrder = async () => {
    try {
      // Prepare the data for the API
      const orderData = {
        colleges: collegeOrder.map((item) => ({
          id: item.id,
          index: item.index,
        })),
      };

      // Call the API to update the order
      await changeCollegeOrder(orderData).unwrap();

      toast({
        title: "Success",
        description: "College order updated successfully",
      });

      // Close the modal
      onSetShowOrderModal(false);
    } catch (error) {
      console.error("Failed to update college order:", error);
      toast({
        title: "Error",
        description: "Failed to update college order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Dialog
        open={!!collegeToDelete}
        onOpenChange={(open) => !open && setCollegeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete College</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {collegeToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollegeToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingId === collegeToDelete?._id}
            >
              {deletingId === collegeToDelete?._id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderModal} onOpenChange={onSetShowOrderModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change College Order</DialogTitle>
            <DialogDescription>
              Drag and drop to reorder the colleges
            </DialogDescription>
          </DialogHeader>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="colleges">
              {(provided) => (
                <div
                  className="space-y-3"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {collegeOrder.map((college, index) => (
                    <Draggable
                      key={college.id}
                      draggableId={college.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 border rounded-lg bg-background ${
                            snapshot.isDragging ? "z-50 shadow-md" : ""
                          } transition-shadow`}
                          style={{
                            ...provided.draggableProps.style,
                            zIndex: snapshot.isDragging ? 9999 : "auto",
                          }}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium w-6 text-muted-foreground">{index + 1}.</span>
                          <span className="flex-1">{college.name}</span>
                          <Badge variant="outline">
                            Position {index + 1}
                          </Badge>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => onSetShowOrderModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              disabled={isChangingOrder}
            >
              {isChangingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-muted-foreground">Logo</TableHead>
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Description</TableHead>
            <TableHead className="text-right">Created</TableHead>
            <TableHead className="w-[100px] text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...organizations]
            .sort((a, b) => {
              if (a.index !== undefined && b.index !== undefined) {
                return a.index - b.index;
              }
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            })
            .map((org) => (
              <TableRow key={org.name}>
                <TableCell
                  onClick={() => router.push(`/colleges/${org._id}`)}
                  className="cursor-pointer"
                >
                  <div className="relative h-12 w-12">
                    <Image
                      src={org.logo || "/placeholder.svg"}
                      alt={`${org.name} logo`}
                      fill
                      className="rounded-lg object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell
                  onClick={() => router.push(`/colleges/${org._id}`)}
                  className="font-medium cursor-pointer"
                >
                  {org.name}
                </TableCell>
                <TableCell
                  onClick={() => router.push(`/colleges/${org._id}`)}
                  className="cursor-pointer"
                >
                  {trimDescription(org.description)}
                </TableCell>
                <TableCell
                  onClick={() => router.push(`/colleges/${org._id}`)}
                  className="text-right cursor-pointer"
                >
                  {formatDistanceToNow(new Date(org.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => handleDelete(e, org)}
                    disabled={deletingId === org._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
