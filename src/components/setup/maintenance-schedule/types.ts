import * as z from "zod";

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  priority: string;
  tasks: string[];
}

export const scheduleFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  frequency: z.string({ error: "Please select a frequency." }),
  priority: z.string({ error: "Please select a priority level." }),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const defaultScheduleTemplates: ScheduleTemplate[] = [
  {
    id: "monthly-hvac-inspection",
    name: "Monthly HVAC Inspection",
    description: "Monthly inspection of all HVAC systems",
    frequency: "monthly",
    priority: "medium",
    tasks: [
      "Check and replace air filters if needed",
      "Inspect belts and pulleys for wear",
      "Clean condenser and evaporator coils",
      "Check refrigerant levels",
      "Test system operation",
    ],
  },
  {
    id: "quarterly-electrical",
    name: "Quarterly Electrical System Check",
    description: "Routine inspection of electrical systems and components",
    frequency: "quarterly",
    priority: "high",
    tasks: [
      "Inspect electrical panels",
      "Check for loose connections",
      "Test circuit breakers",
      "Measure voltage and load balance",
      "Check backup power systems",
    ],
  },
  {
    id: "annual-safety",
    name: "Annual Safety Equipment Inspection",
    description: "Yearly inspection of all safety equipment",
    frequency: "annually",
    priority: "urgent",
    tasks: [
      "Test fire alarm systems",
      "Inspect fire extinguishers",
      "Check emergency lighting",
      "Test sprinkler systems",
      "Confirm safety signage is in place",
    ],
  },
];

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low": return "bg-success/10 text-success";
    case "medium": return "bg-primary/10 text-primary";
    case "high": return "bg-warning/10 text-warning";
    case "urgent": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-foreground";
  }
};

export const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case "daily": return "Every day";
    case "weekly": return "Every week";
    case "monthly": return "Every month";
    case "quarterly": return "Every 3 months";
    case "biannually": return "Every 6 months";
    case "annually": return "Every year";
    default: return frequency;
  }
};
