
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  CreateAssetData,
  AssetWithChildren
} from "@/services/assetService";
import { toast } from "sonner";

export function useAssetActions() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [editingAsset, setEditingAsset] = useState<AssetWithChildren | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAddDialogOpen(false);
      setSelectedParentId("");
    },
    onError: (error) => {
      console.error('Error creating asset:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateAssetData> }) =>
      updateAsset(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsEditDialogOpen(false);
      setEditingAsset(null);
    },
    onError: (error) => {
      console.error('Error updating asset:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting asset:', error);
    }
  });

  const handleAddAsset = useCallback(async (data: CreateAssetData) => {
    await createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleEditAsset = useCallback(async (data: CreateAssetData) => {
    if (!editingAsset) return;
    await updateMutation.mutateAsync({
      id: editingAsset.id,
      updates: data
    });
  }, [editingAsset, updateMutation]);

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await deleteMutation.mutateAsync(assetId);
    }
  }, [deleteMutation]);

  const handleAddSubAsset = useCallback((parentId: string) => {
    setSelectedParentId(parentId);
    setIsAddDialogOpen(true);
  }, []);

  const handleEditAssetClick = useCallback((asset: AssetWithChildren) => {
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
    setSelectedParentId("");
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingAsset(null);
  }, []);

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    selectedParentId,
    editingAsset,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleAddAsset,
    handleEditAsset,
    handleDeleteAsset,
    handleAddSubAsset,
    handleEditAssetClick,
    handleDialogClose,
    handleEditDialogClose
  };
}
