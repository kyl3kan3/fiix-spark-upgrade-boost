
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
  parent_id: z.string().optional()
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;
