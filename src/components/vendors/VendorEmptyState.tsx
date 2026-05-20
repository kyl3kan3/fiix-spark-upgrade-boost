
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
 <div className="text-center py-12 bg-card dark:bg-card rounded-lg border border-border dark:border-border">
 <Building2 className="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground" />
 <h3 className="mt-2 text-sm font-medium text-foreground dark:text-muted-foreground">No vendors found</h3>
 <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
 {hasFilters 
 ? "Try adjusting your search or filters." 
 : canAdd
 ? "Get started by creating a new vendor."
 : "No vendors have been created yet."}
 </p>
 {!hasFilters && canAdd && (
 <div className="mt-6">
 <Link to="/vendors/new">
 <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium">
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
