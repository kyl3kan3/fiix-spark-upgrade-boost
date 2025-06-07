
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVendorImportEdgeFunction } from "@/hooks/vendors/useVendorImportEdgeFunction";
import { toast } from "sonner";
import ImportDialogHeader from "./import/ImportDialogHeader";
import ImportFileDropZone from "./import/ImportFileDropZone";
import ImportFilePreview from "./import/ImportFilePreview";
import EnhancedVendorPreview from "./import/EnhancedVendorPreview";
import { VendorFormData } from "@/services/vendorService";

interface VendorImportDialogEdgeFunctionProps {
  children: React.ReactNode;
  onImportComplete: () => void;
}

const VendorImportDialogEdgeFunction: React.FC<VendorImportDialogEdgeFunctionProps> = ({
  children,
  onImportComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editedData, setEditedData] = useState<VendorFormData[]>([]);
  const [processingWarnings, setProcessingWarnings] = useState<string[]>([]);
  const [overallConfidence, setOverallConfidence] = useState<number>(1.0);
  
  const {
    file,
    parsedData,
    isProcessing,
    isImporting,
    useImageParser,
    uploadFile,
    importVendors,
    clearFile,
    toggleImageParser,
    retryWithImageParser
  } = useVendorImportEdgeFunction();

  // Update edited data when parsed data changes
  React.useEffect(() => {
    setEditedData(parsedData);
    // Reset warnings and confidence when new data arrives
    setProcessingWarnings([]);
    setOverallConfidence(parsedData.length > 0 ? 0.85 : 1.0);
  }, [parsedData]);

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
    // Validate that all vendors have required fields
    const validVendors = editedData.filter(vendor => vendor.name.trim() !== "");
    
    if (validVendors.length === 0) {
      toast.error("Please ensure at least one vendor has a name");
      return;
    }

    if (validVendors.length !== editedData.length) {
      toast.warning(`${editedData.length - validVendors.length} vendors without names will be skipped`);
    }

    const success = await importVendors(validVendors);
    if (success) {
      setIsOpen(false);
      onImportComplete();
      toast.success(`Successfully imported ${validVendors.length} vendors`);
      setEditedData([]);
      setProcessingWarnings([]);
    }
  };

  const handleClearFile = () => {
    clearFile();
    setEditedData([]);
    setProcessingWarnings([]);
    setOverallConfidence(1.0);
  };

  const downloadTemplate = () => {
    // Simple template download functionality
    toast.info("Template download will be available in the next update");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <ImportDialogHeader
          useImageParser={useImageParser}
          onToggleImageParser={toggleImageParser}
        />

        <div className="space-y-4">
          {!file ? (
            <ImportFileDropZone
              dragActive={dragActive}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileInput={handleFileInput}
              onDownloadTemplate={downloadTemplate}
            />
          ) : (
            <>
              <ImportFilePreview
                file={file}
                isProcessing={isProcessing}
                parsedDataCount={editedData.length}
                onRetryWithImageParser={retryWithImageParser}
                onClearFile={handleClearFile}
              />
              {editedData.length > 0 && (
                <EnhancedVendorPreview
                  parsedData={editedData}
                  onDataChange={setEditedData}
                  processingWarnings={processingWarnings}
                  overallConfidence={overallConfidence}
                />
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {editedData.length > 0 && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : `Import ${editedData.filter(v => v.name.trim()).length} Vendors`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorImportDialogEdgeFunction;
