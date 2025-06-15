
import React from "react";
import { Link } from "react-router-dom";
import { Package, MapPin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import AssetEmptyState from "./AssetEmptyState";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface Asset {
  id: string;
  name: string;
  location?: string;
  status: string;
}

interface AssetGridViewProps {
  assets?: Asset[];
  isLoading: boolean;
  error: any;
  hasFilters: boolean;
  isDeleting: boolean;
  onDeleteAsset: (assetId: string) => void;
}

const AssetGridView: React.FC<AssetGridViewProps> = ({
  assets,
  isLoading,
  error,
  hasFilters,
  isDeleting,
  onDeleteAsset,
}) => {
  const { currentUserRole } = useUserRolePermissions();
  const canDelete = currentUserRole === 'administrator';
  const canEdit = currentUserRole === 'administrator' || currentUserRole === 'manager';

  // Debug logging
  console.log('🔍 AssetGridView - Current user role:', currentUserRole);
  console.log('🔍 AssetGridView - Can delete:', canDelete);
  console.log('🔍 AssetGridView - Can edit:', canEdit);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-6 w-3/4 mb-4 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-1/2 mb-2 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-red-500 dark:text-red-400">Error loading assets.</p>
      </div>
    );
  }

  if (!assets?.length) {
    return <AssetEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => (
        <Card key={asset.id} className="p-4 hover:shadow-md transition-shadow h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-grow">
              {canEdit ? (
                <Link to={`/assets/edit/${asset.id}`} className="block">
                  <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{asset.name}</h3>
                </Link>
              ) : (
                <h3 className="font-medium text-gray-900 dark:text-white">{asset.name}</h3>
              )}
              {asset.location && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <p className="text-sm">{asset.location}</p>
                </div>
              )}
              
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  asset.status === "operational" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" :
                  asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" :
                  "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                }`}>
                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Delete button - only show for admins */}
            {canDelete && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          console.log('🗑️ Deleting asset:', asset.id);
                          onDeleteAsset(asset.id);
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AssetGridView;
