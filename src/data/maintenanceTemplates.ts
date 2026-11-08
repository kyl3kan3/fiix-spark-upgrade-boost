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
  contentLayout?: "expanded";
  fieldsSectionTitle?: string;
  fieldsSectionFooter?: string;
  previewSectionTitle?: string;
  previewSectionLead?: string;
  previewDisclaimer?: string;
  previewTableMinWidthClass?: string;
  comparisonSection?: { title: string; body: string };
  tipsSectionTitle?: string;
};

export const maintenanceTemplates: MaintenanceTemplate[] = [
  {
    slug: "maintenance-log-template",
    title: "Maintenance Log Template",
    metaTitle: "Free Maintenance Log Template (CSV Download) | MaintenEase",
    metaDescription:
      "Free maintenance log template (CSV). Record date, work order, asset, type, technician, labor hours, parts cost, status and next service due.",
    h1: "Free maintenance log template (CSV)",
    eyebrow: "Free CSV template",
    intro:
      "Download a free maintenance log template as a CSV file with 13 columns for recording completed maintenance work. Each row captures the date, work order ID, asset, location, maintenance type, description, technician, labor hours, parts cost, status, next service due date and notes.",
    downloadPath: "/templates/downloads/maintenance-log-template.csv",
    downloadFilename: "maintenance-log-template.csv",
    published: "2026-08-13",
    updated: "2026-11-08",
    contentLayout: "expanded",
    fieldsSectionTitle: "What's in the template",
    fieldsSectionFooter:
      "The download includes one sample row followed by blank rows ready for your entries.",
    previewSectionTitle: "Example entries",
    previewSectionLead:
      "These fictional rows show how each column looks with real maintenance data.",
    previewDisclaimer: "Example only — fictional entries for illustration.",
    previewTableMinWidthClass: "min-w-[1120px]",
    comparisonSection: {
      title: "Log vs. work order vs. asset register",
      body:
        "A [work order](/learn/work-order) requests and assigns a specific job before it is done. A maintenance log records what was actually done after the work is completed, one entry per event. An [asset register](/solutions/asset-tracking-software) lists the equipment you own and its details, while the log builds up the service history for each asset over time.",
    },
    tipsSectionTitle: "Tips for keeping a useful maintenance log",
    includes: [],
    columns: [
      { name: "Date", purpose: "The date the maintenance work was performed." },
      { name: "Work Order ID", purpose: "The reference number of the related work order." },
      { name: "Asset ID", purpose: "The unique identifier for the equipment or asset." },
      { name: "Asset Name", purpose: "A plain-language name for the asset." },
      { name: "Location", purpose: "Where the asset is installed, such as a building, floor or room." },
      { name: "Maintenance Type", purpose: "The category of work, such as Preventive or Corrective." },
      { name: "Description", purpose: "A short summary of the work performed." },
      { name: "Technician", purpose: "The person who completed the work." },
      { name: "Labor Hours", purpose: "Time spent on the work, in hours." },
      { name: "Parts Cost", purpose: "The cost of parts used, entered as a number." },
      { name: "Status", purpose: "The current state of the work, such as Complete or Open." },
      { name: "Next Service Due", purpose: "The date the asset is next due for service." },
      { name: "Notes", purpose: "Readings, observations or follow-up details." },
    ],
    previewHeaders: [
      "Date",
      "Work Order ID",
      "Asset ID",
      "Asset Name",
      "Location",
      "Maintenance Type",
      "Description",
      "Technician",
      "Labor Hours",
      "Parts Cost",
      "Status",
      "Next Service Due",
      "Notes",
    ],
    previewRows: [
      [
        "2026-09-03",
        "WO-2041",
        "PMP-007",
        "Chilled Water Pump 2",
        "Plant Room B1",
        "Preventive",
        "Grease motor bearings and check seals for leaks",
        "A.C.",
        "0.75",
        "12.00",
        "Complete",
        "2026-12-03",
        "No leaks found",
      ],
      [
        "2026-09-10",
        "WO-2047",
        "CMP-112",
        "Air Compressor 1",
        "Workshop Bay 3",
        "Corrective",
        "Replace failed pressure switch",
        "M.O.",
        "2.0",
        "64.00",
        "Complete",
        "2026-12-10",
        "Cut-out pressure set to specification",
      ],
      [
        "2026-09-15",
        "WO-2052",
        "DR-031",
        "Loading Dock Door 4",
        "Warehouse North",
        "Corrective",
        "Realign door track; spring replacement pending",
        "T.K.",
        "1.25",
        "0.00",
        "Open",
        "2026-09-22",
        "Awaiting spring delivery",
      ],
    ],
    steps: [
      {
        title: "Use a stable asset ID",
        body:
          "Give every asset one ID and use it consistently in every row, even if the asset's name or location changes. That keeps its full history together when you sort or filter the log.",
      },
      {
        title: "Add one row per completed event",
        body:
          "Record each job as its own row, whether it was [planned maintenance](/learn/preventive-maintenance) or a [corrective repair](/learn/corrective-maintenance). Avoid combining several visits into one line, so labor hours and parts costs stay accurate.",
      },
      {
        title: "Review the log monthly",
        body:
          "Look for assets with repeated corrective work, rising parts costs or overdue next-service dates. Repeat failures can be fed into an [MTBF calculator](/tools/mtbf-calculator) to see how often an asset breaks down. Record repair duration separately if you want to calculate [MTTR](/learn/mttr); labor hours alone do not measure elapsed repair time. Move to a [CMMS](/learn/cmms) when the spreadsheet becomes hard to keep accurate and current across your team or sites. If recurring service dates are the main difficulty, review [preventive maintenance software](/solutions/preventive-maintenance-software).",
      },
    ],
    faqs: [
      {
        q: "What is a maintenance log template?",
        a: "A maintenance log template is a ready-made structure for recording completed maintenance work. This one has 13 columns: date, work order ID, asset ID, asset name, location, maintenance type, description, technician, labor hours, parts cost, status, next service due and notes.",
      },
      {
        q: "Can I open the template in Excel or Google Sheets?",
        a: "Yes. The template is a CSV file, so you can open it in Excel, import it into Google Sheets, or use any spreadsheet app that reads CSV. If you add formatting or formulas, save a copy in your spreadsheet app's own format, because CSV stores plain values only.",
      },
      {
        q: "How often should I update a maintenance log?",
        a: "Add an entry as soon as each job is completed, ideally the same day, while details such as labor hours and parts used are accurate. Review the full log at least monthly to spot recurring issues and upcoming service dates.",
      },
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
