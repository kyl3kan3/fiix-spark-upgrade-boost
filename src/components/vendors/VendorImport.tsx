
import React, { useState } from 'react';
import { useVendorImport } from './import/hooks/useVendorImport';
import ImportFileInput from './import/ImportFileInput';
import ImportStatus from './import/ImportStatus';
import ImportResults from './import/ImportResults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VendorImport: React.FC = () => {
  const [expectedCount, setExpectedCount] = useState<number | undefined>();
  const { vendors, loading, error, handleFile, saveToSupabase } = useVendorImport();

  const handleFileWithCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e, expectedCount);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expected-count">Expected number of vendors (optional)</Label>
            <Input
              id="expected-count"
              type="number"
              min="1"
              placeholder="e.g., 5"
              value={expectedCount || ''}
              onChange={(e) => setExpectedCount(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-48"
            />
            <p className="text-sm text-muted-foreground">
              Helps the parser better understand how to split your document
            </p>
          </div>
          <ImportFileInput onChange={handleFileWithCount} />
        </CardContent>
      </Card>
      
      <ImportStatus loading={loading} error={error} />
      <ImportResults vendors={vendors} onSave={saveToSupabase} expectedCount={expectedCount} />
    </div>
  );
};

export default VendorImport;
