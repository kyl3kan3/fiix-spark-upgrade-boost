
import React from "react";
import { Link } from "react-router-dom";
import { Cog, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";

interface AssetEmptyStateProps {
 hasFilters: boolean;
}

const AssetEmptyState: React.FC<AssetEmptyStateProps> = ({ hasFilters }) => {
 const { currentUserRole } = useUserRolePermissions();
 const canAdd = currentUserRole === 'administrator' || currentUserRole === 'manager';

 return (
   <div className="flex flex-col items-center justify-center py-20 surface-card rounded-lg border border-dashed border-border">
     <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
       <Cog className="h-8 w-8 text-primary/60" strokeWidth={1.5} />
     </div>
     <h3 className="font-headline font-bold text-xl text-foreground mb-2">
       {hasFilters ? "Nothing matches that search" : "No equipment yet"}
     </h3>
     <p className="text-sm text-muted-foreground max-w-sm text-center leading-relaxed mb-6">
       {hasFilters
         ? "Try changing your filters or search terms."
         : canAdd
         ? "Add the tools, vehicles, or machines you take care of."
         : "Ask your manager to add equipment for your team."}
     </p>
     {!hasFilters && canAdd && (
       <Link to="/assets/new">
         <Button variant="accent" size="lg">
           <Plus className="mr-2 h-4 w-4" />
           Add Your First Item
         </Button>
       </Link>
     )}
   </div>
 );
};

export default AssetEmptyState;
