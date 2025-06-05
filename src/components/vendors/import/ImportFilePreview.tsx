
import React from "react";
import { FileText, File, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportFilePreviewProps {
  file: File;
  isProcessing: boolean;
  parsedDataCount: number;
  onRetryWithImageParser: () => void;
  onClearFile: () => void;
}

const ImportFilePreview: React.FC<ImportFilePreviewProps> = ({
  file,
  isProcessing,
  parsedDataCount,
  onRetryWithImageParser,
  onClearFile,
}) => {
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
          {parsedDataCount === 0 && !isProcessing && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetryWithImageParser}
              className="flex items-center gap-1"
            >
              <Repeat className="h-3 w-3" />
              Try AI Vision
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFile}
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
            Processing file...
          </p>
        </div>
      )}
    </div>
  );
};

export default ImportFilePreview;
