
import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useVendorImport } from "@/hooks/vendors/useVendorImport";

const VendorImportDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    importFile, 
    isProcessing, 
    progress, 
    results, 
    resetImport,
    error 
  } = useVendorImport();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importFile(file);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetImport();
  };

  const acceptedTypes = ".csv,.pdf,.doc,.docx";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Vendors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Vendors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!results && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vendor-file">Choose File</Label>
                <Input
                  id="vendor-file"
                  type="file"
                  accept={acceptedTypes}
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                <p className="text-sm text-gray-500">
                  Supported formats: CSV, PDF, Word documents (.doc, .docx)
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected CSV Format</h4>
                      <p className="text-sm text-gray-600">
                        Name, Email, Phone, Address, City, State, ZIP, Contact Person, Contact Title, Website, Description, Vendor Type, Status, Rating
                      </p>
                      <p className="text-xs text-gray-500">
                        For PDF/Word documents, we'll extract vendor information automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 animate-pulse" />
                <span>Processing file...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed! {results.successful} vendors imported successfully.
                  {results.failed > 0 && ` ${results.failed} failed to import.`}
                </AlertDescription>
              </Alert>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Import Errors:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorImportDialog;
