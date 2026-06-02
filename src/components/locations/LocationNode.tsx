
import React from "react";
import { MapPin, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import {
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
import { LocationWithChildren } from "@/services/locationService";
import { Link } from "react-router-dom";

interface LocationNodeProps {
 location: LocationWithChildren;
 level: number;
 isDeleting: boolean;
 onAddSubLocation: (parentId: string) => void;
 onDeleteLocation: (locationId: string) => void;
 onEditLocation: (location: LocationWithChildren) => void;
}

export const LocationNode: React.FC<LocationNodeProps> = ({
 location,
 level,
 isDeleting,
 onAddSubLocation,
 onDeleteLocation,
 onEditLocation
}) => {
 const hasChildren = location.children && location.children.length > 0;
 const indentClass = level === 0 ? "" : level === 1 ? "ml-6" : "ml-12";

 return (
   <AccordionItem value={location.id} className="border-b border-border last:border-0">
     <div className={`${indentClass} transition-all`}>
       <div className="flex items-center group hover:bg-muted/30 transition-colors">
         {hasChildren ? (
           <AccordionTrigger className="hover:no-underline py-0 flex-grow px-5">
             <div className="flex flex-grow items-center gap-3 py-3.5">
               <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                 <MapPin className="h-4 w-4 text-primary" />
               </div>
               <div className="flex-grow min-w-0 text-left">
                 <span className="font-medium text-sm text-foreground block truncate">{location.name}</span>
                 {location.description && (
                   <span className="text-xs text-muted-foreground truncate block">{location.description}</span>
                 )}
               </div>
               <Badge variant="outline" className="text-xs shrink-0 border-border text-muted-foreground">
                 {location.children?.length || 0} sub
               </Badge>
             </div>
           </AccordionTrigger>
         ) : (
           <div className="py-0 flex flex-grow items-center px-5">
             <div className="flex flex-grow items-center gap-3 py-3.5">
               <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                 <MapPin className="h-4 w-4 text-muted-foreground" />
               </div>
               <div className="flex-grow min-w-0">
                 <span className="font-medium text-sm text-foreground block truncate">{location.name}</span>
                 {location.description && (
                   <span className="text-xs text-muted-foreground truncate block">{location.description}</span>
                 )}
               </div>
             </div>
           </div>
         )}

         {/* Action buttons — visible on hover */}
         <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
           <Button
             variant="ghost"
             size="sm"
             asChild
             className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
           >
             <Link to={`/locations/${location.id}`} title="View location">
               <ExternalLink className="h-3 w-3" />
             </Link>
           </Button>
           <Button
             variant="ghost"
             size="sm"
             onClick={() => onEditLocation(location)}
             className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/8"
             title="Edit"
           >
             <Edit className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="sm"
             onClick={() => onAddSubLocation(location.id)}
             className="h-7 w-7 p-0 text-muted-foreground hover:text-secondary hover:bg-secondary/8"
             title="Add sub-location"
           >
             <Plus className="h-3 w-3" />
           </Button>
           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button
                 variant="ghost"
                 size="sm"
                 disabled={isDeleting}
                 className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
                 title="Delete"
               >
                 <Trash2 className="h-3 w-3" />
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Delete Location</AlertDialogTitle>
                 <AlertDialogDescription>
                   Are you sure you want to delete "{location.name}"? This action cannot be undone.
                   {hasChildren && (
                     <span className="block mt-2 text-destructive font-medium">
                       This location has sub-locations. You must delete them first.
                     </span>
                   )}
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction
                   onClick={() => onDeleteLocation(location.id)}
                   disabled={hasChildren || isDeleting}
                   className="bg-destructive hover:bg-destructive/90"
                 >
                   {isDeleting ? "Deleting..." : "Delete"}
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>

           <Link
             to={`/assets?location_id=${location.id}`}
             className="text-xs text-primary hover:underline px-2 py-1 font-medium"
           >
             Assets
           </Link>
         </div>
       </div>
     </div>

     {hasChildren && (
       <AccordionContent className="pb-0 border-l-2 border-primary/20 ml-9">
         {(location.children ?? []).map((child) => (
           <LocationNode
             key={child.id}
             location={child}
             level={level + 1}
             isDeleting={isDeleting}
             onAddSubLocation={onAddSubLocation}
             onDeleteLocation={onDeleteLocation}
             onEditLocation={onEditLocation}
           />
         ))}
       </AccordionContent>
     )}
   </AccordionItem>
 );
};
