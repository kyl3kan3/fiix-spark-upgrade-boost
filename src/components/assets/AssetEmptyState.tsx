
import React from "react";
import { Link } from "react-router-dom";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssetEmptyStateProps {
  hasFilters: boolean;
}

const AssetEmptyState: React.FC<AssetEmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No assets found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {hasFilters 
          ? "Try adjusting your search or filters." 
          : "Get started by creating a new asset."}
      </p>
      {!hasFilters && (
        <div className="mt-6">
          <Link to="/assets/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium">
              <Plus className="mr-2 h-4 w-4" />
              New Asset
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AssetEmptyState;
