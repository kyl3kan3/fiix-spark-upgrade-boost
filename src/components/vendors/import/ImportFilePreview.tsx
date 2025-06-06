
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, X, RefreshCw, Eye } from "lucide-react";

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
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {isProcessing && (
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Processing...
                </p>
              )}
              {!isProcessing && parsedDataCount > 0 && (
                <p className="text-sm text-green-600">
                  Found {parsedDataCount} vendors
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isProcessing && parsedDataCount === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryWithImageParser}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Retry with AI Vision
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFile}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportFilePreview;
