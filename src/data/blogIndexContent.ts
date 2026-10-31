/** Shared copy for the public blog index (React page + build-time prerender). */

export const BLOG_INDEX_META_DESCRIPTION =
  "Explore practical CMMS guides, preventive maintenance strategies, work order workflows, and facility operations insights from the MaintenEase team.";

export const BLOG_INDEX_INTRO_SECTIONS = [
  {
    heading: "What the MaintenEase blog covers",
    body:
      "These articles translate maintenance management concepts into workflows your team can run on the floor. You will find guidance on organizing corrective and preventive work, building useful asset histories, coordinating technicians and supervisors, and choosing metrics that show whether reliability is improving. The writing is aimed at maintenance managers, reliability leads, and facility operators—not only software buyers.",
  },
  {
    heading: "CMMS adoption and daily operations",
    body:
      "Several posts walk through computerized maintenance management system (CMMS) practices: structuring work orders, scheduling recurring preventive maintenance, capturing inspection results, and keeping parts and labor visible in one queue. We also explain terminology that appears in vendor comparisons so you can evaluate tools without wading through marketing jargon.",
  },
  {
    heading: "Preventive, predictive, and asset-focused topics",
    body:
      "Expect deep dives on preventive maintenance planning, prioritizing emerging equipment risk, reducing reactive firefighting, and connecting maintenance data to downtime conversations with leadership. Asset management themes include documenting equipment context, standardizing checklists, and preserving technician notes so the next repair starts with better information.",
  },
  {
    heading: "How to use these articles",
    body:
      "Browse the listing below for the topic that matches your current challenge—backlog control, PM cadence, request intake, or cost visibility. Each article links to related MaintenEase resources such as templates, glossary entries, and product pages when they add practical context. Check back as we publish new guides; the index updates as posts go live.",
  },
] as const;
