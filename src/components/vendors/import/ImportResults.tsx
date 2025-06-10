
import React, { useState } from 'react';
import { VendorFormData } from '@/services/vendorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EditableVendorPreview from './EditableVendorPreview';

interface ImportResultsProps {
  vendors: VendorFormData[];
  onSave: (vendors: VendorFormData[]) => Promise<void>;
  expectedCount?: number;
}

const ImportResults: React.FC<ImportResultsProps> = ({
  vendors,
  onSave,
  expectedCount
}) => {
  const [editableVendors, setEditableVendors] = useState<VendorFormData[]>(vendors);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setEditableVendors(vendors);
  }, [vendors]);

  const handleSave = async () => {
    if (editableVendors.length === 0) {
      toast.error('No vendors to save');
      return;
    }

    // Validate that all vendors have at least a name
    const vendorsWithoutNames = editableVendors.filter(v => !v.name || v.name.trim().length === 0);
    if (vendorsWithoutNames.length > 0) {
      toast.error(`${vendorsWithoutNames.length} vendor(s) are missing company names`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editableVendors);
      toast.success(`Successfully imported ${editableVendors.length} vendor(s)`);
    } catch (error) {
      console.error('Error saving vendors:', error);
      toast.error('Failed to save vendors');
    } finally {
      setIsSaving(false);
    }
  };

  if (vendors.length === 0) {
    return null;
  }

  const qualityIssues = editableVendors.filter(v => !v.name || v.name.length < 3).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Import Results
              <Badge variant="secondary">{editableVendors.length} vendors</Badge>
              {qualityIssues > 0 && (
                <Badge variant="destructive">{qualityIssues} need attention</Badge>
              )}
            </CardTitle>
            {expectedCount && expectedCount !== editableVendors.length && (
              <p className="text-sm text-muted-foreground mt-1">
                Expected {expectedCount} vendors, found {editableVendors.length}
              </p>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || editableVendors.length === 0}
            className="ml-4"
          >
            {isSaving ? 'Saving...' : `Save ${editableVendors.length} Vendor${editableVendors.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EditableVendorPreview
          parsedData={editableVendors}
          onDataChange={setEditableVendors}
        />
      </CardContent>
    </Card>
  );
};

export default ImportResults;
