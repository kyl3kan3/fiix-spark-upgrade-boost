export type SeoResource = {
  href: string;
  title: string;
  description: string;
};

export const FEATURED_DISCOVERY_RESOURCES: SeoResource[] = [
  {
    href: "/maintenance-simplified",
    title: "Maintenance simplified playbook",
    description: "A practical operating model for small maintenance teams.",
  },
  {
    href: "/blog/the-ultimate-guide-to-modern-work-order-management-in-2026",
    title: "Modern work order management guide",
    description: "A detailed guide to work-order design, adoption, and reporting.",
  },
  {
    href: "/learn/deferred-maintenance",
    title: "Deferred maintenance explained",
    description: "How to measure, prioritize, and reduce a maintenance backlog.",
  },
  {
    href: "/templates",
    title: "Free maintenance templates",
    description: "Download practical logs, checklists, and work-order spreadsheets.",
  },
];

export const SOLUTION_RESOURCES: Record<string, SeoResource[]> = {
  "preventive-maintenance-software": [
    {
      href: "/templates/preventive-maintenance-checklist",
      title: "Start with a preventive maintenance checklist",
      description:
        "Define the asset, task, frequency, acceptance criteria, owner, and next due date before automating the schedule.",
    },
    {
      href: "/learn/deferred-maintenance",
      title: "Prioritize deferred maintenance",
      description:
        "Separate routine backlog from work whose delay increases safety, downtime, compliance, or replacement risk.",
    },
    {
      href: "/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026",
      title: "Build an industrial PM plan",
      description:
        "Move from an asset audit to criticality ranking, scheduling, team rollout, and a repeatable review cycle.",
    },
  ],
  "work-order-software": [
    {
      href: "/templates/work-order-template",
      title: "Download a maintenance work-order template",
      description:
        "Use a complete request, assignment, scheduling, labor, parts, and close-out record as a starting point.",
    },
    {
      href: "/blog/the-ultimate-guide-to-modern-work-order-management-in-2026",
      title: "Read the work-order management guide",
      description:
        "Learn how to standardize the lifecycle, improve technician adoption, and turn completed work into useful history.",
    },
  ],
};
