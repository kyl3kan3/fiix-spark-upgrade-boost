
import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { VendorImportData } from '@/services/vendorService';
import { ImportResultsHeader } from './results/ImportResultsHeader';
import { ImportResultsTabs } from './results/ImportResultsTabs';
import { ImportSaveButton } from './results/ImportSaveButton';

interface ImportResultsProps {
  vendors: VendorImportData[];
  onSave: () => void;
  expectedCount?: number;
}

const ImportResults: React.FC<ImportResultsProps> = ({ vendors, onSave, expectedCount }) => {
  const [editableVendors, setEditableVendors] = useState(vendors);

  React.useEffect(() => {
    setEditableVendors(vendors);
  }, [vendors]);

  if (vendors.length === 0) return null;

  const handleSaveEditedVendors = () => {
    onSave();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ListChecks className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-headline text-lg font-semibold text-foreground">Import Results</h2>
        </div>
        <ImportResultsHeader vendors={editableVendors} expectedCount={expectedCount} />

        <ImportResultsTabs
          vendors={editableVendors}
          onDataChange={setEditableVendors}
        />

        <ImportSaveButton
          vendorCount={editableVendors.length}
          onSave={handleSaveEditedVendors}
        />
      </div>
    </div>
  );
};

export default ImportResults;
