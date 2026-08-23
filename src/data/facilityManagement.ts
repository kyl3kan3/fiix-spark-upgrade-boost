export const FACILITY_MANAGEMENT_PAGE = {
  title: "Facility Management Guide: Operations, Maintenance, Software, and KPIs",
  metaTitle: "Facility Management Guide: Operations, Software & KPIs",
  metaDescription:
    "Navigate facility management operations, maintenance, work orders, inspections, assets, compliance, space, vendors, software selection, and practical KPIs.",
  description:
    "Facility management connects people, buildings, services, and operating processes so the built environment stays safe, functional, efficient, and ready for the organization it supports.",
  published: "2026-08-16",
  updated: "2026-08-23",
} as const;

export const FACILITY_MANAGEMENT_PATHS = [
  {
    title: "Facility maintenance",
    description: "Build the operating plan for HVAC, electrical, plumbing, life safety, envelope, grounds, and occupant-facing repairs.",
    href: "/learn/facility-maintenance",
    cta: "Plan facility maintenance",
    icon: "wrench",
  },
  {
    title: "Work orders and requests",
    description: "Standardize intake, triage, assignment, priorities, service levels, labor, parts, communication, and close-out evidence.",
    href: "/solutions/work-order-software",
    cta: "Design the work-order flow",
    icon: "clipboard",
  },
  {
    title: "Inspections and preventive work",
    description: "Turn recurring building checks and required tests into scheduled tasks with acceptance criteria and follow-up work.",
    href: "/learn/preventive-maintenance",
    cta: "Build the PM program",
    icon: "calendar",
  },
  {
    title: "Asset management",
    description: "Create a location-based register for maintainable equipment, documents, warranty, criticality, condition, and service history.",
    href: "/solutions/asset-management-software",
    cta: "Organize facility assets",
    icon: "boxes",
  },
  {
    title: "Compliance and audit evidence",
    description: "Map each obligation to the asset, frequency, procedure, responsible role, result, exception, and retained record.",
    href: "#compliance-and-risk",
    cta: "Structure compliance work",
    icon: "shield",
  },
  {
    title: "Hazard analysis and maintenance procedures",
    description: "Screen maintenance hazards, define controls, issue approved SOPs, and turn unresolved risk into assigned corrective work.",
    href: "/templates/preliminary-hazard-analysis-template",
    cta: "Start a preliminary hazard analysis",
    icon: "shield",
  },
  {
    title: "Space and occupant experience",
    description: "Connect room use, workplace changes, accessibility, comfort, cleaning, security, and service requests to location data.",
    href: "#space-and-occupants",
    cta: "Connect people and place",
    icon: "building",
  },
  {
    title: "Vendors and service partners",
    description: "Control scope, access, certificates, dispatch, performance, cost, warranty, and completed-work documentation.",
    href: "#vendors-and-service-partners",
    cta: "Manage vendor work",
    icon: "users",
  },
  {
    title: "Facility management software",
    description: "Evaluate CMMS, CAFM, IWMS, EAM, and point solutions against the workflows, integrations, and reporting you actually need.",
    href: "/learn/cmms",
    cta: "Compare system types",
    icon: "monitor",
  },
] as const;

export const FACILITY_MANAGEMENT_KPIS = [
  ["PM compliance", "Preventive work completed on time / preventive work due", "Scheduling discipline and audit readiness"],
  ["Urgent response time", "Time from accepted request to first qualified response", "How quickly the service model reacts"],
  ["Work-order cycle time", "Time from approval to verified completion", "End-to-end flow, including waiting"],
  ["Reactive work %", "Reactive labor hours / total maintenance labor hours", "How much capacity is controlled versus interrupted"],
  ["Backlog age", "Open approved work grouped by age and risk", "Whether risk is accumulating out of view"],
  ["Repeat work rate", "Repeat work on the same asset or issue / completed work", "Repair quality and unresolved root causes"],
  ["Cost by building or asset", "Labor + parts + vendor cost by service object", "Where operating expense and renewal risk concentrate"],
  ["Occupant service level", "Requests completed within the promised service level / eligible requests", "Reliability of the occupant experience"],
] as const;

export const FACILITY_MANAGEMENT_FAQS = [
  {
    q: "What is facility management?",
    a: "Facility management is the organizational function that coordinates people, place, and process in the built environment. In practice it covers operations, maintenance, safety, services, space, vendors, technology, and performance so facilities support the core organization.",
  },
  {
    q: "What is the difference between facility management and facility maintenance?",
    a: "Facility maintenance is the technical upkeep of buildings and equipment. Facility management is broader: it includes maintenance plus services, space, security, sustainability, workplace experience, sourcing, budgets, risk, and strategy.",
  },
  {
    q: "What software do facility managers use?",
    a: "A CMMS manages maintenance assets, work orders, preventive schedules, and history. CAFM and IWMS products add capabilities such as space, moves, leases, and workplace services. EAM platforms extend asset lifecycle and financial control. The right choice depends on the operating workflows and integrations in scope.",
  },
  {
    q: "Which facility management KPIs should a small team start with?",
    a: "Start with PM compliance, urgent response time, work-order cycle time, reactive-work percentage, backlog age by risk, repeat work, and cost by building or asset. Add space, energy, vendor, and occupant metrics only when those decisions have reliable data owners.",
  },
] as const;

export const FACILITY_MANAGEMENT_SOURCES = [
  {
    label: "International Facility Management Association: What is facility management?",
    url: "https://www.ifma.org/about/what-is-fm/",
  },
  {
    label: "ISO 41011:2024 facility management vocabulary",
    url: "https://www.iso.org/standard/82405.html",
  },
  {
    label: "OSHA: Hazard prevention and control, including preventive maintenance",
    url: "https://www.osha.gov/safety-management/hazard-prevention",
  },
] as const;
