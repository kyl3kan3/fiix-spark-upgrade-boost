
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { VendorImportData } from '@/services/vendorService';

interface ImportResultsHeaderProps {
  vendors: VendorImportData[];
  expectedCount?: number;
}

export const ImportResultsHeader: React.FC<ImportResultsHeaderProps> = ({
  vendors,
  expectedCount,
}) => {
  // Check if count differs significantly from expected
  const showCountWarning = expectedCount && vendors.length > 0 && 
    Math.abs(vendors.length - expectedCount) > Math.max(1, expectedCount * 0.3);

  return (
    <div className="space-y-4">
      {showCountWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {vendors.length} vendors but expected {expectedCount}. 
            You may want to adjust your file format or expected count.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <span>Import Results</span>
        <div className="flex items-center gap-2">
          {expectedCount && (
            <Badge variant="outline">
              Expected: {expectedCount}
            </Badge>
          )}
          <Badge variant="secondary">{vendors.length} vendors found</Badge>
        </div>
      </div>
    </div>
  );
};
