
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVendor } from '@/services/vendorService';
import { toast } from 'sonner';

export const useVendorCsvImport = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (vendorData: any[]) => {
      const results = await Promise.allSettled(
        vendorData.map(vendor => {
          // Map CSV data to vendor format
          const cleanVendor = {
            name: vendor.name || vendor.Name || '',
            email: vendor.email || vendor.Email || '',
            phone: vendor.phone || vendor.Phone || '',
            contact_person: vendor.contact_person || vendor['Contact Person'] || '',
            contact_title: vendor.contact_title || vendor['Contact Title'] || '',
            vendor_type: vendor.vendor_type || vendor['Vendor Type'] || 'service',
            status: vendor.status || vendor.Status || 'active',
            address: vendor.address || vendor.Address || '',
            city: vendor.city || vendor.City || '',
            state: vendor.state || vendor.State || '',
            zip_code: vendor.zip_code || vendor['Zip Code'] || vendor.zipcode || '',
            website: vendor.website || vendor.Website || '',
            description: vendor.description || vendor.Description || vendor.notes || vendor.Notes || '',
            rating: vendor.rating ? Number(vendor.rating) : null
          };
          return createVendor(cleanVendor);
        })
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: vendorData.length };
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (results.failed > 0) {
        toast.warning(`Import completed with ${results.failed} failures`, {
          description: `${results.successful}/${results.total} vendors imported successfully`
        });
      } else {
        toast.success(`Successfully imported ${results.successful} vendors`);
      }
      setVendors([]);
    },
    onError: (error: any) => {
      console.error("Error importing vendors:", error);
      toast.error("Failed to import vendors", {
        description: error.message || "An unexpected error occurred"
      });
    }
  });

  const handleVendorsUploaded = (uploadedVendors: any[]) => {
    setVendors(uploadedVendors);
  };

  const importVendors = async () => {
    if (vendors.length === 0) {
      toast.error("No vendor data to import");
      return;
    }

    await importMutation.mutateAsync(vendors);
  };

  const clearVendors = () => {
    setVendors([]);
  };

  return {
    vendors,
    isImporting: importMutation.isPending,
    handleVendorsUploaded,
    importVendors,
    clearVendors
  };
};
