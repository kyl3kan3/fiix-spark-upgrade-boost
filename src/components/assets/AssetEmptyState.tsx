
import React from "react";
import { Link } from "react-router-dom";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface AssetEmptyStateProps {
  hasFilters: boolean;
}

const AssetEmptyState: React.FC<AssetEmptyStateProps> = ({ hasFilters }) => {
  const { currentUserRole } = useUserRolePermissions();
  const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';

  return (
    <div className="text-center py-16 bg-card rounded-3xl border-2 border-border">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-muted-foreground" strokeWidth={2} />
      </div>
      <h3 className="font-display font-bold text-xl text-foreground">
        {hasFilters ? "Nothing matches that search" : "No equipment yet"}
      </h3>
      <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto px-4 font-medium">
        {hasFilters
          ? "Try changing your filters or search words."
          : canAdd
            ? "Add the tools, vehicles, or machines you take care of."
            : "Ask your manager to add equipment for your team."}
      </p>
      {!hasFilters && canAdd && (
        <div className="mt-6">
          <Link to="/assets/new">
            <Button variant="accent" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AssetEmptyState;
