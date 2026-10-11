export type SecondPassToolPage = {
  slug: "maintenance-sop-generator" | "root-cause-fishbone-generator" | "mtbf-calculator";
  path: string;
  /** Ancestor pages for the visible breadcrumb and BreadcrumbList JSON-LD. */
  breadcrumbs?: { label: string; href: string }[];
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
  {
    slug: "mtbf-calculator",
    path: "/tools/mtbf-calculator",
    breadcrumbs: [
      { label: "Learn", href: "/learn" },
      { label: "MTBF", href: "/learn/mtbf" },
    ],
    eyebrow: "Free reliability calculator",
    metaTitle: "MTBF Calculator: MTBF, MTTR & Availability (Free)",
    metaDescription:
      "Free MTBF calculator. Enter operating hours, failures, and repair downtime to get MTBF, MTTR, failure rate, and availability instantly. No signup.",
    h1: "MTBF calculator",
    intro:
      "Work out mean time between failures from operating hours and a failure count, or from a run schedule across several identical machines. Add repair downtime to get MTTR and availability. Results update as you type, and your numbers stay in your browser.",
    published: "2026-10-08",
    updated: "2026-10-08",
    sections: [
      {
        heading: "MTBF formula with a worked example",
        body: "MTBF = total operating time ÷ number of failures. A conveyor gearbox that ran 2,000 hours and failed 4 times has an MTBF of 500 hours. Count only time the asset was running or ready to run, and count only failures that stopped it and needed corrective work. Planned PM stops are not failures, so leave them out of the count.",
      },
      {
        heading: "Operating time versus calendar time",
        body: "Textbook MTBF uses operating hours. Calendar MTBF, the average number of days between failures, is easier to track and works well for trending a single asset, but the two are not interchangeable. A machine on one 8-hour weekday shift logs about 2,080 run hours a year, not 8,760, so the same failure history can produce numbers four times apart. Pick one basis per asset and compare like with like.",
      },
      {
        heading: "Turn the number into a maintenance decision",
        body: "MTBF says how often an asset fails; MTTR says how long each failure costs you. Together they give availability: MTBF ÷ (MTBF + MTTR). Track the trend per asset rather than chasing a target. A falling MTBF on one machine in a group of identical units flags a bad actor that deserves a root-cause review, a shorter PM interval, or a repair-versus-replace decision.",
      },
    ],
    faqs: [
      {
        q: "How do you calculate MTBF?",
        a: "Divide total operating time by the number of failures in the same period. For example, 2,000 operating hours with 4 failures gives an MTBF of 500 hours. Use the same window for both numbers and keep planned maintenance stops out of the failure count.",
      },
      {
        q: "How do you calculate MTBF for multiple machines?",
        a: "For identical machines in similar service, add their operating hours together, add their failures together, then divide. Three presses that each ran 1,000 hours with 6 failures between them have a pooled MTBF of 3,000 ÷ 6 = 500 hours. Pooling can hide one bad machine, so check each unit on its own as well.",
      },
      {
        q: "How do you calculate availability from MTBF and MTTR?",
        a: "Availability = MTBF ÷ (MTBF + MTTR). With an MTBF of 500 hours and an MTTR of 4.5 hours, availability is 500 ÷ 504.5 = 99.11%. This figure covers failure downtime only; planned maintenance, changeovers, and waiting on parts pull real-world availability lower.",
      },
      {
        q: "How do you convert MTBF to a failure rate?",
        a: "Failure rate is the inverse of MTBF: λ = 1 ÷ MTBF. An MTBF of 500 hours equals 0.002 failures per hour, or 2 failures per 1,000 operating hours. The conversion assumes a roughly constant failure rate, which fits random failures better than parts that wear out.",
      },
      {
        q: "What does the failure-free chance mean?",
        a: "It estimates the probability that the asset runs a chosen number of operating hours without a failure, using R(t) = e^(-t ÷ MTBF). At an MTBF of 500 hours, the chance of getting through the next 168 operating hours is about 71%. Treat it as a planning estimate for assets with random failures, not a guarantee for wear-out components.",
      },
      {
        q: "What is the difference between MTBF and MTTF?",
        a: "MTBF applies to repairable assets that go back into service after a fix, such as pumps, conveyors, and compressors. MTTF, mean time to failure, applies to items you replace rather than repair, such as belts, bulbs, and bearings, and describes their average life.",
      },
    ],
    related: [
      { label: "What MTBF measures and how to use it", href: "/learn/mtbf" },
      { label: "MTTR: what drives repair time", href: "/learn/mttr" },
      { label: "Maintenance KPI reference", href: "/learn/cmms-benchmarks-2026" },
      { label: "Root-cause fishbone generator", href: "/tools/root-cause-fishbone-generator" },
    ],
  },
];

export const getSecondPassToolPage = (slug: string | undefined) =>
  SECOND_PASS_TOOL_PAGES.find((page) => page.slug === slug);
