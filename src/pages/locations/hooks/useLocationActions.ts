import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLocation, deleteLocation } from "@/services/locationService";

export const useLocationActions = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleAddLocation = async (locationData: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => {
    setIsCreating(true);
    try {
      await createLocation(locationData);
      toast.success("Location added successfully");
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
      
      setIsAddDialogOpen(false);
      setSelectedParentId("");
    } catch (err: any) {
      console.error("Error creating location:", err);
      toast.error(err.message || "Failed to add location");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    setIsDeleting(true);
    try {
      await deleteLocation(locationId);
      toast.success("Location deleted successfully");
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
    } catch (err: any) {
      console.error("Error deleting location:", err);
      toast.error(err.message || "Failed to delete location");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubLocation = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedParentId("");
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedParentId,
    isCreating,
    isDeleting,
    handleAddLocation,
    handleDeleteLocation,
    handleAddSubLocation,
    handleDialogClose
  };
};
