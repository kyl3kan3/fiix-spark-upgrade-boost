export type SecondPassToolPage = {
  slug: "maintenance-sop-generator" | "root-cause-fishbone-generator";
  path: string;
  eyebrow: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  published: string;
  updated: string;
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

export const SECOND_PASS_TOOL_PAGES: SecondPassToolPage[] = [
  {
    slug: "maintenance-sop-generator",
    path: "/tools/maintenance-sop-generator",
    eyebrow: "Free maintenance utility",
    metaTitle: "Maintenance SOP Generator: Free Word & PDF Template",
    metaDescription:
      "Create a maintenance SOP from the task, asset, hazards, PPE, tools, steps, and approval roles. Export an editable Word DOCX or printable PDF.",
    h1: "Maintenance SOP generator",
    intro:
      "Turn maintenance know-how into a reviewable standard operating procedure. Enter the job context and controls once, preview the result, then export an editable Word document or a field-ready PDF.",
    published: "2026-08-17",
    updated: "2026-08-17",
    sections: [
      {
        heading: "What a maintenance SOP should control",
        body: "A useful maintenance SOP defines the equipment and scope, who is qualified to do the work, hazards and energy-control requirements, required PPE and tools, ordered steps, acceptance criteria, escalation points, and the roles that review and approve changes.",
      },
      {
        heading: "Treat the generated file as a controlled draft",
        body: "The generator organizes information; it does not validate engineering, safety, regulatory, or manufacturer requirements. A qualified owner should verify the draft at the asset, resolve conflicts with OEM instructions and site programs, approve the revision, and control the issued copy.",
      },
      {
        heading: "Connect execution to maintenance records",
        body: "Attach the approved SOP to the asset or preventive-maintenance task. When a technician finds a failed acceptance criterion, create a corrective work order and preserve the inspection result, readings, photos, labor, parts, and close-out evidence in the asset history.",
      },
    ],
    faqs: [
      {
        q: "What is a maintenance SOP?",
        a: "A maintenance standard operating procedure is an approved, repeatable instruction for completing a maintenance task with defined scope, hazards, controls, steps, acceptance criteria, records, and responsibilities.",
      },
      {
        q: "Does this generator replace a safety review?",
        a: "No. It creates a structured draft from the information you enter. A qualified person must validate hazards, isolation requirements, PPE, technical steps, regulations, and manufacturer instructions before the SOP is issued or used.",
      },
      {
        q: "Can I edit the generated SOP?",
        a: "Yes. Export DOCX for an editable Word document or PDF for a stable review and field-use copy. Add your document-control number, revision history, signatures, and site-specific requirements before approval.",
      },
    ],
    related: [
      { label: "Preliminary hazard analysis template", href: "/templates/preliminary-hazard-analysis-template" },
      { label: "Work order software", href: "/solutions/work-order-software" },
      { label: "Preventive maintenance guide", href: "/learn/preventive-maintenance" },
    ],
  },
  {
    slug: "root-cause-fishbone-generator",
    path: "/tools/root-cause-fishbone-generator",
    eyebrow: "Free root-cause utility",
    metaTitle: "Maintenance Fishbone Diagram Generator (Free)",
    metaDescription:
      "Build a maintenance root-cause fishbone diagram with People, Machine, Method, Material, Measurement, and Environment categories. Export it as SVG.",
    h1: "Maintenance root-cause fishbone generator",
    intro:
      "Organize possible causes around a precise equipment problem before the investigation jumps to a favorite answer. Use maintenance-specific categories, refine the evidence with your team, and export a clean SVG for the work-order record or review meeting.",
    published: "2026-08-17",
    updated: "2026-08-17",
    sections: [
      {
        heading: "Start with a bounded problem statement",
        body: "Describe one observable outcome with an asset, location, time window, and consequence—for example, ‘Pump P-07 tripped on high vibration three times during loaded operation this week.’ Avoid writing a presumed cause into the problem statement.",
      },
      {
        heading: "Use the diagram to generate hypotheses, not conclusions",
        body: "The six categories help a cross-functional team look beyond the failed component. Capture candidate causes, then test them against readings, inspection evidence, work history, operating conditions, materials, procedures, and interviews before assigning a root cause.",
      },
      {
        heading: "Close the loop with corrective work",
        body: "Convert confirmed causes into corrective actions with an owner, due date, verification method, and linked work order. Recheck the failure mode after implementation so the team can distinguish a completed action from an effective one.",
      },
    ],
    faqs: [
      {
        q: "What is a fishbone diagram?",
        a: "A fishbone, Ishikawa, or cause-and-effect diagram groups possible causes around a defined problem so a team can investigate broadly before confirming root cause with evidence.",
      },
      {
        q: "What are the six maintenance fishbone categories?",
        a: "This generator uses People, Machine, Method, Material, Measurement, and Environment. Rename or reinterpret a category when the equipment and operating context require a better structure.",
      },
      {
        q: "Does a fishbone diagram prove root cause?",
        a: "No. It documents hypotheses. Confirm root cause with observations, tests, records, or other evidence, then verify that the corrective action prevents recurrence.",
      },
    ],
    related: [
      { label: "Root cause analysis guide", href: "/learn/root-cause-analysis" },
      { label: "Work order template", href: "/templates/work-order-template" },
      { label: "Asset management software", href: "/solutions/asset-management-software" },
    ],
  },
];

export const getSecondPassToolPage = (slug: string | undefined) =>
  SECOND_PASS_TOOL_PAGES.find((page) => page.slug === slug);
