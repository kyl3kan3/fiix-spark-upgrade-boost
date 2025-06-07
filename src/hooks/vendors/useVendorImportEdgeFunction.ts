
import { useState } from "react";
import { ParsedVendor } from "./import/types";
import { useFileUploadHandler } from "./import/useFileUploadHandler";
import { useVendorImporter } from "./import/useVendorImporter";

export const useVendorImportEdgeFunction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendor[]>([]);
  const [useImageParser, setUseImageParser] = useState(false);
  
  const { uploadFile, isProcessing } = useFileUploadHandler();
  const { importVendors, isImporting } = useVendorImporter();

  const handleUploadFile = async (selectedFile: File, forceImageParser: boolean = false) => {
    await uploadFile(selectedFile, forceImageParser, useImageParser, setParsedData, setFile);
  };

  const handleImportVendors = async (customVendors?: ParsedVendor[]): Promise<boolean> => {
    const vendorsToImport = customVendors || parsedData;
    const success = await importVendors(vendorsToImport);
    if (success) {
      clearFile();
    }
    return success;
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
  };

  const toggleImageParser = () => {
    setUseImageParser(!useImageParser);
  };

  const retryWithImageParser = async () => {
    if (file) {
      await handleUploadFile(file, true);
    }
  };

  return {
    file,
    parsedData,
    isProcessing,
    isImporting,
    useImageParser,
    uploadFile: handleUploadFile,
    importVendors: handleImportVendors,
    clearFile,
    toggleImageParser,
    retryWithImageParser
  };
};
