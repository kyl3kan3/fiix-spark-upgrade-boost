export type Solution = {
 slug: string;
 updated: string;
 name: string;
 h1: string;
 tagline: string;
 metaTitle: string;
 metaDescription: string;
 intro: string;
 benefits: { title: string; body: string }[];
 features: { title: string; body: string }[];
 useCases: string[];
 faqs: { q: string; a: string }[];
};

export const solutions: Solution[] = [
 {
 slug: "work-order-software",
 updated: "2026-08-28",
 name: "Work Order Software",
 h1: "Work Order Software that turns requests into completed work",
 tagline: "Capture, assign, and close work orders without the spreadsheet sprawl.",
 metaTitle: "Work Order Software & Work Order Programs | MaintenEase",
 metaDescription: "Maintenance work order software for teams that outgrew spreadsheets: submit, assign, prioritize and close jobs from any device with photos, parts and costs.",
 intro:
 "Most work order programs start as a spreadsheet and become difficult to coordinate. MaintenEase replaces clipboards, email chains, and shared spreadsheets with one work order queue. Requests can arrive through the public portal or an internal form. Each work order records its asset or location, priority, assignee, dates, notes, attachments, labor, and parts so technicians and supervisors work from the same current record.",
 benefits: [
 { title: "Clear ownership", body: "Set priority, assignee, due date, and status on each work order so the team can see who owns the next action." },
 { title: "Traceable reporting", body: "Work-order dates, status, labor, parts, and asset history provide the inputs for backlog and repair reporting." },
 { title: "Lower-friction requests", body: "Staff or tenants can submit an issue through a public form without installing an app or receiving access to internal records." },
 ],
 features: [
 { title: "Responsive work orders", body: "Create, update, and close work orders from a phone or desktop browser, with notes and photo attachments." },
 { title: "Assignment and priority", body: "Supervisors can set the assignee, priority, status, and due date instead of relying on an unverified automatic-routing rule." },
 { title: "Parts and labor on every work order", body: "Track time, parts consumed, and total cost per work order, asset, and location." },
 { title: "Checklists and evidence", body: "Link recurring checklists and retain notes, attachments, and completion details alongside the maintenance record." },
 ],
 useCases: [
 "Manufacturing plants drowning in reactive breakdown calls",
 "Property managers handling resident maintenance requests",
 "Facility teams supporting multiple buildings or campuses",
 "Hospitality and retail chains coordinating across locations",
 ],
 faqs: [
 { q: "Does MaintenEase automatically route every work order?", a: "No automatic assignment rule is claimed here. A supervisor sets the assignee, priority, status, and due date, which keeps ownership explicit and reviewable." },
 { q: "Can requesters submit work without a MaintenEase login?", a: "Yes. A public request link lets staff or tenants submit an issue without creating an account. The maintenance team reviews the request in a separate inbox before converting accepted work into a work order." },
 { q: "Do you support recurring work orders?", a: "Yes. Any recurring task lives as a preventive maintenance schedule and generates work orders automatically." },
 { q: "What are work order programs?", a: "Work order programs are the software teams use to capture a maintenance request, assign it, track the work, and record what was done. Simple ones are little more than a shared list; a full maintenance work order software platform like MaintenEase also connects each job to an asset, its parts, its cost, and its service history." },
 { q: "How do I choose maintenance work order software?", a: "Test it against the five things that go wrong today — requests arriving by text, jobs with no owner, no parts cost, no history, and no proof of completion. Then check the mobile workflow, exports, plan limits, and the actual seat cost for the people who need access." },
 ],
 },
 {
 slug: "preventive-maintenance-software",
 updated: "2026-08-23",
 name: "Preventive Maintenance Software",
 h1: "Preventive Maintenance Software that stops failures before they cost you",
 tagline: "Turn recurring maintenance dates into visible, assigned work.",
 metaTitle: "Preventive Maintenance Software — Schedules & PM Compliance",
 metaDescription: "Preventive maintenance software for recurring calendar schedules, assigned work orders, checklists, asset history, overdue work, and PM reporting.",
 intro:
 "MaintenEase turns recurring maintenance from an isolated calendar reminder into assigned work with a completion record. Create calendar-based schedules against an asset, set the frequency and owner, and review the resulting work alongside notes, parts, attachments, and service history. Meter and condition readings can inform planning and predictive risk, but the current scheduler should not be described as a native meter-trigger engine.",
 benefits: [
 { title: "Fewer avoidable breakdowns", body: "Put recurring inspections and service on a visible schedule, then compare failures before and after each PM interval so the team can adjust the work based on its own history." },
 { title: "More visible workload", body: "Upcoming and overdue work gives supervisors a clearer view of the schedule before the day begins." },
 { title: "Reviewable records", body: "Completion dates, notes, attachments, checklists, labor, and parts can be retained with the work and asset history." },
 ],
 features: [
 { title: "Calendar schedules", body: "Create recurring work by day, week, month, or year and associate it with the relevant asset and owner." },
 { title: "Procedures and checklists", body: "Use work-order instructions and recurring checklists to capture steps, pass/fail items, notes, and attachments." },
 { title: "Documented completion", body: "Keep the due date, status, assignee, completion record, and supporting evidence together for later review." },
 { title: "Schedule health insights", body: "See which PMs are overdue, which assets keep failing between PMs, and where intervals should change." },
 ],
 useCases: [
 "Compliance-heavy facilities (healthcare, education, public sector)",
 "Manufacturing teams chasing a higher planned-to-reactive ratio",
 "Property managers managing recurring life-safety tasks",
 "Fleet operators coordinating recurring calendar inspections and service",
 ],
 faqs: [
 { q: "Can we import our existing maintenance data from a spreadsheet?", a: "Free onboarding and data-import help are included. Provide a representative file first so the team can confirm which asset, work-order, and schedule fields can be mapped without implying that every legacy format imports automatically." },
 { q: "What happens if a PM is missed?", a: "The due work remains visible with its date and status so supervisors can review and reassign it. Teams should define their own overdue and compliance rules rather than assume the software supplies a regulatory conclusion." },
 { q: "What is preventive maintenance software?", a: "Preventive maintenance software schedules recurring inspections and service against each asset, generates the work orders automatically when they come due, and records completion so PM compliance can be measured and audited." },
 { q: "How is preventive maintenance software different from a general CMMS?", a: "PM scheduling is one module inside a CMMS. MaintenEase ships both: the preventive schedules described here plus the asset register, work order queue, inspections, and reporting they depend on." },
 ],
 },
 {
 slug: "facility-maintenance-software",
 updated: "2026-08-23",
 name: "Facility Maintenance Software",
 h1: "Facility Maintenance Software for buildings that have to just work",
 tagline: "One system for assets, work orders, PMs, and tenant requests across every building.",
 metaTitle: "Facility Maintenance Software | Multi-Site Teams",
 metaDescription: "Facility maintenance software for multi-site teams: manage assets, work orders, PM schedules and occupant requests across every building in one system.",
 intro:
 "MaintenEase gives facility teams one system for locations, assets, work orders, recurring maintenance, checklists, vendors, and public requests. Register equipment against a building or room, attach relevant documents, schedule predictable work, and review activity by location without claiming a prebuilt compliance or building-automation package.",
 benefits: [
 { title: "Location-based visibility", body: "Organize sites, buildings, floors, and rooms so assets and work can be reviewed in their operating context." },
 { title: "Structured occupant intake", body: "Tenants or staff can submit standard or urgent requests through a public portal, while internal records remain behind the signed-in application." },
 { title: "More visible operating cost", body: "Work-order labor, parts, vendor records, and asset history provide a more consistent basis for reviewing repeat repairs and spend." },
 ],
 features: [
 { title: "Nested locations", body: "Portfolio → site → building → floor → room — assets and work orders inherit the hierarchy and roll up cleanly." },
 { title: "Vendor records", body: "Maintain vendor contacts and link service partners to the relevant assets or work instead of claiming purchasing or COI automation that has not been verified." },
 { title: "Occupant request portal", body: "A public link captures standard or urgent requests with description, location, contact details, and optional photos — no account required." },
 { title: "Inspections and evidence", body: "Build recurring checklists for the facility program and retain completion records. Qualified owners must still define the applicable code, interval, and acceptance criteria." },
 ],
 useCases: [
 "Corporate real estate and workplace teams",
 "Healthcare and life sciences facilities",
 "K–12 and higher education campuses",
 "Retail, hospitality, and restaurant chains",
 ],
 faqs: [
 { q: "Can we restrict what each building manager sees?", a: "MaintenEase applies company and role permissions. If site-by-site data partitioning is mandatory, validate that exact workflow before purchase; this page does not claim unverified location-level access controls." },
 { q: "Do you integrate with our building management system?", a: "Business includes API access, but MaintenEase does not publish a prebuilt BMS connector on this page. Validate the data source, authentication, trigger, field mapping, failure handling, and implementation scope for the specific system." },
 ],
 },
 {
 slug: "fleet-maintenance-software",
 updated: "2026-08-23",
 name: "Fleet Maintenance Software",
 h1: "Fleet Maintenance Software for service, inspections, and repair history",
 tagline: "Vehicle records, recurring service, inspections, parts, and repair history in one queue.",
 metaTitle: "Fleet Maintenance Software — Service, Inspections & History",
 metaDescription: "Fleet maintenance software for vehicle records, recurring calendar service, inspections, work orders, parts, cost, and repair history.",
 intro:
 "MaintenEase can treat each vehicle or mobile unit as an asset with its own location, work orders, recurring calendar service, inspection checklists, parts, costs, and repair history. Teams may record runtime and condition readings for risk review, but this page does not claim native telematics feeds, automatic odometer-triggered PMs, a dedicated DVIR module, or DOT compliance conclusions.",
 benefits: [
 { title: "One vehicle history", body: "Keep work orders, recurring service, inspection results, notes, parts, and cost against the relevant vehicle record." },
 { title: "Repeatable inspections", body: "Use mobile-friendly checklists for the inspections your qualified fleet program defines, with follow-up work for defects." },
 { title: "Repair-cost visibility", body: "Review recorded labor, parts, downtime, and repeat work before making repair-or-replace decisions." },
 ],
 features: [
 { title: "Vehicle asset records", body: "Store the vehicle name, serial or unit identifier, location, status, purchase date, attachments, and related maintenance history." },
 { title: "Calendar-based service", body: "Create recurring day-, week-, month-, or year-based work and review runtime or condition readings separately when available." },
 { title: "Mobile-friendly inspections", body: "Complete checklists from a phone, record notes or photos, and create corrective work when the result requires follow-up." },
 { title: "Parts and cost records", body: "Record parts and labor against repairs so the vehicle history contains the inputs needed for internal cost analysis." },
 ],
 useCases: [
 "Last-mile delivery and logistics fleets",
 "Service fleets (HVAC, plumbing, electrical contractors)",
 "Municipal fleets and public works",
 "Heavy equipment and construction yards",
 ],
 faqs: [
 { q: "Do you integrate with telematics providers?", a: "No prebuilt Samsara, Geotab, or other telematics connector is claimed here. Business includes API access, so a buyer can scope a custom integration only after validating the provider, fields, authentication, trigger logic, and implementation work." },
 { q: "Can drivers use this without a full MaintenEase license?", a: "Public requesters do not need a login, but staff who sign in to use MaintenEase count toward the plan's included seats. Business supports additional seats at $15 per month each; no separate reduced-price driver role is published." },
 { q: "What is fleet maintenance software?", a: "Fleet maintenance software organizes vehicle records, service schedules, inspections, repair history, parts, and cost. Products vary in telematics and regulatory-record support, so verify the exact workflow and jurisdiction before relying on a feature list." },
 { q: "Can I run fleet and facility maintenance in the same system?", a: "Yes. Vehicles, buildings, and production equipment are all assets in MaintenEase, so one team can run mixed fleets and facilities without a second subscription." },
 ],
 },
 {
 slug: "maintenance-request-portal",
 updated: "2026-08-23",
 name: "Maintenance Request Portal",
 h1: "A free, branded portal for customers to report problems",
 tagline: "Standard requests and an urgent lane — submissions enter a structured review inbox.",
 metaTitle: "Maintenance Request Portal — Free Public Form | MaintenEase",
 metaDescription: "Give tenants, staff, or the public a branded portal to report maintenance issues, attach photos, and flag an urgent request for review.",
 intro:
 "Every MaintenEase account includes a branded public request portal at maintenease.com/r/your-name. Share the link on a website, place it behind a printed code, or email it to tenants. Submitters choose a standard or urgent request, complete the protected form, and the request enters the team's review inbox — no app install or requester login required.",
 benefits: [
 { title: "Separate urgent intake", body: "Urgent submissions are visually distinct and notification delivery can use the configured channels for administrators and managers. The portal is not an emergency-dispatch service." },
 { title: "Stop drowning in email and texts", body: "Every request lands in one structured inbox with location, photos, and contact info. No more screenshots in group chats." },
 { title: "Use your organization identity", body: "The portal displays the organization's name and uploaded logo above the request form." },
 ],
 features: [
 { title: "Standard + urgent lanes", body: "Two clear buttons up top. The urgent lane is visually distinct and routes differently." },
 { title: "One-click convert to work order", body: "Triage in the inbox, then convert any request into a fully populated work order with location, contact info, and the right priority." },
 { title: "Organization name and logo", body: "The organization's name and uploaded logo appear at the top, with a configurable public URL slug." },
 { title: "Public — no login required", body: "Submitters can complete the form without an account or app install." },
 { title: "Protected public intake", body: "Length-capped fields, server-side validation, tenant-scoped authorization, and Turnstile help protect the public form." },
 { title: "Free on every plan", body: "Included with every MaintenEase plan — no extra cost per submission." },
 ],
 useCases: [
 "Property managers receiving tenant maintenance requests",
 "Facility teams collecting issues from staff across multiple buildings",
 "HOAs and condo associations fielding resident reports",
 "Schools and clinics where staff need a fast way to flag problems",
 ],
 faqs: [
 { q: "Is the portal really free?", a: "Yes. The public request portal is included on every MaintenEase plan, with no per-submission charges." },
 { q: "Can I customize the URL?", a: "Yes. Each company can use a unique slug such as /r/acme-facilities and manage it from settings." },
 { q: "How do urgent alerts work?", a: "The urgent option creates a visibly urgent request and invokes the configured notification workflow for administrators and managers. Delivery depends on valid recipients, channel configuration, and provider availability; it is not a substitute for emergency services." },
 { q: "Do submitters need a MaintenEase account?", a: "No. The portal is fully public. Anyone with the link can submit a request." },
 ],
 },
 {
 slug: "asset-tracking-software",
 updated: "2026-08-23",
 name: "Asset Tracking Software",
 h1: "Asset Tracking Software for equipment records and locations",
 tagline: "Searchable equipment records, locations, printable labels, and maintenance history.",
 metaTitle: "Asset Tracking Software — Records, Labels & Locations",
 metaDescription: "Asset tracking software with searchable equipment records, nested locations, printable Code 128 labels, attachments, and maintenance history.",
 intro:
 "MaintenEase gives each asset a searchable record with a name, serial number, model, location, status, purchase date, attachments, work orders, and related maintenance history. Teams can generate printable Code 128 setup-sheet labels from an asset identifier. This page does not claim public QR access, custody-transfer logs, or automatic disposal tracking that the product does not currently verify.",
 benefits: [
 { title: "Find equipment quickly", body: "Search by name or serial number and browse the location hierarchy to reach the relevant asset record." },
 { title: "Keep location current", body: "Assign each asset to a location and update that record when equipment moves, without implying a separate custody-ledger feature." },
 { title: "Service history tied to the asset", body: "Related work orders, recurring work, inspections, and recorded parts remain available from the asset history as the location record changes." },
 ],
 features: [
 { title: "Printable asset labels", body: "Generate a setup-sheet PDF with a Code 128 barcode based on the asset serial number or ID for use in the team's labeling workflow." },
 { title: "Nested locations", body: "Portfolio → site → building → floor → room. Assets inherit the hierarchy, and reports roll up cleanly at every level." },
 { title: "Asset hierarchy", body: "Link parent and child assets and place equipment in nested locations so related records stay easier to navigate." },
 { title: "Documents and photos", body: "Attach manuals, photos, purchase records, or warranty documents without claiming an unverified warranty-alert engine." },
 { title: "Bulk import and CSV export", body: "Import a supported asset-register spreadsheet with mapping help. Export filtered records for authorized internal or external review." },
 { title: "Maintenance and risk history", body: "Review related work, downtime, cost inputs, and — on eligible plans — the explainable risk score and remaining-useful-life estimate as planning aids rather than guarantees." },
 ],
 useCases: [
 "Facility teams managing thousands of fixed assets across multiple buildings",
 "IT and operations teams tracking laptops, tools, and shared equipment",
 "Manufacturers tracking machines, tooling, and spare parts",
 "Schools, clinics, and labs tracking regulated or high-value equipment",
 ],
 faqs: [
 { q: "Do I need special hardware for asset labels?", a: "MaintenEase can generate printable Code 128 labels in a setup-sheet PDF. Confirm the scanner or phone workflow you plan to use; this page does not claim a public no-login asset page." },
 { q: "Can I import my existing asset list?", a: "Yes. CSV import is supported, and our team will help map columns and locations on the first import." },
 { q: "Which barcode format is generated?", a: "The current setup-sheet generator creates Code 128 barcode images from the asset serial number or ID. It does not claim a second QR-label workflow here." },
 ],
 },
 {
 slug: "asset-management-software",
 updated: "2026-08-23",
 name: "Asset Management Software",
 h1: "Asset Management Software that turns your asset register into a working system",
 tagline: "Register, schedule, maintain, and report on every asset — in one place.",
 metaTitle: "Asset Management Software for Maintenance Teams",
 metaDescription: "Asset management software with equipment records, locations, attachments, recurring work, parts, costs, maintenance history, and risk prioritization.",
 intro:
 "MaintenEase is asset management software for the teams who maintain physical equipment. Register each asset with core identifiers, location, status, purchase date, hierarchy, photos, and attachments. Connect recurring calendar work, corrective work orders, parts, labor, cost, and predictive-risk records so the asset register supports day-to-day maintenance decisions.",
 benefits: [
 { title: "One source of truth", body: "Every asset, every work order, every PM, every part — in one place. No more reconciling spreadsheets at month-end." },
 { title: "Better-supported capital decisions", body: "Use recorded work, cost, downtime, repeat failures, and risk factors as inputs to repair-or-replace review." },
 { title: "Reviewable history", body: "Keep asset details, attachments, and maintenance activity together so an authorized reviewer can trace the available record." },
 ],
 features: [
 { title: "Core asset register", body: "Capture name, model, serial number, purchase date, location, status, hierarchy, description, image, and attachments." },
 { title: "Recurring work per asset", body: "Create calendar-based recurring work and checklists against the equipment record; do not assume native meter-trigger scheduling." },
 { title: "Work orders and parts", body: "Every repair, inspection, and part swap is recorded against the asset — building a complete service history." },
 { title: "Documents and history", body: "Attach warranty or contract documents and review related work without claiming an automatic renewal-alert feature." },
 { title: "Cost and reliability inputs", body: "Record labor, parts, downtime, repair frequency, and risk factors for internal reporting; finance owns depreciation policy." },
 { title: "Company and role permissions", body: "Use the application's tenant and role controls, and validate any site-specific access requirement before rollout." },
 ],
 useCases: [
 "Manufacturers managing production equipment and tooling",
 "Facility teams tracking HVAC, electrical, and life-safety assets",
 "Healthcare and life sciences managing regulated equipment",
 "Property and real estate teams managing portfolio-wide asset registers",
 ],
 faqs: [
 { q: "How is this different from a CMMS?", a: "Asset management is one of the core capabilities of a CMMS. MaintenEase is a full CMMS — asset management, work orders, PMs, parts, and reporting — sold under whichever name fits how you think about the problem." },
 { q: "Can I track depreciation?", a: "The current core asset record does not publish a built-in straight-line depreciation report. Use exported maintenance and asset data with the approved values and useful-life rules in your finance system." },
 { q: "Does it work for non-physical assets?", a: "MaintenEase is designed around maintainable physical equipment. Do not rely on this page as a claim for software-license, certification, contract-renewal, or non-physical-asset workflows without validating them first." },
 ],
 },
];

export const getSolution = (slug: string) => solutions.find((s) => s.slug === slug);
