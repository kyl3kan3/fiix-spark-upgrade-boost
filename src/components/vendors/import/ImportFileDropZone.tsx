
import React from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportFileDropZoneProps {
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

const ImportFileDropZone: React.FC<ImportFileDropZoneProps> = ({
  dragActive,
  onDrag,
  onDrop,
  onFileInput,
  onDownloadTemplate,
}) => {
  const getSupportedFormats = () => {
    return ".csv,.xlsx,.xls,.pdf,.doc,.docx";
  };

  return (
    <>
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
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
          onChange={onFileInput}
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
          onClick={onDownloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
      </div>
    </>
  );
};

export default ImportFileDropZone;
