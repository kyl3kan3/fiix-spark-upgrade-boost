
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVendorImport } from "@/hooks/vendors/useVendorImport";
import { toast } from "sonner";
import ImportDialogHeader from "./import/ImportDialogHeader";
import ImportFileDropZone from "./import/ImportFileDropZone";
import ImportFilePreview from "./import/ImportFilePreview";
import ImportDataPreview from "./import/ImportDataPreview";

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
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
                parsedDataCount={parsedData.length}
                onRetryWithImageParser={retryWithImageParser}
                onClearFile={clearFile}
              />
              <ImportDataPreview parsedData={parsedData} />
            </>
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
