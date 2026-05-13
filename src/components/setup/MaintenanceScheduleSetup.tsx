import React, { useState } from "react";
import { Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewTemplateDialog } from "./maintenance-schedule/NewTemplateDialog";
import { TemplateDetail } from "./maintenance-schedule/TemplateDetail";
import { TemplateList } from "./maintenance-schedule/TemplateList";
import {
  defaultScheduleTemplates,
  type ScheduleFormValues,
  type ScheduleTemplate,
} from "./maintenance-schedule/types";

interface MaintenanceScheduleSetupProps {
  data: { schedules?: ScheduleTemplate[] } | undefined;
  onUpdate: (data: { schedules: ScheduleTemplate[] }) => void;
}

const MaintenanceScheduleSetup: React.FC<MaintenanceScheduleSetupProps> = ({ data, onUpdate }) => {
  const [schedules, setSchedules] = useState<ScheduleTemplate[]>(
    data?.schedules || defaultScheduleTemplates,
  );
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleTemplate | null>(null);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  const persist = (next: ScheduleTemplate[]) => {
    setSchedules(next);
    onUpdate({ schedules: next });
  };

  const handleCreate = (values: ScheduleFormValues) => {
    const id = values.name.toLowerCase().replace(/\s+/g, "-");
    const newSchedule: ScheduleTemplate = {
      id,
      name: values.name,
      description: values.description || "",
      frequency: values.frequency,
      priority: values.priority,
      tasks: [],
    };
    const updated = [...schedules, newSchedule];
    persist(updated);
    setSelectedSchedule(newSchedule);
    setIsAddingSchedule(false);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updated = schedules.filter((s) => s.id !== scheduleId);
    if (selectedSchedule?.id === scheduleId) {
      setSelectedSchedule(updated.length > 0 ? updated[0] : null);
    }
    persist(updated);
  };

  const handleAddTask = (task: string) => {
    if (!selectedSchedule) return;
    const updatedSchedule = { ...selectedSchedule, tasks: [...selectedSchedule.tasks, task] };
    const updated = schedules.map((s) => (s.id === selectedSchedule.id ? updatedSchedule : s));
    persist(updated);
    setSelectedSchedule(updatedSchedule);
  };

  const handleDeleteTask = (scheduleId: string, taskIndex: number) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;
    const updatedSchedule = {
      ...schedule,
      tasks: schedule.tasks.filter((_, index) => index !== taskIndex),
    };
    const updated = schedules.map((s) => (s.id === scheduleId ? updatedSchedule : s));
    persist(updated);
    if (selectedSchedule?.id === scheduleId) {
      setSelectedSchedule(updatedSchedule);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Maintenance Schedule Templates</h2>
      </div>

      <p className="text-muted-foreground">
        Create preventive maintenance schedule templates for your different asset types.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Templates</h3>
            <NewTemplateDialog
              open={isAddingSchedule}
              onOpenChange={setIsAddingSchedule}
              onSubmit={handleCreate}
            />
          </div>

          <TemplateList
            templates={schedules}
            selectedId={selectedSchedule?.id ?? null}
            onSelect={setSelectedSchedule}
          />
        </div>

        <div className="md:col-span-2">
          {selectedSchedule ? (
            <TemplateDetail
              template={selectedSchedule}
              onDelete={() => handleDeleteSchedule(selectedSchedule.id)}
              onAddTask={handleAddTask}
              onDeleteTask={(index) => handleDeleteTask(selectedSchedule.id, index)}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center text-center p-8">
                <Calendar className="h-12 w-12 mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium">No Template Selected</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Select a template from the list or create a new one
                </p>
                <Button onClick={() => setIsAddingSchedule(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduleSetup;
