import React, { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFrequencyLabel, getPriorityColor, type ScheduleTemplate } from "./types";

interface TemplateDetailProps {
  template: ScheduleTemplate;
  onDelete: () => void;
  onAddTask: (task: string) => void;
  onDeleteTask: (index: number) => void;
}

export const TemplateDetail: React.FC<TemplateDetailProps> = ({
  template,
  onDelete,
  onAddTask,
  onDeleteTask,
}) => {
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{getFrequencyLabel(template.frequency)}</Badge>
            <Badge className={getPriorityColor(template.priority)}>
              {template.priority} priority
            </Badge>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium">Tasks Checklist</h3>

          {template.tasks.length > 0 ? (
            <ul className="space-y-2">
              {template.tasks.map((task, index) => (
                <li key={index} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                      <Check className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span>{task}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteTask(index)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
              <p>No tasks added to this template yet</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4">
            <Input
              placeholder="Add a new task to this checklist"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button onClick={handleAdd} disabled={!newTask.trim()}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
