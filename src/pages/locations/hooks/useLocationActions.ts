
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLocation, deleteLocation, updateLocation } from "@/services/locationService";

export const useLocationActions = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleEditLocation = async (locationData: {
    name: string;
    description: string;
    parent_id: string | null;
  }) => {
    if (!editingLocation) return;
    
    setIsUpdating(true);
    try {
      await updateLocation(editingLocation.id, locationData);
      toast.success("Location updated successfully");
      
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
      
      setIsEditDialogOpen(false);
      setEditingLocation(null);
    } catch (err: any) {
      console.error("Error updating location:", err);
      toast.error(err.message || "Failed to update location");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    setIsDeleting(true);
    try {
      await deleteLocation(locationId);
      toast.success("Location deleted successfully");

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

  const handleEditLocationClick = (location: any) => {
    setEditingLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedParentId("");
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingLocation(null);
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    selectedParentId,
    editingLocation,
    isCreating,
    isUpdating,
    isDeleting,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddSubLocation,
    handleEditLocationClick,
    handleDialogClose,
    handleEditDialogClose
  };
};
