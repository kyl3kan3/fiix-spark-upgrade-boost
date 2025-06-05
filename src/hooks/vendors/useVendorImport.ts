
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, VendorFormData } from "@/services/vendorService";
import { toast } from "sonner";

interface ParsedVendor extends VendorFormData {
  // Additional fields for validation
}

export const useVendorImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (vendors: ParsedVendor[]) => {
      const results = await Promise.allSettled(
        vendors.map(vendor => createVendor(vendor))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: vendors.length };
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (results.failed > 0) {
        toast.warning(`Import completed with ${results.failed} failures`, {
          description: `${results.successful}/${results.total} vendors imported successfully`
        });
      }
    },
    onError: (error: any) => {
      console.error("Error importing vendors:", error);
      toast.error("Failed to import vendors", {
        description: error.message || "An unexpected error occurred"
      });
    }
  });

  const uploadFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      let parsedVendors: ParsedVendor[] = [];

      switch (fileExtension) {
        case 'csv':
          parsedVendors = await parseCSV(selectedFile);
          break;
        case 'xlsx':
        case 'xls':
          parsedVendors = await parseExcel(selectedFile);
          break;
        case 'pdf':
          parsedVendors = await parsePDF(selectedFile);
          break;
        case 'doc':
        case 'docx':
          parsedVendors = await parseWord(selectedFile);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      setParsedData(parsedVendors);
      toast.success(`Successfully parsed ${parsedVendors.length} vendors`);
    } catch (error: any) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file", {
        description: error.message || "Please check the file format and try again"
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = async (file: File): Promise<ParsedVendor[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must contain headers and at least one data row');
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const vendors: ParsedVendor[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const vendor: any = {};

            headers.forEach((header, index) => {
              const value = values[index] || '';
              switch (header) {
                case 'name':
                  vendor.name = value;
                  break;
                case 'email':
                  vendor.email = value;
                  break;
                case 'phone':
                  vendor.phone = value;
                  break;
                case 'contact_person':
                case 'contact person':
                  vendor.contact_person = value;
                  break;
                case 'vendor_type':
                case 'type':
                  vendor.vendor_type = value || 'service';
                  break;
                case 'status':
                  vendor.status = value || 'active';
                  break;
                case 'address':
                  vendor.address = value;
                  break;
                case 'city':
                  vendor.city = value;
                  break;
                case 'state':
                  vendor.state = value;
                  break;
                case 'zip_code':
                case 'zip':
                  vendor.zip_code = value;
                  break;
                case 'website':
                  vendor.website = value;
                  break;
                case 'description':
                  vendor.description = value;
                  break;
              }
            });

            if (vendor.name) {
              vendors.push(vendor);
            }
          }

          resolve(vendors);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  const parseExcel = async (file: File): Promise<ParsedVendor[]> => {
    // For now, we'll treat Excel files as CSV after conversion
    // In a real implementation, you'd use a library like xlsx
    throw new Error('Excel import will be available in the next update. Please use CSV format for now.');
  };

  const parsePDF = async (file: File): Promise<ParsedVendor[]> => {
    // For now, we'll provide a basic implementation
    // In a real implementation, you'd use a PDF parsing library
    throw new Error('PDF import will be available in the next update. Please use CSV format for now.');
  };

  const parseWord = async (file: File): Promise<ParsedVendor[]> => {
    // For now, we'll provide a basic implementation
    // In a real implementation, you'd use a Word parsing library
    throw new Error('Word document import will be available in the next update. Please use CSV format for now.');
  };

  const importVendors = async (): Promise<boolean> => {
    if (parsedData.length === 0) {
      toast.error("No vendor data to import");
      return false;
    }

    try {
      await importMutation.mutateAsync(parsedData);
      clearFile();
      return true;
    } catch (error) {
      return false;
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'email',
      'phone',
      'contact_person',
      'vendor_type',
      'status',
      'address',
      'city',
      'state',
      'zip_code',
      'website',
      'description'
    ];

    const sampleData = [
      'ABC Services',
      'contact@abcservices.com',
      '555-0123',
      'John Smith',
      'service',
      'active',
      '123 Main St',
      'New York',
      'NY',
      '10001',
      'https://abcservices.com',
      'Professional maintenance services'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendor-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
  };

  return {
    file,
    parsedData,
    isProcessing,
    isImporting: importMutation.isPending,
    uploadFile,
    importVendors,
    downloadTemplate,
    clearFile
  };
};
