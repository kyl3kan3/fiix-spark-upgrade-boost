
import * as z from "zod";
import { WorkOrderPriority, WorkOrderStatus } from "@/types/workOrders";

// Form validation schema
export const workOrderFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  priority: z.enum(["low", "medium", "high", "urgent"] as const),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"] as const),
  due_date: z.string().optional(),
  asset_id: z.union([z.string(), z.literal("none")]).optional().transform(val => 
    val === "none" ? null : val
  ),
  assigned_to: z.union([z.string(), z.literal("none")]).optional().transform(val => 
    val === "none" ? null : val
  )
});

// Type for the form values
export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;
