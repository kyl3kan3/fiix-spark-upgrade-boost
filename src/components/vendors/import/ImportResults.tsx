
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    // Update the vendors state and then save
    onSave();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <ImportResultsHeader vendors={editableVendors} expectedCount={expectedCount} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImportResultsTabs 
            vendors={editableVendors}
            onDataChange={setEditableVendors}
          />
          
          <ImportSaveButton 
            vendorCount={editableVendors.length}
            onSave={handleSaveEditedVendors}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportResults;
