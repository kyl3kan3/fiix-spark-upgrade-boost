
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MaintenanceForm from "./preventive-maintenance/MaintenanceForm";
import MaintenanceCalendar from "./preventive-maintenance/MaintenanceCalendar";
import TasksHeader from "./preventive-maintenance/TasksHeader";
import MaintenanceTaskList, { PmTask } from "./preventive-maintenance/MaintenanceTaskList";
import QueryErrorState from "@/components/common/QueryErrorState";
import {
 PmScheduleInput,
 completeWorkOrder,
 createPmSchedule,
 getUpcomingPmWorkOrders,
} from "@/services/workOrderService";
import { toast } from "sonner";

const WORK_ORDER_QUERY_KEYS = [
 ["pmWorkOrders"],
 ["workOrders"],
 ["calendarEvents"],
 ["workOrderReportData"],
 ["recentWorkOrderActivity"],
 ["dashboard-work-orders"],
];

const PreventiveMaintenanceContent: React.FC = () => {
 const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
 const queryClient = useQueryClient();

 const { data: workOrders, isLoading, error, refetch } = useQuery({
 queryKey: ["pmWorkOrders"],
 queryFn: getUpcomingPmWorkOrders,
 });

 const tasks: PmTask[] = (workOrders || []).map((wo) => ({
 id: wo.id,
 title: wo.title,
 asset: wo.asset?.name || "No asset",
 dueDate: new Date(wo.due_date as string),
 priority: wo.priority === "urgent" ? "high" : (wo.priority as PmTask["priority"]),
 isRecurring: /repeats every/i.test(wo.description || ""),
 }));

 const invalidateWorkOrderQueries = () =>
 Promise.all(
 WORK_ORDER_QUERY_KEYS.map((queryKey) =>
 queryClient.invalidateQueries({ queryKey }),
 ),
 );

 const createSchedule = useMutation({
 mutationFn: (input: PmScheduleInput) => createPmSchedule(input),
 onSuccess: async (createdCount) => {
 await invalidateWorkOrderQueries();
 toast.success(
 createdCount > 1
 ? `Recurring schedule created — ${createdCount} occurrences over the next 6 months`
 : "Maintenance schedule created successfully",
 );
 },
 onError: (error) => {
 toast.error("Couldn't create schedule", {
 description: error instanceof Error ? error.message : "Please try again.",
 });
 },
 });

 const completeTask = useMutation({
 mutationFn: (workOrderId: string) => completeWorkOrder(workOrderId),
 onSuccess: async () => {
 await invalidateWorkOrderQueries();
 toast.success("Task marked as completed");
 },
 onError: (error) => {
 toast.error("Couldn't complete task", {
 description: error instanceof Error ? error.message : "Please try again.",
 });
 },
 });

 // Current month's tasks for calendar highlights
 const currentMonthTaskDays = tasks
 .filter(
 (task) =>
 task.dueDate.getMonth() === new Date().getMonth() &&
 task.dueDate.getFullYear() === new Date().getFullYear(),
 )
 .map((task) => task.dueDate.getDate());

 const handleClearDateSelection = () => {
 setSelectedDate(undefined);
 };

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Calendar View */}
 <div className="lg:col-span-8">
 <Card className="bg-card border border-border rounded-lg shadow-sm">
 <CardHeader className="border-b border-border pb-4">
 <CardTitle className="font-headline text-xl text-foreground">Maintenance Calendar</CardTitle>
 </CardHeader>
 <CardContent className="pt-5">
 <MaintenanceCalendar
 selectedDate={selectedDate}
 setSelectedDate={setSelectedDate}
 currentMonthTaskDays={currentMonthTaskDays}
 />

 <TasksHeader
 selectedDate={selectedDate}
 onClearSelection={handleClearDateSelection}
 />

 {isLoading ? (
 <div className="py-8 flex items-center justify-center text-muted-foreground">
 <Loader2 className="h-5 w-5 animate-spin mr-2" />
 <span className="text-sm">Loading maintenance tasks…</span>
 </div>
 ) : error ? (
 <QueryErrorState title="Couldn't load maintenance tasks" error={error} onRetry={() => refetch()} />
 ) : (
 <MaintenanceTaskList
 tasks={tasks}
 selectedDate={selectedDate}
 onCompleteTask={(taskId) => completeTask.mutate(taskId)}
 isCompleting={completeTask.isPending}
 />
 )}
 </CardContent>
 </Card>
 </div>

 {/* Create Schedule Form */}
 <div className="lg:col-span-4">
 <Card className="bg-card border border-border rounded-lg shadow-sm">
 <CardHeader className="border-b border-border pb-4">
 <CardTitle className="font-headline text-xl text-foreground">Create PM Schedule</CardTitle>
 </CardHeader>
 <CardContent className="pt-5">
 <MaintenanceForm
 onCreateSchedule={(input) => createSchedule.mutate(input)}
 isSubmitting={createSchedule.isPending}
 />
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
};

export default PreventiveMaintenanceContent;
