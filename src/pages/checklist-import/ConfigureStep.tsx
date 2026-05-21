import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { NONE } from "./types";

interface ConfigureStepProps {
  fileName: string;
  workbook: XLSX.WorkBook;
  sheetName: string;
  columns: string[];
  rowCount: number;
  titleCol: string;
  descCol: string;
  reqCol: string;
  onSheetChange: (sheet: string) => void;
  onTitleColChange: (col: string) => void;
  onDescColChange: (col: string) => void;
  onReqColChange: (col: string) => void;
  onReset: () => void;
  onPreview: () => void;
}

export const ConfigureStep: React.FC<ConfigureStepProps> = ({
  fileName,
  workbook,
  sheetName,
  columns,
  rowCount,
  titleCol,
  descCol,
  reqCol,
  onSheetChange,
  onTitleColChange,
  onDescColChange,
  onReqColChange,
  onReset,
  onPreview,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Map Columns</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">From <span className="font-medium">{fileName}</span></p>
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}><X className="mr-1 h-4 w-4" /> Change file</Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {workbook.SheetNames.length > 1 && (
        <div className="space-y-2">
          <Label>Sheet</Label>
          <Select value={sheetName} onValueChange={onSheetChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {workbook.SheetNames.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Title column *</Label>
          <Select value={titleCol} onValueChange={onTitleColChange}>
            <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>
              {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Description column</Label>
          <Select value={descCol} onValueChange={onDescColChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— None —</SelectItem>
              {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Required column</Label>
          <Select value={reqCol} onValueChange={onReqColChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— None —</SelectItem>
              {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {rowCount} row(s) detected in sheet "{sheetName}".
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onReset}>Back</Button>
        <Button onClick={onPreview}>Preview Items</Button>
      </div>
    </CardContent>
  </Card>
);
