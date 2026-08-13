export type MaintenanceTemplate = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  intro: string;
  downloadPath: string;
  downloadFilename: string;
  published: string;
  updated: string;
  includes: string[];
  columns: { name: string; purpose: string }[];
  previewHeaders: string[];
  previewRows: string[][];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  relatedLearn: { label: string; href: string };
  relatedSolution: { label: string; href: string };
};

export const maintenanceTemplates: MaintenanceTemplate[] = [
  {
    slug: "maintenance-log-template",
    title: "Maintenance Log Template",
    metaTitle: "Free Maintenance Log Template (Excel & Google Sheets)",
    metaDescription:
      "Download a free maintenance log template for equipment service, labor, parts, status, and next-service dates. CSV format works in Excel and Google Sheets.",
    h1: "Free maintenance log template",
    eyebrow: "Free CSV template",
    intro:
      "Record every repair, inspection, and preventive task in one consistent maintenance log. The template gives each entry an asset, owner, cost, status, and next-service date so the spreadsheet stays useful as the history grows.",
    downloadPath: "/templates/downloads/maintenance-log-template.csv",
    downloadFilename: "maintenance-log-template.csv",
    published: "2026-08-13",
    updated: "2026-08-13",
    includes: [
      "Asset and location identifiers",
      "Maintenance type, work description, and technician",
      "Labor hours and parts cost",
      "Status, next-service date, and close-out notes",
    ],
    columns: [
      { name: "Date", purpose: "When the work occurred." },
      { name: "Work Order ID", purpose: "A unique reference that connects the log to the original request." },
      { name: "Asset ID and name", purpose: "The equipment that received the work." },
      { name: "Maintenance type", purpose: "Preventive, corrective, inspection, or emergency." },
      { name: "Labor and parts", purpose: "The time and direct material cost of the job." },
      { name: "Next service due", purpose: "The follow-up date that keeps repeat work visible." },
    ],
    previewHeaders: ["Date", "Asset", "Type", "Technician", "Status", "Next due"],
    previewRows: [
      ["2026-08-01", "AHU-014", "Preventive", "J. Rivera", "Complete", "2026-11-01"],
      ["2026-08-04", "PUMP-007", "Corrective", "S. Lee", "Complete", "2026-09-04"],
    ],
    steps: [
      { title: "Give every asset a stable ID", body: "Use the same identifier on the equipment label, maintenance log, and any work order so history does not split across spelling variations." },
      { title: "Enter one row per completed event", body: "Log inspections and preventive work as well as repairs. A complete history is more useful than a breakdown-only list." },
      { title: "Review it once a month", body: "Sort by asset, repeat problem, cost, and next-service date. Move to a CMMS when the spreadsheet becomes hard to assign, schedule, or audit." },
    ],
    faqs: [
      { q: "What is a maintenance log template?", a: "A maintenance log template is a structured record of work performed on equipment, including the date, asset, task, technician, cost, status, and follow-up date." },
      { q: "Can I open this template in Excel or Google Sheets?", a: "Yes. The download is a CSV file, so it opens in Microsoft Excel, Google Sheets, Apple Numbers, and most spreadsheet applications." },
      { q: "How often should I update a maintenance log?", a: "Update it when work is completed, not at the end of the week. Same-day entries preserve accurate labor, parts, failure details, and follow-up dates." },
    ],
    relatedLearn: { label: "What is a work order?", href: "/learn/work-order" },
    relatedSolution: { label: "Asset tracking software", href: "/solutions/asset-tracking-software" },
  },
  {
    slug: "preventive-maintenance-checklist",
    title: "Preventive Maintenance Checklist",
    metaTitle: "Free Preventive Maintenance Checklist Template",
    metaDescription:
      "Download a free preventive maintenance checklist with asset, task, frequency, acceptance criteria, owner, last-completed date, and next-due date fields.",
    h1: "Free preventive maintenance checklist",
    eyebrow: "Free CSV checklist",
    intro:
      "Turn recurring maintenance into a schedule your team can actually follow. This preventive maintenance checklist defines the asset, task, frequency, acceptance criteria, responsible role, and next due date in one portable sheet.",
    downloadPath: "/templates/downloads/preventive-maintenance-checklist.csv",
    downloadFilename: "preventive-maintenance-checklist.csv",
    published: "2026-08-13",
    updated: "2026-08-13",
    includes: [
      "Asset, location, and PM task",
      "Frequency and clear acceptance criteria",
      "Assigned role, last-completed date, and next due date",
      "Status and technician notes",
    ],
    columns: [
      { name: "PM task", purpose: "One observable action per row." },
      { name: "Frequency", purpose: "Daily, weekly, monthly, quarterly, annual, or meter-based interval." },
      { name: "Acceptance criteria", purpose: "What a pass looks like and when to create corrective work." },
      { name: "Assigned role", purpose: "The job role accountable for completion." },
      { name: "Last completed", purpose: "The evidence date for the previous cycle." },
      { name: "Next due", purpose: "The next scheduled date used to manage compliance." },
    ],
    previewHeaders: ["Asset", "PM task", "Frequency", "Owner", "Next due", "Status"],
    previewRows: [
      ["AHU-014", "Inspect belts", "Monthly", "HVAC tech", "2026-09-01", "Scheduled"],
      ["GEN-003", "Run-load test", "Quarterly", "Electrician", "2026-10-15", "Scheduled"],
    ],
    steps: [
      { title: "Start with critical assets", body: "Build the checklist first for equipment whose failure affects safety, production, customers, or a large repair bill." },
      { title: "Write pass-or-fail criteria", body: "Replace vague instructions like 'check belt' with a measurable inspection and a clear corrective-work trigger." },
      { title: "Schedule from the last completion", body: "Keep last-completed and next-due dates together. Review overdue work weekly and adjust intervals when evidence supports it." },
    ],
    faqs: [
      { q: "What should a preventive maintenance checklist include?", a: "Include the asset, location, task, frequency, procedure or acceptance criteria, assigned role, last completion, next due date, status, and notes." },
      { q: "How do I choose a preventive maintenance frequency?", a: "Start with the manufacturer recommendation, regulatory requirement, asset criticality, operating hours, and failure history. Adjust only when your records show the interval is too short or too long." },
      { q: "Is the checklist compatible with Excel and Google Sheets?", a: "Yes. It downloads as CSV and opens in Excel, Google Sheets, Apple Numbers, and most spreadsheet tools." },
    ],
    relatedLearn: { label: "Preventive maintenance explained", href: "/learn/preventive-maintenance" },
    relatedSolution: { label: "Preventive maintenance software", href: "/solutions/preventive-maintenance-software" },
  },
  {
    slug: "work-order-template",
    title: "Work Order Template",
    metaTitle: "Free Work Order Template for Maintenance Teams",
    metaDescription:
      "Download a free maintenance work order template with priority, status, requester, asset, assignment, schedule, labor, parts, and completion fields.",
    h1: "Free maintenance work order template",
    eyebrow: "Free CSV template",
    intro:
      "Capture a maintenance request, turn it into assigned work, and preserve the close-out details. This work order template covers the full record from requester and priority through labor, parts, completion date, and technician notes.",
    downloadPath: "/templates/downloads/work-order-template.csv",
    downloadFilename: "work-order-template.csv",
    published: "2026-08-13",
    updated: "2026-08-13",
    includes: [
      "Requester, priority, status, and location",
      "Asset identifiers and a complete problem description",
      "Technician assignment and scheduled date",
      "Completion date, labor, parts cost, and close-out notes",
    ],
    columns: [
      { name: "Work Order ID", purpose: "A unique reference for communication and history." },
      { name: "Priority and status", purpose: "How urgent the work is and where it sits in the workflow." },
      { name: "Requester and location", purpose: "Who reported the issue and where the technician should go." },
      { name: "Asset and problem", purpose: "The affected equipment and the original symptoms." },
      { name: "Assignment and schedule", purpose: "The responsible technician and promised work date." },
      { name: "Close-out fields", purpose: "Completion date, labor, parts, and the permanent repair note." },
    ],
    previewHeaders: ["WO ID", "Priority", "Asset", "Assigned", "Status", "Scheduled"],
    previewRows: [
      ["WO-1001", "High", "PUMP-007", "S. Lee", "In progress", "2026-08-13"],
      ["WO-1002", "Medium", "AHU-014", "J. Rivera", "Assigned", "2026-08-14"],
    ],
    steps: [
      { title: "Capture the symptom before the diagnosis", body: "Keep the requester's original description, then let the technician add cause and repair details during close-out." },
      { title: "Use a small status set", body: "Requested, approved, assigned, in progress, on hold, completed, and closed are enough for most teams and make backlog reporting consistent." },
      { title: "Close with useful history", body: "Record the work performed, parts, labor, and follow-up need. That close-out becomes the starting point for the next repair on the same asset." },
    ],
    faqs: [
      { q: "What should a maintenance work order include?", a: "A work order should include a unique ID, requester, priority, status, location, asset, problem description, assignee, schedule, labor, parts, completion date, and close-out notes." },
      { q: "What is the difference between a work request and a work order?", a: "A request reports a need. A work order is the approved, assigned, and trackable record used to plan and complete that work." },
      { q: "Can I use this work order template in Excel?", a: "Yes. The CSV opens in Excel, Google Sheets, Apple Numbers, and other spreadsheet applications." },
    ],
    relatedLearn: { label: "Work order meaning and workflow", href: "/learn/work-order" },
    relatedSolution: { label: "Work order software", href: "/solutions/work-order-software" },
  },
];

export const getMaintenanceTemplate = (slug: string) =>
  maintenanceTemplates.find((template) => template.slug === slug);
