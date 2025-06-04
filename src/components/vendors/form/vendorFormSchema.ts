
import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  contact_person: z.string().optional(),
  contact_title: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  vendor_type: z.enum(["service", "supplier", "contractor", "consultant"]),
  status: z.enum(["active", "inactive", "suspended"]),
  rating: z.number().min(1).max(5).optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
