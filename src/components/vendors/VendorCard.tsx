
import React from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, Phone, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";
import { Vendor } from "@/services/vendorService";

interface VendorCardProps {
 vendor: Vendor;
 isSelected: boolean;
 isDeleting: boolean;
 onDeleteVendor: (vendorId: string) => void;
 onToggleSelection: (vendorId: string) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
 vendor,
 isSelected,
 isDeleting,
 onDeleteVendor,
 onToggleSelection,
}) => {
 const { currentUserRole } = useUserRolePermissions();
 const canDelete = currentUserRole === 'administrator';

 const getStatusColor = (status: string) => {
 switch (status) {
 case "active":
 return "bg-success/10 text-success";
 case "inactive":
 return "bg-muted text-muted-foreground";
 case "suspended":
 return "bg-destructive/10 text-destructive";
 default:
 return "bg-muted text-muted-foreground";
 }
 };

 const getTypeColor = (type: string) => {
 switch (type) {
 case "service":
 return "bg-secondary/10 text-secondary";
 case "supplier":
 return "bg-primary/10 text-primary";
 case "contractor":
 return "bg-warning/10 text-warning";
 case "consultant":
 return "bg-accent/10 text-accent-foreground";
 default:
 return "bg-muted text-muted-foreground";
 }
 };

 return (
 <Card
 className={`group relative h-full bg-card border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
 isSelected ? "border-primary bg-primary/5" : "border-border"
 }`}
 >
 <div className="p-5 flex items-start gap-4">
 {/* Selection checkbox - only show for administrators */}
 {canDelete && (
 <div className="mt-1 shrink-0">
 <Checkbox
 checked={isSelected}
 onCheckedChange={() => onToggleSelection(vendor.id)}
 />
 </div>
 )}

 <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
 <Building2 className="h-5 w-5 text-primary" />
 </div>

 <div className="min-w-0 flex-1">
 <Link to={`/vendors/${vendor.id}/edit`} className="block">
 <h3 className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors text-sm leading-tight">{vendor.name}</h3>
 </Link>

 {vendor.contact_person && (
 <p className="mt-0.5 text-xs text-muted-foreground">{vendor.contact_person}</p>
 )}

 <div className="mt-2 space-y-1">
 {vendor.email && (
 <div className="flex min-w-0 items-center text-muted-foreground gap-1">
 <Mail className="h-3 w-3 shrink-0" />
 <p className="min-w-0 break-all text-xs">{vendor.email}</p>
 </div>
 )}

 {vendor.phone && (
 <div className="flex min-w-0 items-center text-muted-foreground gap-1">
 <Phone className="h-3 w-3 shrink-0" />
 <p className="break-words text-xs">{vendor.phone}</p>
 </div>
 )}
 </div>

 <div className="mt-3 flex flex-wrap items-center gap-2">
 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(vendor.status)}`}>
 {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
 </span>
 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(vendor.vendor_type)}`}>
 {vendor.vendor_type.charAt(0).toUpperCase() + vendor.vendor_type.slice(1)}
 </span>
 </div>

 {vendor.rating && (
 <div className="mt-2 flex items-center gap-1">
 <div className="flex items-center">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`h-3 w-3 ${i < vendor.rating! ? "text-warning fill-current" : "text-muted-foreground"}`}
 />
 ))}
 </div>
 <span className="ml-1 text-xs text-muted-foreground">({vendor.rating}/5)</span>
 </div>
 )}
 </div>

 {/* Delete button - only show for admins */}
 {canDelete && (
 <div className="shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="ghost"
 size="sm"
 disabled={isDeleting}
 className="text-destructive hover:text-destructive hover:bg-destructive/10"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
 <AlertDialogDescription>
 Are you sure you want to delete "{vendor.name}"? This action cannot be undone and will also remove all associated contracts and relationships.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => onDeleteVendor(vendor.id)}
 disabled={isDeleting}
 className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
 );
};

export default VendorCard;
