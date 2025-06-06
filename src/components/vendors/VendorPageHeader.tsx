
import React from "react";
import { Link } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import VendorImportDialogEdgeFunction from "./VendorImportDialogEdgeFunction";
import { useUserRolePermissions } from "@/hooks/team/useUserRolePermissions";
import { useQueryClient } from "@tanstack/react-query";

const VendorPageHeader: React.FC = () => {
  const { currentUserRole } = useUserRolePermissions();
  const queryClient = useQueryClient();
  
  // Default to allowing add actions if role is not loaded yet
  const canAdd = !currentUserRole || currentUserRole === 'administrator' || currentUserRole === 'manager';

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["vendors"] });
  };

  return (
    <>
      <BackToDashboard />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendors</h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <VendorImportDialogEdgeFunction onImportComplete={handleImportComplete}>
            <Button variant="outline" className="whitespace-nowrap font-medium">
              <Upload className="mr-2 h-4 w-4" />
              Import Vendors (AI-Powered)
            </Button>
          </VendorImportDialogEdgeFunction>
          
          <Link to="/vendors/new">
            <Button className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default VendorPageHeader;
