
import React from "react";
import { Link } from "react-router-dom";
import { Cog, MapPin, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { logger } from "@/lib/logger";

interface Asset {
 id: string;
 name: string;
 location?: string | null;
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

function getStatusConfig(status: string) {
 switch (status?.toLowerCase()) {
   case "operational":
   case "active":
     return {
       label: "Operational",
       className: "bg-success/10 text-success border border-success/20",
       Icon: CheckCircle2,
     };
   case "maintenance":
   case "under_maintenance":
     return {
       label: "Maintenance",
       className: "bg-warning/10 text-warning border border-warning/20",
       Icon: AlertTriangle,
     };
   case "inactive":
   case "decommissioned":
     return {
       label: "Inactive",
       className: "bg-muted text-muted-foreground border border-border",
       Icon: Cog,
     };
   default:
     return {
       label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
       className: "bg-muted text-muted-foreground border border-border",
       Icon: Cog,
     };
 }
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
 logger.log('🔍 AssetGridView - Current user role:', currentUserRole);
 logger.log('🔍 AssetGridView - Can delete:', canDelete);
 logger.log('🔍 AssetGridView - Can edit:', canEdit);

 if (isLoading) {
   return (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {[...Array(6)].map((_, i) => (
         <div key={i} className="surface-card rounded-lg overflow-hidden">
           <Skeleton className="h-10 w-full mb-4" />
           <div className="p-5 space-y-3">
             <Skeleton className="h-5 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
             <Skeleton className="h-4 w-1/3" />
           </div>
         </div>
       ))}
     </div>
   );
 }

 if (error) {
   return (
     <div className="text-center py-12 surface-card rounded-lg">
       <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
       <p className="text-destructive font-medium">Error loading assets.</p>
     </div>
   );
 }

 if (!assets?.length) {
   return <AssetEmptyState hasFilters={hasFilters} />;
 }

 return (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     {assets.map((asset) => {
       const { label, className, Icon } = getStatusConfig(asset.status);
       return (
         <div key={asset.id} className="relative group">
           <Link
             to={`/assets/${asset.id}`}
             className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl"
             aria-label={`Open ${asset.name}`}
           >
             <div className="bg-card border border-border rounded-lg overflow-hidden transition-ui duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col h-full">
               {/* Card header strip */}
               <div className="bg-primary/5 px-5 pt-5 pb-4 flex items-start justify-between gap-3">
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Cog className="h-5 w-5 text-primary" />
                   </div>
                   <div className="min-w-0">
                     <p className="label-eyebrow mb-0.5">Asset</p>
                     <h3 className="font-headline font-semibold text-base text-foreground truncate leading-tight">
                       {asset.name}
                     </h3>
                   </div>
                 </div>
                 <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
                   <Icon className="h-3 w-3" />
                   {label}
                 </span>
               </div>

               {/* Card body */}
               <div className="px-5 py-4 flex-1 flex flex-col justify-between">
                 {asset.location ? (
                   <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                     <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
                     <span className="truncate">{asset.location}</span>
                   </div>
                 ) : (
                   <div className="text-muted-foreground text-sm mb-4 italic">No location set</div>
                 )}

                 <div className="pt-3 border-t border-border flex items-center justify-between">
                   <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                     View details
                   </span>
                   <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                 </div>
               </div>
             </div>
           </Link>

           {/* Delete button — only for admins */}
           {canDelete && (
             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button
                     variant="ghost"
                     size="sm"
                     disabled={isDeleting}
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                     className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-lg"
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
                       onClick={() => onDeleteAsset(asset.id)}
                       disabled={isDeleting}
                       className="bg-destructive hover:bg-destructive/90"
                     >
                       {isDeleting ? "Deleting..." : "Delete"}
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
             </div>
           )}
         </div>
       );
     })}
   </div>
 );
};

export default AssetGridView;
