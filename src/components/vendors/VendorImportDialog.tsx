
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import VendorCsvUploader from './VendorCsvUploader';
import VendorCsvTable from './VendorCsvTable';
import { useVendorCsvImport } from '@/hooks/vendors/useVendorCsvImport';

interface VendorImportDialogProps {
  children: React.ReactNode;
}

export default function VendorImportDialog({ children }: VendorImportDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    vendors,
    isImporting,
    handleVendorsUploaded,
    importVendors,
    clearVendors
  } = useVendorCsvImport();

  const handleImport = async () => {
    await importVendors();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Vendors from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <VendorCsvUploader onVendors={handleVendorsUploaded} />
          
          {vendors.length > 0 && (
            <>
              <VendorCsvTable vendors={vendors} />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={clearVendors}
                  disabled={isImporting}
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? 'Importing...' : `Import ${vendors.length} Vendors`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
