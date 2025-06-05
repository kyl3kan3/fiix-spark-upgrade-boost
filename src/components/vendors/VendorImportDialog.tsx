import React, { useState } from "react";
import { Upload, FileText, File, Download, Eye, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVendorImport } from "@/hooks/vendors/useVendorImport";
import { toast } from "sonner";

interface VendorImportDialogProps {
  children: React.ReactNode;
  onImportComplete: () => void;
}

const VendorImportDialog: React.FC<VendorImportDialogProps> = ({
  children,
  onImportComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    file,
    parsedData,
    isProcessing,
    isImporting,
    useImageParser,
    uploadFile,
    importVendors,
    downloadTemplate,
    clearFile,
    toggleImageParser,
    retryWithImageParser
  } = useVendorImport();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    const success = await importVendors();
    if (success) {
      setIsOpen(false);
      onImportComplete();
      toast.success(`Successfully imported ${parsedData.length} vendors`);
    }
  };

  const getSupportedFormats = () => {
    return ".csv,.xlsx,.xls,.pdf,.doc,.docx";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Vendors</DialogTitle>
          <DialogDescription>
            Upload a CSV, Excel, PDF, Word document, or image containing vendor information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <>
              {/* AI Vision Parser Toggle */}
              <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Eye className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <Label htmlFor="image-parser" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Use AI Vision Parser
                  </Label>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Better for complex layouts, tables, or image documents
                  </p>
                </div>
                <Switch
                  id="image-parser"
                  checked={useImageParser}
                  onCheckedChange={toggleImageParser}
                />
              </div>

              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Supports CSV, Excel (.xlsx, .xls), PDF, Word (.doc, .docx), and image files
                </p>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept={getSupportedFormats() + ",.png,.jpg,.jpeg,.gif,.bmp,.tiff"}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                >
                  Choose File
                </label>
              </div>

              {/* Template Download */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {getFileIcon(file.name)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  {parsedData.length === 0 && !isProcessing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryWithImageParser}
                      className="flex items-center gap-1"
                    >
                      <Repeat className="h-3 w-3" />
                      Try AI Vision
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFile}
                    disabled={isProcessing}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {useImageParser ? 'Processing with AI Vision...' : 'Processing file...'}
                  </p>
                </div>
              )}

              {/* Preview Results */}
              {parsedData.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview ({parsedData.length} vendors found)</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((vendor, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{vendor.name}</td>
                            <td className="p-2">{vendor.email}</td>
                            <td className="p-2">{vendor.vendor_type}</td>
                            <td className="p-2">{vendor.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 5 && (
                      <p className="text-center text-gray-500 py-2">
                        ... and {parsedData.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {parsedData.length > 0 && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : `Import ${parsedData.length} Vendors`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorImportDialog;
