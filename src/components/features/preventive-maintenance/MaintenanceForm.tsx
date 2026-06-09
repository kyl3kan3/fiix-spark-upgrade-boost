
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getAllAssets } from "@/services/assets/assetQueries";
import { PmScheduleInput } from "@/services/workOrderService";

interface MaintenanceFormProps {
 onCreateSchedule: (input: PmScheduleInput) => void;
 isSubmitting?: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onCreateSchedule, isSubmitting }) => {
 // Form state
 const [taskName, setTaskName] = useState("");
 const [selectedAsset, setSelectedAsset] = useState("");
 const [frequencyValue, setFrequencyValue] = useState("1");
 const [frequencyUnit, setFrequencyUnit] = useState("months");
 const [startDate, setStartDate] = useState<Date | undefined>(new Date());
 const [showDatePicker, setShowDatePicker] = useState(false);
 const [isRecurring, setIsRecurring] = useState(false);
 const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

 const { data: assets, isLoading: assetsLoading } = useQuery({
 queryKey: ["assets"],
 queryFn: getAllAssets,
 });

 const handleCreateSchedule = () => {
 if (!taskName || !selectedAsset || !startDate) {
 toast.error("Please fill out all required fields");
 return;
 }

 onCreateSchedule({
 title: taskName,
 assetId: selectedAsset,
 startDate,
 priority,
 ...(isRecurring && {
 frequency: {
 value: parseInt(frequencyValue),
 unit: frequencyUnit as "days" | "weeks" | "months" | "years"
 }
 })
 });

 // Reset the form
 setTaskName("");
 };

 return (
 <form className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="task-name">Task Name</Label>
 <Input 
 id="task-name" 
 value={taskName}
 onChange={e => setTaskName(e.target.value)}
 placeholder="e.g., Oil Change" 
 />
 </div>
 
 <div className="space-y-2">
 <Label htmlFor="asset">Asset</Label>
 <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={assetsLoading}>
 <SelectTrigger>
 <SelectValue placeholder={assetsLoading ? "Loading assets…" : "Select Asset"} />
 </SelectTrigger>
 <SelectContent>
 {(assets || []).map((asset) => (
 <SelectItem key={asset.id} value={asset.id}>
 {asset.name}
 </SelectItem>
 ))}
 {!assetsLoading && (assets || []).length === 0 && (
 <div className="px-2 py-1.5 text-sm text-muted-foreground">
 No assets yet — add one under Assets first.
 </div>
 )}
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-2">
 <Label>Start Date</Label>
 <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 className="w-full justify-start text-left font-normal"
 >
 <CalendarIcon className="mr-2 h-4 w-4" />
 {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-auto p-0" align="start">
 <Calendar
 mode="single"
 selected={startDate}
 onSelect={(date) => {
 setStartDate(date);
 setShowDatePicker(false);
 }}
 initialFocus
 className={cn("p-3 pointer-events-auto")}
 />
 </PopoverContent>
 </Popover>
 </div>

 <div className="space-y-2">
 <Label htmlFor="priority">Priority</Label>
 <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
 <SelectTrigger>
 <SelectValue placeholder="Select Priority" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="low">Low</SelectItem>
 <SelectItem value="medium">Medium</SelectItem>
 <SelectItem value="high">High</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="flex items-center space-x-2 pt-2">
 <Switch 
 id="recurring-task"
 checked={isRecurring}
 onCheckedChange={setIsRecurring}
 />
 <Label htmlFor="recurring-task">Recurring Maintenance</Label>
 </div>
 
 {isRecurring && (
 <div className="space-y-2 pt-2">
 <Label>Frequency</Label>
 <div className="flex space-x-2">
 <Input 
 type="number" 
 min="1" 
 className="w-20" 
 value={frequencyValue}
 onChange={e => setFrequencyValue(e.target.value)}
 />
 <Select value={frequencyUnit} onValueChange={setFrequencyUnit}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="days">Days</SelectItem>
 <SelectItem value="weeks">Weeks</SelectItem>
 <SelectItem value="months">Months</SelectItem>
 <SelectItem value="years">Years</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 )}
 
 <Button
 className="w-full"
 disabled={isSubmitting}
 onClick={(e) => {
 e.preventDefault();
 handleCreateSchedule();
 }}
 >
 {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
 {isSubmitting ? "Creating…" : "Create Schedule"}
 </Button>
 </form>
 );
};

export default MaintenanceForm;
