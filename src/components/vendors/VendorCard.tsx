
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
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "supplier":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "contractor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      case "consultant":
        return "bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all h-full bg-white dark:bg-gray-800 border relative group ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start">
        {/* Selection checkbox - only show for administrators */}
        {canDelete && (
          <div className="mr-3 mt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(vendor.id)}
            />
          </div>
        )}
        
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-grow">
          <Link to={`/vendors/edit/${vendor.id}`} className="block">
            <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{vendor.name}</h3>
          </Link>
          
          {vendor.contact_person && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vendor.contact_person}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            {vendor.email && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Mail className="h-3 w-3 mr-1" />
                <p className="text-xs truncate">{vendor.email}</p>
              </div>
            )}
          </div>
          
          {vendor.phone && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
              <Phone className="h-3 w-3 mr-1" />
              <p className="text-xs">{vendor.phone}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`text-xs font-medium ${getStatusColor(vendor.status)}`}>
              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
            </Badge>
            <Badge className={`text-xs font-medium ${getTypeColor(vendor.vendor_type)}`}>
              {vendor.vendor_type.charAt(0).toUpperCase() + vendor.vendor_type.slice(1)}
            </Badge>
          </div>
          
          {vendor.rating && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < vendor.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({vendor.rating}/5)</span>
            </div>
          )}
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
  );
};

export default VendorCard;
