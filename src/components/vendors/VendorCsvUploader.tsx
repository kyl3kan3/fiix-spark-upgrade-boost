
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { parseCSVFile } from '@/hooks/vendors/parsers/csvParser';

interface VendorCsvUploaderProps {
  onVendors: (vendors: any[]) => void;
}

export default function VendorCsvUploader({ onVendors }: VendorCsvUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setLoading(true);

    try {
      const data = await parseCSVFile(file);
      if (data.length > 0) {
        toast.success(`Parsed ${data.length} vendors from CSV`);
        onVendors(data);
      } else {
        toast.warning('No data found in CSV file');
      }
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error('CSV parsing error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Vendor CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
            id="csv-upload"
            disabled={loading}
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {loading ? 'Parsing CSV...' : 'Click to upload CSV file'}
            </span>
            <span className="text-xs text-gray-400">
              Expected columns: name, address, phone, email, notes
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
