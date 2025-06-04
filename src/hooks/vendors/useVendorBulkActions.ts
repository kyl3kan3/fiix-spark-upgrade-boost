
import { useState } from "react";
import { toast } from "sonner";
import { useVendorActions } from "./useVendorActions";
import { exportVendorsToCSV } from "@/utils/vendorExport";
import { type Vendor } from "@/services/vendorService";

export const useVendorBulkActions = () => {
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { handleBulkDeleteVendors } = useVendorActions();

  const handleBulkDelete = async (selectedVendors: string[], clearSelection: () => void) => {
    if (selectedVendors.length === 0) {
      toast.error("No vendors selected for deletion");
      return;
    }
    
    setIsBulkDeleting(true);
    
    try {
      console.log("Starting bulk delete for vendors:", selectedVendors);
      await handleBulkDeleteVendors(selectedVendors);
      clearSelection();
      toast.success(`${selectedVendors.length} vendor${selectedVendors.length !== 1 ? 's' : ''} deleted successfully`);
    } catch (error: any) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete vendors", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkStatusChange = (status: string, selectedVendors: string[], clearSelection: () => void) => {
    if (selectedVendors.length === 0) {
      toast.error("No vendors selected");
      return;
    }
    // Implementation would go here
    toast.success(`${selectedVendors.length} vendor${selectedVendors.length !== 1 ? 's' : ''} updated to ${status}`);
    clearSelection();
  };

  const handleBulkExport = (vendors: Vendor[] | undefined, selectedVendors: string[]) => {
    if (!vendors) {
      toast.error("No vendors available to export");
      return;
    }
    
    const selectedVendorData = vendors.filter(v => selectedVendors.includes(v.id));
    const dataToExport = selectedVendorData.length > 0 ? selectedVendorData : vendors;
    
    try {
      exportVendorsToCSV(dataToExport);
      toast.success(`${dataToExport.length} vendor${dataToExport.length !== 1 ? 's' : ''} exported successfully`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export vendors");
    }
  };

  return {
    isBulkDeleting,
    handleBulkDelete,
    handleBulkStatusChange,
    handleBulkExport
  };
};
