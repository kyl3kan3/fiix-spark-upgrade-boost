
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { createLocation, getAllLocations } from "@/services/locationService";

interface LocationImportExportProps {
  onImportComplete: () => void;
}

export const LocationImportExport: React.FC<LocationImportExportProps> = ({
  onImportComplete
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      let imported = 0;
      let errors = 0;

      for (const line of dataLines) {
        const [name, description, parentName] = line.split(',').map(item => item.trim().replace(/"/g, ''));
        
        if (!name) continue;

        try {
          // Find parent ID if parent name is provided
          let parentId = null;
          if (parentName) {
            const allLocations = await getAllLocations();
            const parentLocation = allLocations.find(loc => loc.name === parentName);
            if (parentLocation) {
              parentId = parentLocation.id;
            }
          }

          await createLocation({
            name,
            description: description || null,
            parent_id: parentId
          });
          imported++;
        } catch (error) {
          console.error(`Error importing location ${name}:`, error);
          errors++;
        }
      }

      toast.success(`Imported ${imported} locations${errors > 0 ? ` (${errors} errors)` : ''}`);
      onImportComplete();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import locations");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const locations = await getAllLocations();
      
      // Create CSV content
      const headers = ['Name', 'Description', 'Parent Name'];
      const csvContent = [
        headers.join(','),
        ...locations.map(location => {
          const parentName = location.parent_id 
            ? locations.find(loc => loc.id === location.parent_id)?.name || ''
            : '';
          
          return [
            `"${location.name}"`,
            `"${location.description || ''}"`,
            `"${parentName}"`
          ].join(',');
        })
      ].join('\n');

      // Download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `locations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Locations exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export locations");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Label htmlFor="import-file" className="text-sm font-medium">
          Import Locations
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="import-file"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isImporting}
            className="file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          CSV format: Name, Description, Parent Name
        </p>
      </div>

      <div className="flex-1">
        <Label className="text-sm font-medium">Export Locations</Label>
        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Download all locations as CSV
        </p>
      </div>
    </div>
  );
};
