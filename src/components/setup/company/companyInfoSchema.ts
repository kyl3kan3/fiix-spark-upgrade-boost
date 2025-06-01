
import { z } from "zod";

export const companyInfoSchema = z.object({
  name: z.string().min(2, { message: "Company name is required" }),
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;
