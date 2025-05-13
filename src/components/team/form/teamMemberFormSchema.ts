
import { z } from "zod";

export const teamMemberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
