
import React, { useState } from "react";
import { ChevronDown, ChevronRight, Package, MapPin, Trash2 } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AssetWithChildren } from "@/services/assetService";
import { Link } from "react-router-dom";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface AssetHierarchyViewProps {
  assets: AssetWithChildren[];
  isLoading: boolean;
  isDeleting?: boolean;
  onDeleteAsset?: (assetId: string) => void;
}

export const AssetHierarchyView: React.FC<AssetHierarchyViewProps> = ({ 
  assets,
  isLoading,
  isDeleting = false,
  onDeleteAsset
}) => {
  const { currentUserRole } = useUserRolePermissions();
  const canDelete = currentUserRole === 'administrator';

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-100 rounded-md mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-md ml-6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start by adding assets to build your hierarchy.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="text-lg font-medium mb-4">Asset Hierarchy</h2>
      <Accordion type="multiple" className="w-full">
        {assets.map((asset) => (
          <AssetNode 
            key={asset.id} 
            asset={asset} 
            level={0}
            isDeleting={isDeleting}
            onDeleteAsset={onDeleteAsset}
            canDelete={canDelete}
          />
        ))}
      </Accordion>
    </div>
  );
};

interface AssetNodeProps {
  asset: AssetWithChildren;
  level: number;
  isDeleting: boolean;
  onDeleteAsset?: (assetId: string) => void;
  canDelete: boolean;
}

const AssetNode: React.FC<AssetNodeProps> = ({ 
  asset, 
  level,
  isDeleting,
  onDeleteAsset,
  canDelete
}) => {
  const hasChildren = asset.children && asset.children.length > 0;
  const paddingLeft = `${level * 0.5}rem`;
  
  return (
    <AccordionItem value={asset.id} className="border-b">
      <div style={{ paddingLeft }} className="transition-all">
        <div className="flex items-center">
          {hasChildren ? (
            <AccordionTrigger className="hover:no-underline py-2 flex-grow">
              <div className="flex flex-grow items-center">
                <Package className="h-4 w-4 text-fiix-600 mr-2" />
                <span className="font-medium text-gray-900">{asset.name}</span>
                {asset.location && (
                  <div className="flex items-center ml-3 text-gray-500 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {asset.location}
                  </div>
                )}
                <div className="ml-auto">
                  <Badge
                    className={`${
                      asset.status === "operational" ? "bg-green-100 text-green-800" :
                      asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}
                  >
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
          ) : (
            <div className="py-2 flex flex-grow items-center">
              <Package className="h-4 w-4 text-fiix-600 mr-2" />
              <span className="font-medium text-gray-900">{asset.name}</span>
              {asset.location && (
                <div className="flex items-center ml-3 text-gray-500 text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {asset.location}
                </div>
              )}
              <div className="ml-auto">
                <Badge
                  className={`${
                    asset.status === "operational" ? "bg-green-100 text-green-800" :
                    asset.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}
                >
                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 ml-2">
            <Link 
              to={`/assets/edit/${asset.id}`} 
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Edit
            </Link>
            {canDelete && onDeleteAsset && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                      {hasChildren && (
                        <span className="block mt-2 text-red-600 font-medium">
                          This asset has child assets. You must delete them first.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteAsset(asset.id)}
                      disabled={hasChildren || isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
      {hasChildren && (
        <AccordionContent className="pl-4">
          {asset.children.map((child) => (
            <AssetNode 
              key={child.id} 
              asset={child} 
              level={level + 1}
              isDeleting={isDeleting}
              onDeleteAsset={onDeleteAsset}
              canDelete={canDelete}
            />
          ))}
        </AccordionContent>
      )}
    </AccordionItem>
  );
};
