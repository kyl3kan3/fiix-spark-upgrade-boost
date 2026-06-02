
import React from "react";
import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface VendorEmptyStateProps {
 hasFilters: boolean;
}

const VendorEmptyState: React.FC<VendorEmptyStateProps> = ({ hasFilters }) => {
 const { currentUserRole } = useUserRolePermissions();
 const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';

 return (
 <div className="text-center py-14 bg-card rounded-lg border border-border shadow-sm">
 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
 <Building2 className="h-7 w-7 text-primary" />
 </div>
 <h3 className="mt-2 text-sm font-semibold text-foreground">No vendors found</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 {hasFilters
 ? "Try adjusting your search or filters."
 : canAdd
 ? "Get started by creating a new vendor."
 : "No vendors have been created yet."}
 </p>
 {!hasFilters && canAdd && (
 <div className="mt-6">
 <Link to="/vendors/new">
 <Button className="bg-primary hover:bg-primary-variant text-primary-foreground">
 <Plus className="mr-2 h-4 w-4" />
 New Vendor
 </Button>
 </Link>
 </div>
 )}
 </div>
 );
};

export default VendorEmptyState;
