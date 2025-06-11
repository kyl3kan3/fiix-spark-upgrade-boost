
import React, { useState } from 'react';
import { useVendorImport } from './import/hooks/useVendorImport';
import ImportFileInput from './import/ImportFileInput';
import ImportStatus from './import/ImportStatus';
import ImportResults from './import/ImportResults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const VendorImport: React.FC = () => {
  const [expectedCount, setExpectedCount] = useState<number | undefined>();
  const [importInstructions, setImportInstructions] = useState('');
  const [fileKey, setFileKey] = useState(Date.now()); // Force re-render of file input
  const { vendors, loading, error, handleFile, saveToSupabase, clearResults } = useVendorImport();

  const handleFileWithContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear previous results immediately when new file is selected
    console.log('🔄 NEW FILE SELECTED - Clearing previous results');
    clearResults();
    
    // Add timestamp to ensure fresh processing
    const timestamp = Date.now();
    console.log('⏰ Processing timestamp:', timestamp);
    
    handleFile(e, expectedCount, importInstructions, timestamp);
  };

  const handleClearFile = () => {
    console.log('🧹 CLEARING FILE INPUT AND RESULTS');
    clearResults();
    setFileKey(Date.now()); // Force file input to reset
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
              
              <div className="space-y-2">
                <Label htmlFor="import-instructions">Import Instructions (optional)</Label>
                <Textarea
                  id="import-instructions"
                  placeholder="Describe the document format, vendor organization, or any special parsing instructions..."
                  value={importInstructions}
                  onChange={(e) => setImportInstructions(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Provide context about your document structure to improve parsing accuracy
                </p>
              </div>
              
              <ImportFileInput 
                key={fileKey} 
                onChange={handleFileWithContext} 
                onClear={handleClearFile}
                loading={loading}
              />
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
