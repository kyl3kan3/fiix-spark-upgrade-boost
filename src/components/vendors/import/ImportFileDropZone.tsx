
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

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
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
      }`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        Drop your file here or click to browse
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Supports CSV and DOCX files - automatically processes with the best method for each format
      </p>
      <p className="text-xs text-gray-400 mb-4">
        CSV files are parsed directly, DOCX files use AI-powered extraction
      </p>
      
      <div className="flex items-center justify-center gap-3">
        <Button asChild>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".csv,.docx"
              onChange={onFileInput}
            />
            Choose File
          </label>
        </Button>
        
        <Button variant="outline" onClick={onDownloadTemplate}>
          <FileText className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>
    </div>
  );
};

export default ImportFileDropZone;
