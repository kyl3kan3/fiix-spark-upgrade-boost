
export const events = [
  {
    id: 1,
    title: "HVAC Maintenance",
    description: "Regular maintenance check for HVAC system in Building A",
    date: new Date(2025, 4, 12), // May 12, 2025
    technician: "Sarah Johnson",
    status: "scheduled",
    type: "preventive",
    duration: "2 hours",
  },
  {
    id: 2,
    title: "Electrical Inspection",
    description: "Annual electrical system inspection for compliance",
    date: new Date(2025, 4, 15), // May 15, 2025
    technician: "Michael Lee",
    status: "scheduled",
    type: "inspection",
    duration: "3 hours",
  },
  {
    id: 3,
    title: "Broken Elevator Repair",
    description: "Urgent repair for elevator #3 in main building",
    date: new Date(), // Today
    technician: "Sarah Johnson",
    status: "in-progress",
    type: "corrective",
    duration: "4 hours",
  },
  {
    id: 4,
    title: "Generator Testing",
    description: "Monthly backup generator testing and maintenance",
    date: new Date(2025, 4, 20), // May 20, 2025
    technician: "John Smith",
    status: "scheduled",
    type: "preventive",
    duration: "1 hour",
  },
  {
    id: 5,
    title: "Plumbing System Check",
    description: "Quarterly plumbing system inspection",
    date: new Date(2025, 4, 10), // May 10, 2025
    technician: "Emily Davis",
    status: "completed",
    type: "inspection",
    duration: "2 hours",
  },
];

export const technicians = [
  { id: 1, name: "All Technicians", value: "all" },
  { id: 2, name: "John Smith", value: "John Smith" },
  { id: 3, name: "Sarah Johnson", value: "Sarah Johnson" },
  { id: 4, name: "Michael Lee", value: "Michael Lee" },
  { id: 5, name: "Emily Davis", value: "Emily Davis" },
];
