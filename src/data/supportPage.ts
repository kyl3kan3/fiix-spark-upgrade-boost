export const SUPPORT_PAGE = {
  title: "MaintenEase Support — Get Help With Your CMMS",
  description:
    "Get MaintenEase support for accounts, billing, work orders, assets, preventive maintenance, imports, and product troubleshooting.",
  h1: "How can we help?",
  intro:
    "Find the right guide, open the signed-in Help Center, or email our team with the details we need to investigate quickly.",
  canonicalUrl: "https://maintenease.com/support",
  email: "support@maintenease.com",
  emailHref:
    "mailto:support@maintenease.com?subject=MaintenEase%20support%20request",
  updated: "2026-08-15",
} as const;

export const SUPPORT_TOPICS = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Set up your first assets, work orders, schedules, and team workflow.",
    href: "/maintenance-simplified",
    cta: "Read the quick-start playbook",
  },
  {
    id: "work-orders",
    title: "Work orders",
    description: "Learn how maintenance requests become assigned, trackable work.",
    href: "/learn/work-order",
    cta: "Explore work-order guidance",
  },
  {
    id: "preventive-maintenance",
    title: "Preventive maintenance",
    description: "Build repeatable schedules and move the team away from reactive work.",
    href: "/learn/preventive-maintenance",
    cta: "Review PM fundamentals",
  },
  {
    id: "imports",
    title: "Imports and templates",
    description: "Prepare clean asset, maintenance-log, and work-order data for setup.",
    href: "/templates",
    cta: "Download free templates",
  },
  {
    id: "account-billing",
    title: "Account and billing",
    description: "Review plan limits, included seats, trial details, and billing options.",
    href: "/pricing",
    cta: "View current plan details",
  },
  {
    id: "ai-integrations",
    title: "AI and integrations",
    description: "Understand the MaintenEase MCP server, authorization, and available tools.",
    href: "/mcp",
    cta: "Read integration details",
  },
] as const;

export const SUPPORT_REQUEST_CHECKLIST = [
  "The page or feature you were using",
  "What you expected to happen and what happened instead",
  "The approximate time of the issue and your time zone",
  "Any visible error message, with a screenshot when helpful",
  "Your browser and device type — but never your password",
] as const;

export const SUPPORT_FAQS = [
  {
    q: "How do I contact MaintenEase support?",
    a: `Email ${SUPPORT_PAGE.email} with a short description of the issue. Signed-in customers can also open the in-product Help Center for product guides and support options.`,
  },
  {
    q: "What should I include in a support request?",
    a: "Include the affected page or feature, what you expected, what happened, the approximate time and time zone, and any exact error message. A screenshot can help, but remove confidential information first.",
  },
  {
    q: "Can you help import our maintenance data?",
    a: "Yes. Free onboarding and data import are included with MaintenEase plans. Send a representative CSV or spreadsheet after removing secrets and sensitive personal information, and we will help map it into the product.",
  },
  {
    q: "Where can I reset my password?",
    a: "Use the Forgot password link on the MaintenEase sign-in page. The reset email is sent to the address associated with your account.",
  },
  {
    q: "How should I report a security concern?",
    a: `Email ${SUPPORT_PAGE.email} with “Security concern” in the subject. Share enough information for us to respond, but do not email passwords, access tokens, private keys, or other credentials.`,
  },
  {
    q: "Is MaintenEase support an emergency maintenance service?",
    a: "No. MaintenEase provides software support and does not monitor equipment or replace site emergency procedures. For an immediate safety, fire, medical, utility, or equipment hazard, follow your organization’s emergency plan and contact the appropriate local service.",
  },
] as const;
