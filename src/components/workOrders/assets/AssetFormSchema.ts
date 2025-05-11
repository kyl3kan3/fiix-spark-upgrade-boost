
import * as z from "zod";

// Form validation schema
export const assetFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  location: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  status: z.string().default("active"),
  parent_id: z.union([z.string(), z.literal("none"), z.literal("new")]).optional().transform(val => 
    val === "none" ? null : val
  ),
  // New fields for creating parent asset
  parent_name: z.string().optional(),
  parent_description: z.string().optional(),
  parent_location: z.string().optional(), // Add this field for parent location
  // Flag to indicate if we're adding a new location
  new_location: z.boolean().default(false),
  // Field for new location name
  new_location_name: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

// Location interface for dropdown
export interface Location {
  id: string;
  name: string;
}
