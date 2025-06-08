
import React, { useState } from 'react';
import { useVendorImport } from './import/hooks/useVendorImport';
import ImportFileInput from './import/ImportFileInput';
import ImportStatus from './import/ImportStatus';
import ImportResults from './import/ImportResults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const VendorImport: React.FC = () => {
  const [expectedCount, setExpectedCount] = useState<number | undefined>();
  const { vendors, loading, error, handleFile, saveToSupabase } = useVendorImport();

  const handleFileWithCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e, expectedCount);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ScrollArea className="h-[calc(100vh-200px)] w-full">
        <div className="space-y-4 p-1">
          <Card className="w-full">
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
                  className="w-full max-w-48"
                />
                <p className="text-sm text-muted-foreground">
                  Helps the parser better understand how to split your document
                </p>
              </div>
              <ImportFileInput onChange={handleFileWithCount} />
            </CardContent>
          </Card>
          
          <ImportStatus loading={loading} error={error} />
          <div className="w-full">
            <ImportResults vendors={vendors} onSave={saveToSupabase} expectedCount={expectedCount} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default VendorImport;
