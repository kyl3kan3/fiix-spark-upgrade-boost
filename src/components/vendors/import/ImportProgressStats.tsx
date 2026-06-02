
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText, Users } from "lucide-react";

interface ImportProgressStatsProps {
 totalLines?: number;
 blocksFound?: number; 
 vendorsExtracted: number;
 lowConfidenceCount?: number;
 overallConfidence?: number;
 warningsCount?: number;
}

const ImportProgressStats: React.FC<ImportProgressStatsProps> = ({
 totalLines = 0,
 blocksFound = 0,
 vendorsExtracted,
 lowConfidenceCount = 0,
 overallConfidence = 1.0,
 warningsCount = 0
}) => {
 const confidencePercentage = Math.round(overallConfidence * 100);
 
 return (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
 <div className="flex items-center gap-2">
 <FileText className="h-4 w-4 text-primary" />
 <div>
 <p className="text-sm font-medium">{totalLines}</p>
 <p className="text-xs text-muted-foreground">Lines Processed</p>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4 text-success" />
 <div>
 <p className="text-sm font-medium">{vendorsExtracted}</p>
 <p className="text-xs text-muted-foreground">Vendors Found</p>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <CheckCircle className="h-4 w-4 text-success" />
 <div>
 <p className="text-sm font-medium">{confidencePercentage}%</p>
 <p className="text-xs text-muted-foreground">Confidence</p>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <AlertTriangle className="h-4 w-4 text-warning" />
 <div>
 <p className="text-sm font-medium">{warningsCount}</p>
 <p className="text-xs text-muted-foreground">Warnings</p>
 </div>
 </div>
 </div>
 );
};

export default ImportProgressStats;
