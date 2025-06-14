
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
    console.log('🏗️ Creating location:', locationData);
    
    try {
      await createLocation(locationData);
      toast.success("Location added successfully");
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
      
      setIsAddDialogOpen(false);
      setSelectedParentId("");
      console.log('✅ Location created successfully');
    } catch (err: any) {
      console.error("❌ Error creating location:", err);
      toast.error(err.message || "Failed to add location");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    console.log('🗑️ Delete location requested for ID:', locationId);
    
    // Show confirmation first
    const confirmDelete = window.confirm("Are you sure you want to delete this location? This action cannot be undone.");
    if (!confirmDelete) {
      console.log('❌ User cancelled deletion');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteLocation(locationId);
      toast.success("Location deleted successfully");
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ["locationHierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["allLocations"] });
      
      console.log('✅ Location deletion completed successfully');
    } catch (err: any) {
      console.error("❌ Error deleting location:", err);
      toast.error(err.message || "Failed to delete location");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubLocation = (parentId: string) => {
    console.log('➕ Add sub-location for parent:', parentId);
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    console.log('❌ Dialog closed');
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
