
import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WorkOrderFormData, WorkOrderPriority, WorkOrderStatus } from "@/types/workOrders";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  priority: z.enum(["low", "medium", "high", "urgent"] as const),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"] as const),
  due_date: z.string().optional(),
  asset_id: z.string().optional(),
  assigned_to: z.string().optional()
});

type WorkOrderFormProps = {
  initialData?: WorkOrderFormData;
  workOrderId?: string;
  onSuccess?: () => void;
};

const WorkOrderForm = ({ initialData, workOrderId, onSuccess }: WorkOrderFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!workOrderId;

  // Fetch assets for dropdown
  const { data: assets } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch technicians for assignment
  const { data: technicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("first_name");
      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: (initialData?.priority as WorkOrderPriority) || "medium",
      status: (initialData?.status as WorkOrderStatus) || "pending",
      due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split("T")[0] : "",
      asset_id: initialData?.asset_id || undefined,
      assigned_to: initialData?.assigned_to || undefined
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create work orders",
          variant: "destructive"
        });
        return;
      }

      const workOrderData = {
        ...values,
        due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      };

      let response;
      
      if (isEditing) {
        response = await supabase
          .from("work_orders")
          .update(workOrderData)
          .eq("id", workOrderId)
          .select();
      } else {
        response = await supabase
          .from("work_orders")
          .insert([{ ...workOrderData, created_by: user.id }])
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "Work Order Updated" : "Work Order Created",
        description: isEditing 
          ? "The work order has been updated successfully." 
          : "A new work order has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/work-orders");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter work order title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the work order task" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="asset_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to technician (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {technicians?.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/work-orders")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkOrderForm;
