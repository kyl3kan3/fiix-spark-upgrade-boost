
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { WorkOrderWithRelations } from "@/types/workOrders";

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const priorityColorMap: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const WorkOrderList: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string | "all">("all");

  // Fetch work orders with related data
  const { data: workOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          asset:assets(*),
          assignee:profiles!work_orders_assigned_to_fkey(*),
          creator:profiles!work_orders_created_by_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WorkOrderWithRelations[];
    },
  });

  if (error) {
    toast({
      title: "Error loading work orders",
      description: (error as Error).message || "An error occurred",
      variant: "destructive"
    });
  }

  // Filter work orders based on search query and filters
  const filteredWorkOrders = workOrders?.filter(workOrder => {
    const matchesSearch = searchQuery.trim() === "" || 
      workOrder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.assignee?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.assignee?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Work Orders</CardTitle>
          <Link to="/work-orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Work Order
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search work orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredWorkOrders && filteredWorkOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">
                      <Link to={`/work-orders/${workOrder.id}`} className="hover:underline">
                        {workOrder.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColorMap[workOrder.status] || "bg-gray-100"}>
                        {workOrder.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColorMap[workOrder.priority] || "bg-gray-100"}>
                        {workOrder.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{workOrder.asset?.name || "—"}</TableCell>
                    <TableCell>
                      {workOrder.assignee ? 
                        `${workOrder.assignee.first_name || ''} ${workOrder.assignee.last_name || ''}`.trim() : 
                        "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {workOrder.due_date ? formatDate(workOrder.due_date) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/work-orders/${workOrder.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No work orders found</p>
            <Link to="/work-orders/new" className="mt-4 inline-block">
              <Button variant="outline">Create your first work order</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderList;
