
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Upload, RefreshCw } from 'lucide-react';

interface ImportFileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  loading?: boolean;
}

const ImportFileInput: React.FC<ImportFileInputProps> = ({ onChange, onClear, loading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files?.[0]?.name || 'No file');
    onChange(e);
  };

  const handleClear = () => {
    console.log('🗑️ Clearing file input');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,.docx,.pdf"
            onChange={handleChange}
            className="mb-0"
            disabled={loading}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          )}
        </div>
        {onClear && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      
      {loading && (
        <div className="text-sm text-blue-600 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Processing file... This may take a moment for large PDFs.
        </div>
      )}
    </div>
  );
};

export default ImportFileInput;
