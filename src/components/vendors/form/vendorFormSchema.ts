
import { z } from "zod";

export const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  phone: z.string().optional(),
  contact_person: z.string().optional(),
  contact_title: z.string().optional(),
  vendor_type: z.enum(["service", "supplier", "contractor", "consultant"]),
  status: z.enum(["active", "inactive", "suspended"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  website: z.string().url("Please enter a valid URL").or(z.literal("")),
  description: z.string().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
