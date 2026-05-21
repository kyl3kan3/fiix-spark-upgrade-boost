import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadExcelTemplate, downloadWordTemplate } from "./fileTemplates";

interface UploadStepProps {
  parsing: boolean;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  onFiles: (files: File[]) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  parsing,
  dragActive,
  setDragActive,
  onFiles,
}) => {
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upload File</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
            <Download className="mr-2 h-4 w-4" /> Excel template
          </Button>
          <Button variant="outline" size="sm" onClick={downloadWordTemplate}>
            <Download className="mr-2 h-4 w-4" /> Word template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor="file-input"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors text-center",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
            parsing && "pointer-events-none opacity-70",
          )}
        >
          <Upload className={cn("h-10 w-10", dragActive ? "text-primary" : "text-muted-foreground")} />
          <div className="space-y-1">
            <p className="font-medium">
              {parsing ? "Parsing files..." : dragActive ? "Drop to upload" : "Drag & drop one or more files, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls, .csv) or Word (.docx) — multiple files will be merged</p>
          </div>
          <Input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv,.docx"
            multiple
            className="hidden"
            disabled={parsing}
            onChange={(e) => {
              const fs = Array.from(e.target.files || []);
              if (fs.length) onFiles(fs);
              e.target.value = "";
            }}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Excel format</AlertTitle>
            <AlertDescription>
              First row should be column headers. Recommended columns: <strong>Title</strong>, <strong>Description</strong>, <strong>Required</strong> (yes/no).
            </AlertDescription>
          </Alert>
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>Word format</AlertTitle>
            <AlertDescription>
              Each non-empty line becomes one item. Bullets and numbering (1., -, *, •) are stripped automatically.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
