
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, FileText } from "lucide-react";

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
        Upload CSV, DOCX, PDF, images, or other document formats to extract vendor information using AI
      </DialogDescription>
      
      <div className="flex items-center space-x-2 pt-4">
        <Switch
          id="image-parser"
          checked={useImageParser}
          onCheckedChange={onToggleImageParser}
        />
        <Label htmlFor="image-parser" className="flex items-center gap-2">
          {useImageParser ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          Use AI Vision for DOCX files
          <span className="text-xs text-gray-500">
            (Better for documents with logos/images • PDF/images always use AI Vision)
          </span>
        </Label>
      </div>
    </DialogHeader>
  );
};

export default ImportDialogHeader;
