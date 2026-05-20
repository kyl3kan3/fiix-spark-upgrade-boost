import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, ArrowRight } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistFrequencies } from "@/types/checklists";

const DueInspectionsWidget: React.FC = () => {
 const navigate = useNavigate();
 const { data: due = [], isLoading } = useQuery({
 queryKey: ["due-checklists"],
 queryFn: checklistService.getDueChecklists,
 refetchInterval: 5 * 60 * 1000, // refresh every 5 min
 });

 if (isLoading || due.length === 0) return null;

 return (
 <Card className="p-5 border-2 border-warning/40 bg-warning/5">
 <div className="flex items-start gap-3 mb-3">
 <div className="h-10 w-10 rounded-2xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
 <Bell className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <h3 className="font-display font-bold text-lg leading-tight">Inspections due</h3>
 <p className="text-sm text-muted-foreground">
 {due.length} {due.length === 1 ? "checklist needs" : "checklists need"} attention.
 </p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => navigate("/checklists/due")}
 className="shrink-0"
 >
 View all
 <ArrowRight className="h-4 w-4" />
 </Button>
 </div>

 <div className="space-y-2">
 {due.slice(0, 5).map((cl: any) => {
 const freq = ChecklistFrequencies.find((f) => f.value === cl.frequency)?.label || cl.frequency;
 return (
 <button
 key={cl.id}
 onClick={() => navigate(`/checklists/${cl.id}/submit`)}
 className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-secondary/40 transition-colors text-left"
 >
 <div className="flex-1 min-w-0">
 <div className="font-semibold truncate">{cl.name}</div>
 <div className="text-xs text-muted-foreground flex gap-2 items-center">
 <Badge variant="outline" className="text-[10px]">{freq}</Badge>
 {cl.asset_ids?.length > 0 && (
 <span>{cl.asset_ids.length} units</span>
 )}
 </div>
 </div>
 <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
 </button>
 );
 })}
 </div>
 </Card>
 );
};

export default DueInspectionsWidget;