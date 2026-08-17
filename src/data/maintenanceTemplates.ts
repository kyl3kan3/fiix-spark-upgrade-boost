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
  downloads?: {
    label: string;
    format: string;
    path: string;
    filename: string;
  }[];
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
    metaTitle: "Work Order Template Word, PDF & Google Sheets (Free)",
    metaDescription:
      "Download a free maintenance work order template in Word, printable PDF, Excel and Google Sheets formats with planning, labor, parts, and close-out fields.",
    h1: "Free work order template for Word, PDF, and Google Sheets",
    eyebrow: "Four free formats",
    intro:
      "Choose a field-ready Word form, print-ready PDF, formula-driven spreadsheet for Excel or Google Sheets, or a plain CSV. Every format follows the same maintenance work order from request and approval through assignment, labor, parts, cause, repair, and verified close-out.",
    downloadPath: "/templates/downloads/work-order-template.docx",
    downloadFilename: "work-order-template.docx",
    downloads: [
      {
        label: "Word",
        format: "DOCX",
        path: "/templates/downloads/work-order-template.docx",
        filename: "work-order-template.docx",
      },
      {
        label: "Printable PDF",
        format: "PDF",
        path: "/templates/downloads/work-order-template.pdf",
        filename: "work-order-template.pdf",
      },
      {
        label: "Excel / Google Sheets",
        format: "XLSX",
        path: "/templates/downloads/work-order-template.xlsx",
        filename: "work-order-template.xlsx",
      },
      {
        label: "Plain spreadsheet",
        format: "CSV",
        path: "/templates/downloads/work-order-template.csv",
        filename: "work-order-template.csv",
      },
    ],
    published: "2026-08-13",
    updated: "2026-08-16",
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
      { q: "Can I download this work order template in Word?", a: "Yes. The DOCX is an editable two-page maintenance work order form designed for Microsoft Word and compatible document editors." },
      { q: "Is there a printable work order PDF?", a: "Yes. The PDF uses the same request, planning, execution, parts, labor, and close-out sections in a print-ready layout." },
      { q: "Can I use the spreadsheet in Google Sheets?", a: "Yes. Upload the XLSX to Google Drive and open it with Google Sheets. The workbook includes editable dropdowns, formulas, a print view, and reference lists." },
    ],
    relatedLearn: { label: "Work order meaning and workflow", href: "/learn/work-order" },
    relatedSolution: { label: "Work order software", href: "/solutions/work-order-software" },
  },
  {
    slug: "preliminary-hazard-analysis-template",
    title: "Preliminary Hazard Analysis Template",
    metaTitle: "Preliminary Hazard Analysis Template (Free PHA Worksheet)",
    metaDescription:
      "Download a free preliminary hazard analysis template for tasks, hazards, causes, consequences, risk ratings, controls, owners, and corrective work orders.",
    h1: "Free preliminary hazard analysis template",
    eyebrow: "Free PHA worksheet",
    intro:
      "Screen a maintenance task or change for credible hazards before detailed design or execution. The worksheet connects each scenario to causes, consequences, initial risk, controls, residual risk, an accountable owner, and a corrective work-order reference.",
    downloadPath: "/templates/downloads/preliminary-hazard-analysis-template.csv",
    downloadFilename: "preliminary-hazard-analysis-template.csv",
    published: "2026-08-17",
    updated: "2026-08-17",
    includes: [
      "System, asset, task, operating phase, and hazard scenario",
      "Potential causes, consequences, and people or assets exposed",
      "Initial severity, likelihood, and risk level",
      "Existing and recommended controls with an accountable owner",
      "Residual risk, due date, status, and corrective work-order ID",
    ],
    columns: [
      { name: "System, asset, or task", purpose: "The equipment, change, activity, or boundary being screened." },
      { name: "Hazard scenario", purpose: "A credible source, initiating event, and unwanted outcome written without assuming a control works." },
      { name: "Causes and consequences", purpose: "What could initiate the scenario and what could happen to people, equipment, operations, or the environment." },
      { name: "Initial risk", purpose: "Severity and likelihood before crediting new recommendations." },
      { name: "Controls and recommendations", purpose: "Existing safeguards plus actions that eliminate, reduce, detect, or respond to the hazard." },
      { name: "Residual risk and owner", purpose: "Risk remaining after controls, the accountable role, due date, and linked work order." },
    ],
    previewHeaders: ["Asset / task", "Hazard", "Initial risk", "Recommended control", "Owner", "WO ID"],
    previewRows: [
      ["PUMP-007 seal replacement", "Unexpected energization", "High", "Verify LOTO and zero energy", "Maintenance supervisor", "WO-2417"],
      ["AHU-014 belt inspection", "Contact with rotating parts", "Medium", "Interlocked guard inspection", "Facilities lead", "WO-2421"],
    ],
    steps: [
      { title: "Define the boundary", body: "Name the equipment, task, lifecycle phase, operating state, and interfaces included in the review so the team analyzes the same scope." },
      { title: "Describe credible scenarios", body: "Pair a hazard source with an initiating event and consequence. Consider normal work, startup, shutdown, maintenance, abnormal conditions, and foreseeable misuse." },
      { title: "Rate risk consistently", body: "Use your organization’s approved severity and likelihood matrix. Record the initial rating before recommendations and the residual rating only after a control owner accepts the action." },
      { title: "Turn recommendations into controlled work", body: "Give every action an owner, due date, status, and work-order or project reference. Escalate any risk that exceeds the organization’s acceptance criteria." },
    ],
    faqs: [
      { q: "What is a preliminary hazard analysis?", a: "A preliminary hazard analysis is an early, structured screen that identifies credible hazards, causes, consequences, risk levels, and recommended controls before more detailed design or task analysis." },
      { q: "When should a maintenance team use a PHA?", a: "Use a PHA for new equipment, process changes, unfamiliar maintenance tasks, major modifications, or early project decisions. It does not replace required job hazard analysis, LOTO, engineering review, or regulatory processes." },
      { q: "How should PHA recommendations be tracked?", a: "Assign an accountable owner, due date, status, and verification method. Link implementation work to a corrective work order or project action, then document the accepted residual risk." },
    ],
    relatedLearn: { label: "Maintenance SOP generator", href: "/tools/maintenance-sop-generator" },
    relatedSolution: { label: "Inspection workflows", href: "/solutions/facility-maintenance-software" },
  },
];

export const getMaintenanceTemplate = (slug: string) =>
  maintenanceTemplates.find((template) => template.slug === slug);
