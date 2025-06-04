
import { useState } from "react";
import { toast } from "sonner";
import { type Vendor } from "@/services/vendorService";

export const useVendorSelection = () => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const handleVendorSelection = (vendorId: string, selected: boolean) => {
    setSelectedVendors(prev => 
      selected 
        ? [...prev, vendorId]
        : prev.filter(id => id !== vendorId)
    );
  };

  const handleSelectAll = (filteredVendors: Vendor[] | undefined) => {
    if (!filteredVendors) return;
    
    if (selectedVendors.length === filteredVendors.length) {
      // Deselect all
      setSelectedVendors([]);
    } else {
      // Select all filtered vendors
      setSelectedVendors(filteredVendors.map(v => v.id));
    }
  };

  const clearSelection = () => {
    setSelectedVendors([]);
  };

  const isAllSelected = (filteredVendors: Vendor[] | undefined) => {
    return filteredVendors && selectedVendors.length === filteredVendors.length && filteredVendors.length > 0;
  };

  return {
    selectedVendors,
    handleVendorSelection,
    handleSelectAll,
    clearSelection,
    isAllSelected,
    setSelectedVendors
  };
};
