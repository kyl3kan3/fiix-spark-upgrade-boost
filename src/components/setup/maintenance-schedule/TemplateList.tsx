import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getFrequencyLabel, getPriorityColor, type ScheduleTemplate } from "./types";

interface Props {
  templates: ScheduleTemplate[];
  selectedId: string | null;
  onSelect: (template: ScheduleTemplate) => void;
}

export const TemplateList: React.FC<Props> = ({ templates, selectedId, onSelect }) => (
  <div className="space-y-2">
    {templates.map((schedule) => (
      <div
        key={schedule.id}
        className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${selectedId === schedule.id ? "border-maintenease-600 bg-maintenease-50" : ""}`}
        onClick={() => onSelect(schedule)}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{schedule.name}</h4>
          <Badge className={getPriorityColor(schedule.priority)}>{schedule.priority}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{getFrequencyLabel(schedule.frequency)}</span>
        </div>
      </div>
    ))}
  </div>
);
