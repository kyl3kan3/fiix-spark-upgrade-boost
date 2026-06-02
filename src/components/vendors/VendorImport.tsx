
import React, { useState } from 'react';
import { useVendorImport } from './import/hooks/useVendorImport';
import ImportFileInput from './import/ImportFileInput';
import ImportStatus from './import/ImportStatus';
import ImportResults from './import/ImportResults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings2 } from 'lucide-react';
import { logger } from "@/lib/logger";

const VendorImport: React.FC = () => {
  const [expectedCount, setExpectedCount] = useState<number | undefined>();
  const [importInstructions, setImportInstructions] = useState('');
  const [fileKey, setFileKey] = useState(Date.now());
  const { vendors, loading, error, handleFile, saveToSupabase, clearResults } = useVendorImport();

  const handleFileWithContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.log('NEW FILE SELECTED - Clearing previous results');
    clearResults();
    const timestamp = Date.now();
    logger.log('Processing timestamp:', timestamp);
    handleFile(e, expectedCount, importInstructions, timestamp);
  };

  const handleClearFile = () => {
    logger.log('CLEARING FILE INPUT AND RESULTS');
    clearResults();
    setFileKey(Date.now());
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ScrollArea className="h-[calc(100vh-200px)] w-full">
        <div className="space-y-4 p-1">
          {/* Configuration card */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 w-full space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Settings2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-headline text-lg font-semibold text-foreground">Import Configuration</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-count" className="text-sm font-semibold text-muted-foreground">
                Expected number of vendors (optional)
              </Label>
              <Input
                id="expected-count"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={expectedCount || ''}
                onChange={(e) => setExpectedCount(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full max-w-48 bg-muted/30 border-border/60 focus-visible:ring-primary/30"
              />
              <p className="text-sm text-muted-foreground">
                Helps the parser better understand how to split your document
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-instructions" className="text-sm font-semibold text-muted-foreground">
                Import Instructions (optional)
              </Label>
              <Textarea
                id="import-instructions"
                placeholder="Describe the document format, vendor organization, or any special parsing instructions..."
                value={importInstructions}
                onChange={(e) => setImportInstructions(e.target.value)}
                className="min-h-[100px] resize-none bg-muted/30 border-border/60 focus-visible:ring-primary/30"
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
          </div>

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
