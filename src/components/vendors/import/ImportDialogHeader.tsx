
import React from "react";
import { Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportDialogHeaderProps {
  useImageParser: boolean;
  onToggleImageParser: () => void;
}

const ImportDialogHeader: React.FC<ImportDialogHeaderProps> = ({
  useImageParser,
  onToggleImageParser,
}) => {
  return (
    <DialogHeader>
      <DialogTitle>Import Vendors</DialogTitle>
      <DialogDescription>
        Upload a CSV, Excel, PDF, Word document, or image containing vendor information
      </DialogDescription>
      
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
          onCheckedChange={onToggleImageParser}
        />
      </div>
    </DialogHeader>
  );
};

export default ImportDialogHeader;
