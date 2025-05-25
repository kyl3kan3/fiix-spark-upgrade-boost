
import { z } from "zod";

// Location interface for the form
export interface Location {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
}

export const assetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(), // Keep for backward compatibility
  location_id: z.string().optional(), // New field for location ID
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  status: z.enum(["active", "inactive", "maintenance", "retired"]).default("active"),
  parent_id: z.string().optional(),
  parent_name: z.string().optional(),
  parent_description: z.string().optional(),
  parent_location: z.string().optional(), // Keep for parent asset location
  parent_location_id: z.string().optional(), // New field for parent asset location ID
  new_location: z.boolean().default(false),
  new_location_name: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;
