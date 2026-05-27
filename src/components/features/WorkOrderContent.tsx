import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, CheckCircle2, AlertCircle, Signal, SignalOff, Smartphone } from "lucide-react";
import { toast } from "sonner";

type Priority = "high" | "medium" | "low";
type Status = "open" | "in_progress" | "completed";

interface WorkOrder {
 id: string;
 title: string;
 asset: string;
 assignee: string;
 priority: Priority;
 status: Status;
 due: string;
 partsUsed: string[];
}

interface InventoryItem {
 name: string;
 qty: number;
 reorderPoint: number;
}

interface QueuedSyncAction {
 id: string;
 type: "CREATE" | "COMPLETE";
 workOrderId: string;
 createdAt: string;
}

const sampleOrders: WorkOrder[] = [
 { id: "WO-1042", title: "Replace HVAC air filter", asset: "Rooftop Unit #3", assignee: "Maria Lopez", priority: "medium", status: "in_progress", due: "Tomorrow", partsUsed: ["HVAC Filter MERV-13"] },
 { id: "WO-1041", title: "Inspect conveyor belt tension", asset: "Line 2 Conveyor", assignee: "James Carter", priority: "high", status: "open", due: "Today", partsUsed: ["SKF Bearing 6205"] },
 { id: "WO-1039", title: "Lubricate compressor bearings", asset: "Compressor A", assignee: "Priya Patel", priority: "low", status: "completed", due: "Yesterday", partsUsed: ["Hydraulic Seal Kit"] },
];

const initialInventory: InventoryItem[] = [
 { name: "HVAC Filter MERV-13", qty: 6, reorderPoint: 3 },
 { name: "SKF Bearing 6205", qty: 2, reorderPoint: 2 },
 { name: "Hydraulic Seal Kit", qty: 4, reorderPoint: 3 },
];

const technicians = ["Maria Lopez", "James Carter", "Priya Patel", "David Kim"];

const priorityStyles: Record<Priority, string> = {
 high: "bg-red-100 text-red-700 border-red-200",
 medium: "bg-amber-100 text-amber-700 border-amber-200",
 low: "bg-fiix-50 text-fiix-700 border-fiix-200",
};

const statusMeta: Record<Status, { label: string; icon: React.ReactNode; className: string }> = {
 open: { label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" />, className: "bg-blue-50 text-blue-700 border-blue-200" },
 in_progress: { label: "In progress", icon: <Clock className="h-3.5 w-3.5" />, className: "bg-amber-50 text-amber-700 border-amber-200" },
 completed: { label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "bg-fiix-50 text-fiix-700 border-fiix-200" },
};

const WorkOrderContent: React.FC = () => {
 const [orders, setOrders] = useState<WorkOrder[]>(sampleOrders);
 const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
 const [queuedActions, setQueuedActions] = useState<QueuedSyncAction[]>([]);
 const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== "undefined" && !navigator.onLine);
 const [title, setTitle] = useState("");
 const [priority, setPriority] = useState<Priority>("medium");
 const [description, setDescription] = useState("");
 const [assignee, setAssignee] = useState("");
 const [due, setDue] = useState("");

 useEffect(() => {
 const handleOnline = () => setIsOffline(false);
 const handleOffline = () => setIsOffline(true);

 window.addEventListener("online", handleOnline);
 window.addEventListener("offline", handleOffline);
 return () => {
 window.removeEventListener("online", handleOnline);
 window.removeEventListener("offline", handleOffline);
 };
 }, []);

 const lowStockItems = useMemo(() => inventory.filter((item) => item.qty <= item.reorderPoint), [inventory]);

 const registerSyncAction = (action: Omit<QueuedSyncAction, "id" | "createdAt">) => {
 if (!isOffline) return;
 setQueuedActions((prev) => [
 ...prev,
 {
 ...action,
 id: `${action.type}-${action.workOrderId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
 createdAt: new Date().toISOString(),
 },
 ]);
 toast("Saved offline", { description: "Update has been queued and will sync automatically after reconnecting." });
 };

 const handleCreate = (e: React.FormEvent) => {
 e.preventDefault();
 if (!title.trim()) {
 toast.error("Please enter a work order title");
 return;
 }
 const newOrder: WorkOrder = {
 id: `WO-${1043 + orders.length - sampleOrders.length}`,
 title: title.trim(),
 asset: "Unassigned asset",
 assignee: assignee || "Unassigned",
 priority,
 status: "open",
 due: due || "—",
 partsUsed: ["Hydraulic Seal Kit"],
 };
 setOrders((prev) => [newOrder, ...prev]);
 setTitle("");
 setDescription("");
 setDue("");
 registerSyncAction({ type: "CREATE", workOrderId: newOrder.id });
 if (!isOffline) toast.success("Work order created");
 };

 const handleComplete = (id: string) => {
 const target = orders.find((o) => o.id === id);
 if (!target || target.status === "completed") return;

 setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o)));

 setInventory((prev) => {
 const next = prev.map((item) =>
 target.partsUsed.includes(item.name) && item.qty > 0 ? { ...item, qty: item.qty - 1 } : item,
 );
 const lowAfter = next.filter((item) => item.qty <= item.reorderPoint && target.partsUsed.includes(item.name));
 if (lowAfter.length > 0) {
 toast.warning(`Low stock alert sent to manager: ${lowAfter.map((i) => i.name).join(", ")}`);
 }
 return next;
 });

 registerSyncAction({ type: "COMPLETE", workOrderId: id });
 if (!isOffline) toast.success(`Work order ${id} completed and inventory updated`);
 };

 const handleGoOnline = () => {
 setIsOffline(false);
 if (queuedActions.length > 0) {
 const queuedCount = queuedActions.length;
 setQueuedActions([]);
 toast.success(`Synced ${queuedCount} queued update${queuedCount > 1 ? "s" : ""}`);
 }
 };

 return (
 <div className="space-y-6">
 <Card className="border-fiix-200">
 <CardContent className="pt-6">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-2 text-sm">
 <Smartphone className="h-4 w-4 text-fiix-600" />
 <span className="font-medium">Mobile Technician Mode</span>
 <Badge variant="outline" className={isOffline ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"}>
 {isOffline ? <SignalOff className="h-3.5 w-3.5 mr-1" /> : <Signal className="h-3.5 w-3.5 mr-1" />}
 {isOffline ? "Offline" : "Online"}
 </Badge>
 </div>
 <div className="flex gap-2">
 <Button type="button" variant="outline" size="sm" onClick={() => setIsOffline(true)} disabled={isOffline}>Go Offline</Button>
 <Button type="button" size="sm" className="bg-fiix-600 hover:bg-fiix-700" onClick={handleGoOnline} disabled={!isOffline}>Reconnect & Sync</Button>
 </div>
 </div>
 {queuedActions.length > 0 && (
 <p className="text-xs text-muted-foreground mt-2">{queuedActions.length} change(s) queued and will sync automatically when you reconnect.</p>
 )}
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
 <Card className="lg:col-span-2">
 <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wrench className="h-4 w-4 text-fiix-600" />Create new work order</CardTitle></CardHeader>
 <CardContent>
 <form onSubmit={handleCreate} className="space-y-4">
 <div className="space-y-1.5"><Label htmlFor="wo-title">Title</Label><Input id="wo-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Replace pump seal" /></div>
 <div className="space-y-1.5"><Label>Priority</Label><Select value={priority} onValueChange={(v) => setPriority(v as Priority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select></div>
 <div className="space-y-1.5"><Label htmlFor="wo-desc">Description</Label><Textarea id="wo-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the issue or task..." /></div>
 <div className="space-y-1.5"><Label>Assign to</Label><Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue placeholder="Select a technician" /></SelectTrigger><SelectContent>{technicians.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select></div>
 <div className="space-y-1.5"><Label htmlFor="wo-due">Due date</Label><Input id="wo-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
 <Button type="submit" className="w-full bg-fiix-600 hover:bg-fiix-700">Create work order</Button>
 </form>
 </CardContent>
 </Card>

 <Card className="lg:col-span-3">
 <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>Recent work orders</span><span className="text-xs font-normal text-muted-foreground">{orders.length} total</span></CardTitle></CardHeader>
 <CardContent className="space-y-3">
 {orders.map((o) => {
 const meta = statusMeta[o.status];
 return (
 <div key={o.id} className="border border-border rounded-xl p-4 hover:border-fiix-300 hover:shadow-sm transition-all">
 <div className="flex items-start justify-between gap-3 mb-2"><div><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><span className="font-mono">{o.id}</span><span>•</span><span>{o.asset}</span></div><h4 className="font-semibold text-foreground">{o.title}</h4></div><Badge variant="outline" className={priorityStyles[o.priority]}>{o.priority}</Badge></div>
 <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
 <Badge variant="outline" className={`gap-1 ${meta.className}`}>{meta.icon}{meta.label}</Badge>
 <span>Assigned to <span className="font-medium text-foreground">{o.assignee}</span></span>
 <span>•</span><span>Due {o.due}</span>
 {o.status !== "completed" && <Button size="sm" variant="outline" onClick={() => handleComplete(o.id)}>Complete & deduct parts</Button>}
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader><CardTitle className="text-base">Parts inventory (auto-updates on completion)</CardTitle></CardHeader>
 <CardContent className="grid gap-2 sm:grid-cols-2">
 {inventory.map((item) => (
 <div key={item.name} className="rounded-lg border border-border p-3 flex items-center justify-between">
 <div>
 <p className="text-sm font-medium">{item.name}</p>
 <p className="text-xs text-muted-foreground">Reorder point: {item.reorderPoint}</p>
 </div>
 <Badge variant="outline" className={item.qty <= item.reorderPoint ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-fiix-50 text-fiix-700 border-fiix-200"}>{item.qty} in stock</Badge>
 </div>
 ))}
 {lowStockItems.length > 0 && <p className="text-xs text-amber-700 sm:col-span-2">Manager alerts active for low stock: {lowStockItems.map((i) => i.name).join(", ")}.</p>}
 </CardContent>
 </Card>
 </div>
 );
};

export default WorkOrderContent;
