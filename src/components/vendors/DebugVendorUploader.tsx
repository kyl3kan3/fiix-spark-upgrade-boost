
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { debugParseVendorsFromFile, ParseResult } from '@/utils/debugVendorParser';
import { toast } from 'sonner';

export const DebugVendorUploader: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      console.log('[Debug Uploader] Starting file processing:', file.name);
      const parseResult = await debugParseVendorsFromFile(file);
      setResult(parseResult);
      
      if (parseResult.success) {
        toast.success(`Successfully parsed ${parseResult.vendors?.length || 0} vendors`);
      } else {
        toast.error(`Parsing failed: ${parseResult.error}`);
      }
    } catch (error) {
      console.error('[Debug Uploader] Unexpected error:', error);
      const errorResult: ParseResult = {
        success: false,
        error: `Unexpected error: ${error.message}`,
        debugInfo: { step: 'uploader_error', details: error }
      };
      setResult(errorResult);
      toast.error('File processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Debug Vendor Document Parser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-600">Processing document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Upload a vendor document</p>
                  <p className="text-gray-500">Supports DOCX files (PDF debugging coming soon)</p>
                </div>
                <Input
                  type="file"
                  accept=".docx"
                  onChange={handleFileInput}
                  className="max-w-xs"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Debug Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Status:</h4>
              <p className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </p>
              {result.error && (
                <p className="text-red-600 mt-2">Error: {result.error}</p>
              )}
            </div>

            {result.debugInfo && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Debug Info:</h4>
                <p><strong>Step:</strong> {result.debugInfo.step}</p>
                <div className="mt-2">
                  <strong>Details:</strong>
                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(result.debugInfo.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {result.vendors && result.vendors.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Extracted Vendors ({result.vendors.length}):</h4>
                <div className="space-y-2">
                  {result.vendors.map((vendor, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p><strong>Name:</strong> {vendor.name}</p>
                      <p><strong>Phone:</strong> {vendor.phone || 'Not found'}</p>
                      <p><strong>Email:</strong> {vendor.email || 'Not found'}</p>
                      <p><strong>Address:</strong> {vendor.address || 'Not found'}</p>
                      <p><strong>Website:</strong> {vendor.website || 'Not found'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
