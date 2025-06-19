
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  CreateLocationData,
  LocationWithChildren
} from "@/services/locationService";
import { toast } from "sonner";

export function useLocationActions() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [editingLocation, setEditingLocation] = useState<LocationWithChildren | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsAddDialogOpen(false);
      setSelectedParentId("");
    },
    onError: (error) => {
      console.error('Error creating location:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateLocationData> }) =>
      updateLocation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsEditDialogOpen(false);
      setEditingLocation(null);
    },
    onError: (error) => {
      console.error('Error updating location:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
    }
  });

  const handleAddLocation = useCallback(async (data: CreateLocationData) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleEditLocation = useCallback(async (data: CreateLocationData) => {
    if (!editingLocation) return;
    await updateMutation.mutateAsync({
      id: editingLocation.id,
      updates: data
    });
  }, [editingLocation, updateMutation]);

  const handleDeleteLocation = useCallback(async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteMutation.mutateAsync(locationId);
    }
  }, [deleteMutation]);

  const handleAddSubLocation = useCallback((parentId: string) => {
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  }, []);

  const handleEditLocationClick = useCallback((location: LocationWithChildren) => {
    setEditingLocation(location);
    setIsEditDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
    setSelectedParentId("");
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingLocation(null);
  }, []);

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    selectedParentId,
    editingLocation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddSubLocation,
    handleEditLocationClick,
    handleDialogClose,
    handleEditDialogClose
  };
}
