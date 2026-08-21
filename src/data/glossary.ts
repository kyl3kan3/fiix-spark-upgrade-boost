import { emergingAiGlossary } from "./emergingAiGlossary";

export type GlossaryTerm = {
 slug: string;
 term: string;
 short: string;
 metaTitle: string;
 metaDescription: string;
 image?: { src: string; alt: string };
 published?: string;
 updated?: string;
 sections: {
 heading: string;
 body: string;
 /** Optional comparison table rendered under the section body. */
 table?: { caption?: string; headers: string[]; rows: string[][] };
 }[];
 faqs: { q: string; a: string }[];
 related: string[];
 internalLinks?: { label: string; href: string }[];
 sources?: { label: string; url: string }[];
};

export const glossary: GlossaryTerm[] = [
 {
 slug: "cmms",
 term: "Maintenance Management Systems (CMMS): Complete Buyer's Guide",
 short: "Maintenance management systems centralize work orders, assets, inspections, and preventive schedules so teams can plan, execute, and measure maintenance in one system of record.",
 metaTitle: "Maintenance Management Systems (CMMS): Buyer's Guide",
 metaDescription: "Compare maintenance management systems and CMMS software. Learn core modules, selection criteria, implementation steps, costs, and the KPIs to track.",
 published: "2026-01-15",
 updated: "2026-08-16",
 sections: [
 {
 heading: "What does CMMS stand for?",
 body: "CMMS stands for Computerized Maintenance Management System. The CMMS meaning in plain English: software that acts as the system of record for everything a maintenance team does — every asset they look after, every work order they raise, every inspection they complete, and every preventive task that comes due. Before CMMS software existed, this information lived in clipboards, whiteboards, and a tangle of spreadsheets. A modern CMMS replaces all of that with one searchable place that the whole team works from. When people say \"a CMMS\", \"CMMS software\", or \"a CMMS system\", they mean the same thing.",
 },
 {
 heading: "CMMS meaning in plain English",
 body: "CMMS meaning: a CMMS (computerized maintenance management system) is software that tracks work orders, assets, and preventive maintenance in one place. In practice, a CMMS system replaces the spreadsheet and the whiteboard. It gives each asset an identity, location, and service history; attaches breakdowns, inspections, requests, and recurring work to that asset; and records every status change as technicians complete work. Over time, the system produces the reporting maintenance managers need: backlog, PM compliance, mean time to repair, cost per asset, and which equipment is quietly consuming the budget.",
 },
 {
 heading: "What does a CMMS actually do?",
 body: "Most CMMS platforms cover four core jobs. First, an asset registry: every machine, building, vehicle, or piece of equipment with its location, manuals, photos, and service history. Second, work orders: create, assign, prioritize, complete, and close them with a full audit trail. Third, preventive maintenance: recurring schedules that automatically generate work orders by date, meter reading, or runtime. Fourth, reporting: how many work orders are open, which assets fail most often, mean time between failures, technician throughput.",
 table: {
 caption: "The four core modules of a CMMS system",
 headers: ["Module", "What it holds", "The question it answers"],
 rows: [
 ["Asset registry", "Equipment, location, manuals, warranty, service history", "What do we own and how has it behaved?"],
 ["Work orders", "Requests, assignments, priority, parts, labor, photos", "Who is doing what, and is it done?"],
 ["Preventive maintenance", "Recurring schedules by date, meter, or runtime", "What is due before it breaks?"],
 ["Reporting", "Backlog, PM compliance, MTTR, MTBF, cost per asset", "Are we getting better or worse?"],
 ],
 },
 },
 {
 heading: "Types of CMMS systems",
 body: "CMMS systems fall into a few recognizable shapes. Cloud-based (SaaS) CMMS software is hosted by the vendor, updated continuously, and reached from a browser or mobile app — this is what most teams buy today. On-premise CMMS runs on servers you own, which some regulated or air-gapped sites still require. Mobile-first CMMS platforms are built around the technician's phone rather than a desk. Open-source and free CMMS tools remove the license cost but shift hosting, security, and support onto you. Finally, AI-native or agentic CMMS platforms add predictive scoring and let authorized AI assistants retrieve records or draft work orders under the same permissions a person has.",
 },
 {
 heading: "Who needs a CMMS?",
 body: "Any team responsible for physical assets benefits from a CMMS — manufacturing plants, facility managers, property managers, fleet operators, hospitals, schools, hotels, and municipal operations. The threshold is usually not company size but asset complexity. If you maintain more than a handful of assets, preventive work keeps slipping, or compliance audits require service history, a CMMS pays for itself quickly through avoided downtime alone.",
 },
 {
 heading: "CMMS vs EAM vs FSM",
 body: "A CMMS focuses on maintenance operations. An EAM (Enterprise Asset Management) system covers the full lifecycle of an asset, including procurement, depreciation, and disposal — it overlaps heavily with finance. FSM (Field Service Management) is geared toward dispatching technicians to customer sites and handling billing. Many teams start with a CMMS and only graduate to EAM or FSM when their needs clearly outgrow it.",
 table: {
 caption: "CMMS vs EAM vs FSM at a glance",
 headers: ["", "CMMS", "EAM", "FSM"],
 rows: [
 ["Primary focus", "Maintaining assets you own", "Whole asset lifecycle incl. finance", "Dispatching techs to customers"],
 ["Typical buyer", "Maintenance / facilities manager", "Operations + finance + IT", "Service business owner"],
 ["Core objects", "Assets, work orders, PM schedules", "Assets, capital plans, depreciation", "Jobs, customers, invoices"],
 ["Usual cost", "Lowest", "Highest", "Mid"],
 ["Good starting point?", "Yes for most teams", "Only when finance needs it", "Only if you bill customers"],
 ],
 },
 },
 {
 heading: "How to choose CMMS software",
 body: "Start from the work, not the feature list. Write down the five things that go wrong most often today — PMs slipping, no service history, requests arriving by text message, unknown parts spend — and test each shortlisted product against those five. Then check three practical constraints: whether technicians will actually use it on a phone, whether your existing asset list can be imported without re-keying, and how the pricing behaves when you add a seasonal helper or a supervisor who only reads reports. Per-user pricing quietly punishes both. Finally, run a two-week pilot on one site or one asset class before rolling out everywhere.",
 },
 {
 heading: "Maintenance management system evaluation checklist",
 body: "Require each vendor to demonstrate the same real workflow: submit a request, approve it, attach it to an asset, assign it on mobile, record labor and parts, close it, and find the history again. Confirm recurring schedules, meter triggers, inspection evidence, role permissions, exports, implementation support, API access, support hours, and the exact cost at today's and next year's headcount. A feature is only useful when the people doing the work can complete it quickly and managers can retrieve the resulting record later.",
 table: {
 caption: "Questions to answer before selecting a maintenance management system",
 headers: ["Decision area", "Evidence to request", "Common warning sign"],
 rows: [
 ["Technician workflow", "A complete work order on the actual mobile experience", "The demo relies on administrator screens"],
 ["Preventive maintenance", "Time, meter, and completion-based schedules", "Recurring tasks cannot be audited or adjusted"],
 ["Data portability", "Sample import and a full export in a usable format", "Migration depends on manual re-entry"],
 ["Reporting", "Backlog, PM compliance, MTBF, MTTR, and cost by asset", "Reports require a higher tier not included in the quote"],
 ["Pricing", "Written seat, capacity, add-on, and implementation costs", "The quote omits likely users or required modules"],
 ],
 },
 },
 {
 heading: "A practical 30-day CMMS rollout",
 body: "In week one, clean the asset list and agree on locations, priorities, statuses, and required close-out fields. In week two, import one site or asset class and build the highest-risk preventive schedules. In week three, train technicians on a small number of mobile workflows and run real work in the system. In week four, reconcile the backlog, correct data issues, publish a basic KPI baseline, and decide what to expand next. A focused rollout creates usable history faster than attempting to configure every possible field before launch.",
 },
 ],
 faqs: [
 { q: "What is a CMMS in simple terms?", a: "A CMMS is software that keeps a list of your equipment and manages the work done on it — repairs, inspections, and recurring preventive tasks — so nothing depends on someone's memory or a spreadsheet." },
 { q: "What does CMMS stand for?", a: "CMMS stands for Computerized Maintenance Management System." },
 { q: "What are CMMS systems used for?", a: "CMMS systems are used to register assets, capture and assign work orders, schedule preventive maintenance by date or meter reading, record parts and labor costs, and report on backlog, PM compliance, MTTR, and MTBF." },
 { q: "Is a CMMS the same as a maintenance management system?", a: "Usually, yes. Maintenance management system and maintenance management software are broad plain-English terms; CMMS is the established acronym for software that manages assets, work orders, preventive schedules, and maintenance reporting." },
 { q: "What is the difference between a CMMS and an ERP?", a: "An ERP runs the business — finance, purchasing, HR. A CMMS runs maintenance in operational detail. Many teams integrate the two so parts purchases and asset costs flow into the ERP while day-to-day maintenance stays in the CMMS." },
 { q: "Do I need a CMMS if I only have a few assets?", a: "Probably not. Once you cross roughly 20–30 assets, or once preventive work routinely slips past its due date, the math usually flips in favor of a CMMS." },
 { q: "How much does a CMMS cost?", a: "Pricing models vary by vendor, tier, users, modules, and services. MaintenEase publishes account plans with included seats; Business charges $15 per month for each additional seat after the four included seats. Run your actual headcount and capacity through the CMMS cost calculator before committing." },
 { q: "Is there a free CMMS?", a: "Yes — some vendors offer limited free tiers, and open-source CMMS software exists. Free tiers usually cap users, assets, or reporting, and open-source shifts hosting, updates, and security onto your team, so weigh the total cost rather than the license price." },
 ],
 related: ["agentic-cmms", "preventive-maintenance", "work-order", "mro", "deferred-maintenance", "cmms-roi"],
 internalLinks: [
 { label: "preventive maintenance guide", href: "/learn/preventive-maintenance" },
 { label: "facility management guide", href: "/facility-management" },
 { label: "work order template for Word and Sheets", href: "/templates/work-order-template" },
 { label: "work order software", href: "/solutions/work-order-software" },
 { label: "MaintenEase vs UpKeep", href: "/compare/maintenease-vs-upkeep" },
 { label: "MaintenEase vs MaintainX", href: "/compare/maintenease-vs-maintainx" },
 { label: "MaintenEase vs Limble", href: "/compare/maintenease-vs-limble" },
 { label: "asset tracking software", href: "/solutions/asset-tracking-software" },
 ],
 },
 {
 slug: "agentic-cmms",
 term: "Agentic CMMS: AI Agents for Maintenance Workflows",
 short: "A CMMS that lets authorized AI agents retrieve maintenance data and complete workflow steps, such as reviewing requests or creating work orders, while preserving permissions and human oversight.",
 metaTitle: "What Is an Agentic CMMS? AI Agents, MCP & Maintenance",
 metaDescription: "Learn how an agentic CMMS uses AI and MCP to review assets, requests, and work orders and complete authorized maintenance workflow steps safely.",
 published: "2026-08-03",
 updated: "2026-08-03",
 sections: [
 {
 heading: "What is an agentic CMMS?",
 body: "An agentic CMMS is maintenance software that lets an authorized AI assistant complete defined workflow steps, not merely answer questions. Depending on its permissions, the agent can retrieve asset records, review open work orders, inspect incoming maintenance requests, or create a new work order. The CMMS remains the system of record: user identity, company access, validation rules, and audit history still govern every action. The practical difference is that people can describe an outcome in plain language while the agent handles the searching, filtering, and data entry needed to prepare it.",
 },
 {
 heading: "Agentic CMMS vs a traditional CMMS",
 body: "A traditional CMMS waits for a person to open the right screen, find the right record, and fill in each field. An agentic CMMS exposes the same controlled operations to an AI interface. A supervisor might ask for urgent work orders at a specific building, then ask the agent to create a follow-up order for the affected asset. The underlying workflow is still structured, but the interface becomes conversational and task-oriented. This can reduce administrative work without replacing the approvals, permissions, and maintenance judgment that keep physical operations safe.",
 },
 {
 heading: "Agent vs chatbot vs predictive maintenance",
 body: "These terms describe different capabilities. A chatbot explains information or drafts text. An agent can call approved tools to retrieve records or carry out a defined software action. Predictive maintenance analyzes condition readings and failure history to estimate which equipment is at risk. They can work together, but they are not interchangeable: a predictive model may flag a pump, an agent may retrieve its history and prepare a work order, and a maintenance professional decides what physical work is appropriate. Keeping those boundaries clear prevents ordinary automation from being presented as autonomous maintenance.",
 },
 {
 heading: "Where Model Context Protocol fits",
 body: "Model Context Protocol, usually shortened to MCP, is a standard way for AI applications to discover and use tools supplied by another system. A CMMS MCP server can describe operations such as list work orders, find assets, or create a work order using machine-readable input rules. The AI client does not need to understand the CMMS database or imitate clicks in a browser. It calls a narrowly defined tool, and the server applies authentication and application rules. That separation makes MCP especially useful for connecting maintenance data to AI clients while keeping the CMMS in control of access.",
 },
 {
 heading: "Five practical agentic maintenance workflows",
 body: "The most useful early workflows are administrative and reversible. An agent can summarize overdue or urgent work orders, locate an asset and its service record, review the maintenance-request inbox, group open work by location, or prepare a work order from a clearly described issue. These tasks consume planner time but do not require an AI system to diagnose equipment or make a safety-critical decision. A sensible rollout starts with read-only retrieval, measures whether the answers are accurate, and adds write actions only after the team has defined confirmation and review expectations.",
 },
 {
 heading: "How MaintenEase exposes maintenance tools",
 body: "MaintenEase includes an OAuth-authenticated MCP service for authorized accounts. Its current tool set can list work orders with an optional status filter, list assets, list tracked locations, read incoming maintenance requests, and create a work order with a title, description, priority, due date, and optional asset. Requests run as the signed-in user and use the same tenant-scoped data access as the application. This is a working product interface rather than a hypothetical AI feature, so teams can begin with focused workflows instead of handing an agent unrestricted database access.",
 },
 {
 heading: "A real example: request to work order",
 body: "Consider a facilities supervisor starting the day with: 'Show the newest maintenance requests and the urgent open work orders.' The agent can retrieve both lists and present a concise operational view. The supervisor can then say: 'Create a high-priority work order for the leaking pump request and associate it with Pump P-04.' The AI client maps that instruction to the CMMS tool's structured fields. Before the action is submitted, the client should show the proposed title, priority, asset, and due date so the supervisor can catch an incorrect match.",
 },
 {
 heading: "Authentication and tenant isolation",
 body: "An AI integration should never bypass the boundaries already enforced by the maintenance system. MaintenEase authenticates its MCP users through OAuth and sends their access token with data requests. Database row-level security then limits results to the signed-in user's company. This matters in a multi-tenant CMMS because a useful natural-language interface must not become a broader data-access path. Tokens should be treated like other application credentials, write tools should use the narrowest necessary inputs, and administrators should be able to remove access when an integration is no longer needed.",
 },
 {
 heading: "Human oversight and safe write actions",
 body: "Agentic does not have to mean autonomous. Read-only tools can usually run with low risk, while actions that change the system should be visible and intentional. A good AI client previews the exact work order it is about to create, asks for confirmation when the request is ambiguous, and reports the resulting record identifier. Maintenance teams should require human judgment for safety classification, shutdown decisions, regulatory conclusions, and instructions that could put a technician or asset at risk. The agent handles system work; qualified people remain responsible for maintenance decisions and physical execution.",
 },
 {
 heading: "What to evaluate before adopting an agentic CMMS",
 body: "Start with five questions. Does the integration authenticate individual users rather than share one master credential? Are records restricted to the correct company and role? Can administrators distinguish read tools from write tools? Does every created record retain its normal CMMS history? Can the team verify an agent's output before acting on it? Then test a small workflow with non-critical data. Accuracy, adoption, and time saved matter more than the number of AI features on a pricing page. If the system cannot explain what it can access and what it changed, it is not ready for operational use.",
 },
 {
 heading: "A practical implementation sequence",
 body: "Begin with a read-only pilot for one supervisor: open-work summaries, asset lookup, and request-inbox review. Compare the agent's results against the CMMS for two weeks and document common ambiguities such as duplicate asset names. Next, standardize asset naming and required work-order fields. Add one confirmation-gated write workflow, normally work-order creation, and review every result. Only expand to more users or tools after the audit trail and permissions behave as expected. This staged approach produces useful automation early while protecting the quality of the maintenance data that future AI and predictive models depend on.",
 },
 ],
 faqs: [
 { q: "What does agentic CMMS mean?", a: "It means a CMMS can expose authorized tools that let an AI agent retrieve maintenance records and complete defined software actions, rather than only generate conversational answers." },
 { q: "Is an agentic CMMS the same as predictive maintenance?", a: "No. Predictive maintenance forecasts equipment risk from condition and failure data. An agentic CMMS uses software tools to retrieve information or complete workflow steps. The two capabilities can work together." },
 { q: "What is a CMMS MCP server?", a: "A CMMS MCP server publishes structured maintenance tools through the Model Context Protocol so compatible AI clients can use them after authentication without direct database access or browser automation." },
 { q: "Can ChatGPT or Claude create maintenance work orders?", a: "They can when connected to an authenticated CMMS tool that permits work-order creation. The integration should preserve user permissions and show the proposed action for confirmation when appropriate." },
 { q: "Should AI be allowed to approve safety-critical maintenance?", a: "No. AI can organize information and prepare records, but qualified people should retain responsibility for safety classification, shutdown decisions, regulatory conclusions, and physical maintenance instructions." },
 ],
 related: [
 "ai-maintenance-assistant",
 "cmms-for-chatgpt",
 "maintenance-mcp-server",
 "ai-work-order-automation",
 "equipment-risk-scoring",
 "predictive-maintenance-without-sensors",
 "maintenance-request-qr-codes",
 "ai-native-cmms",
 "agentic-maintenance-workflows",
 ],
 sources: [
 { label: "Rockwell Automation and Augury agentic AI announcement (July 23, 2026)", url: "https://www.rockwellautomation.com/en-us/company/news/press-releases/rockwell-automation-and-augury-partner-to-improve-industrial-performance-with-agentic-ai.html" },
 { label: "Fiix Maintenance Assistant Experience (MAX) announcement (July 14, 2026)", url: "https://fiixsoftware.com/blog/fiix-max/" },
 { label: "Facilio AI-native CMMS announcement (July 1, 2026)", url: "https://www.prnewswire.com/news-releases/facilio-ushers-in-the-ai-native-era-of-cmms-302815869.html" },
 ],
 },
 {
 slug: "preventive-maintenance",
 term: "Preventive Maintenance: Complete Guide, Schedule, Examples, and Templates",
 short: "Preventive maintenance is planned work performed before functional failure, triggered by time, usage, condition findings, or asset risk to reduce avoidable downtime and preserve equipment performance.",
 metaTitle: "Preventive Maintenance Guide: Schedule, Examples & Templates",
 metaDescription: "Build a preventive maintenance program with scheduling methods, industry examples, implementation steps, a labor calculator, checklist, and free templates.",
 image: { src: "/images/guides/preventive-maintenance.png", alt: "Preventive maintenance calendar connected to work and asset history" },
 published: "2026-01-15",
 updated: "2026-08-16",
 sections: [
 {
 heading: "Preventive maintenance definition",
 body: "Preventive maintenance (PM) is planned inspection, servicing, adjustment, or replacement performed before an asset reaches functional failure. The trigger may be a calendar interval, operating hours, mileage, production cycles, a condition reading, or a risk review. PM is not simply 'maintenance done early': each task needs a defined asset, trigger, procedure, acceptance criterion, owner, and completion record so the team can determine whether the work is preventing the failure mode it targets.",
 },
 {
 heading: "Preventive vs predictive vs reactive maintenance",
 body: "Preventive maintenance acts at a planned interval before failure. Predictive maintenance estimates when failure risk is rising from condition and history, while reactive maintenance begins after the asset can no longer perform its required function. A sound strategy uses all three deliberately: preventive work for age- or usage-related failure modes, predictive or condition-based work when a measurable signal exists, and run-to-failure only for low-consequence items that are inexpensive and quick to replace.",
 table: {
 caption: "How common maintenance strategies differ",
 headers: ["Strategy", "Work trigger", "Best fit", "Example"],
 rows: [
 ["Preventive", "Time, meter, or planned interval", "Known wear, required inspections, stable service intervals", "Replace an air filter every 90 days"],
 ["Predictive", "Forecast from condition trends and history", "Critical assets with useful failure signals", "Plan a bearing change from vibration trend"],
 ["Condition-based", "Measured value crosses a limit", "Assets that can be inspected or monitored", "Create work when pressure drop exceeds the limit"],
 ["Reactive", "Functional failure", "Low-risk, non-critical, replaceable items", "Replace a non-critical lamp after it fails"],
 ],
 },
 },
 {
 heading: "How to implement a preventive maintenance program",
 body: "Start with a controlled scope instead of scheduling every asset at once. First, inventory assets and normalize their names and locations. Second, rank criticality by safety, service, production, environmental, and cost consequences. Third, identify the failure modes worth preventing. Fourth, choose a task and trigger that can detect or reduce each failure mode. Fifth, write a short procedure with pass/fail criteria, tools, parts, and safety requirements. Sixth, load the schedule and assign ownership. Seventh, review findings, overdue work, emergency failures, and labor demand each month, then change intervals only when the evidence supports it.",
 },
 {
 heading: "Four ways to schedule preventive maintenance",
 body: "Use the trigger that most closely represents exposure to the failure mode. Calendar schedules are simple but can over-maintain assets with variable usage. Meter schedules follow actual use. Condition triggers respond to what technicians or sensors observe. Risk-based schedules set tighter controls where the consequence of failure is higher, even when two assets are otherwise similar. Regulatory, code, warranty, and manufacturer requirements remain minimum constraints; operational history helps refine the schedule beyond them.",
 table: {
 caption: "Preventive maintenance scheduling methods",
 headers: ["Method", "Trigger example", "Use when", "Watch for"],
 rows: [
 ["Time-based", "Every 30, 90, or 365 days", "Exposure is steady or an inspection is required by date", "Seasonality and duplicate work"],
 ["Meter-based", "Every 500 runtime hours or 5,000 miles", "Wear follows equipment use", "Missing or late meter readings"],
 ["Condition-based", "Temperature, vibration, pressure, wear, or inspection result", "A measurable condition indicates deterioration", "Thresholds without an action rule"],
 ["Risk-based", "Criticality score and failure consequence", "Resources must be concentrated on the most consequential assets", "Ignoring low-cost quick wins or new risks"],
 ],
 },
 },
 {
 heading: "How to choose a maintenance frequency",
 body: "Begin with the strictest applicable requirement from regulation, code, warranty, manufacturer guidance, or internal engineering standards. Then compare the interval with operating hours, environment, duty cycle, redundancy, and failure history. Shorten the interval when failures occur between services, findings repeatedly exceed limits, or consequence is unacceptable. Consider lengthening it when several cycles produce no actionable findings and the risk remains controlled. Record the reason, approver, effective date, and next review so frequency changes are auditable rather than informal.",
 table: {
 caption: "Evidence for adjusting a PM interval",
 headers: ["Observed pattern", "Likely action", "Evidence to preserve"],
 rows: [
 ["Failure occurs before the next PM", "Shorten interval or redesign the task", "Failure code, elapsed time, work history"],
 ["Repeated defect at the same inspection point", "Improve the task, training, or underlying design", "Finding, measurement, corrective work"],
 ["No finding across several cycles", "Review for safe extension or elimination", "Completed checks, operating exposure, risk approval"],
 ["Usage varies substantially", "Move from calendar to meter trigger", "Runtime, mileage, cycles, or production volume"],
 ],
 },
 },
 {
 heading: "Preventive maintenance examples by industry",
 body: "The program structure stays consistent across industries even though assets and triggers change. Each example below connects a failure mode to a specific trigger and a record that can be reviewed later.",
 table: {
 caption: "Examples for facilities, fleets, manufacturing, and commercial buildings",
 headers: ["Environment", "Asset and task", "Typical trigger", "Completion evidence"],
 rows: [
 ["Facilities", "Emergency generator load test and fuel-system inspection", "Monthly test plus runtime-based service", "Readings, exceptions, technician, corrective order"],
 ["Fleet", "Engine oil and filter service", "Mileage, engine hours, or oil-life reading", "Odometer, parts, service date, next due"],
 ["Manufacturing", "Conveyor drive inspection and lubrication", "Operating hours with weekly visual checks", "Condition finding, lubrication quantity, follow-up work"],
 ["Commercial building", "Air-handling-unit filter and belt inspection", "Pressure drop plus seasonal calendar review", "Pressure reading, belt condition, filter used"],
 ],
 },
 },
 {
 heading: "Plan preventive maintenance labor capacity",
 body: "A schedule is feasible only when required labor fits the team's productive capacity. Estimate monthly PM demand as asset count multiplied by PM events per asset multiplied by average task hours. Compare that with technician count multiplied by productive maintenance hours per technician. Keep corrective and emergency capacity outside the PM commitment instead of assuming every paid hour is schedulable. Use the calculator on this page to expose the gap before adding more recurring work.",
 },
 {
 heading: "Preventive maintenance KPIs",
 body: "Track PM compliance as completed-on-time PM work divided by PM work due. Pair it with schedule compliance, emergency-work percentage, planned-maintenance percentage, findings that generate corrective work, repeat failures, MTBF, and PM labor hours. A high completion rate is not proof of effectiveness by itself: the program should also reduce targeted failures without consuming more labor than the avoided risk justifies.",
 table: {
 caption: "A compact preventive maintenance scorecard",
 headers: ["Metric", "Calculation", "What it reveals"],
 rows: [
 ["PM compliance", "On-time PMs / PMs due × 100", "Whether required recurring work is completed when promised"],
 ["Planned maintenance %", "Planned maintenance hours / total maintenance hours × 100", "How much labor is controlled before the day begins"],
 ["Emergency work %", "Emergency labor hours / total maintenance hours × 100", "How much capacity is consumed by urgent failures"],
 ["MTBF", "Operating time / failure count", "Whether reliability is improving"],
 ["MTTR", "Total restoration time / repair count", "How quickly failed assets return to service"],
 ],
 },
 },
 {
 heading: "How a CMMS supports preventive maintenance",
 body: "A CMMS connects each preventive schedule to the asset, location, procedure, assigned role, parts, and safety information. When the trigger is reached, the system generates a work order; the technician records findings and completion evidence; failed checks create corrective work; and the asset history feeds interval reviews, MTBF, MTTR, backlog, and cost analysis. This closes the loop between planning and reliability instead of leaving completed checklists in a folder.",
 },
 {
 heading: "Preventive maintenance launch checklist",
 body: "Before launch, confirm that each scheduled task has an asset ID, responsible role, trigger, estimated duration, procedure, acceptance limit, safety requirements, parts or tools, escalation rule, and next-due logic. Pilot the program on a critical but manageable asset group for four to six weeks. Review technician feedback and the labor-capacity result, correct the procedures, and only then expand to the next group.",
 },
 ],
 faqs: [
 { q: "What is preventive maintenance in simple terms?", a: "Preventive maintenance is planned inspection or service completed before equipment fails. The work is triggered by time, use, condition, or risk and recorded against the asset." },
 { q: "How is preventive maintenance different from predictive maintenance?", a: "Preventive maintenance follows a defined interval or rule. Predictive maintenance uses condition trends and history to forecast when failure risk is increasing. Predictive work can reduce unnecessary fixed-interval service when reliable signals exist." },
 { q: "What are the four common preventive maintenance scheduling methods?", a: "Time-based, meter-based, condition-based, and risk-based scheduling are the four common methods. Many programs combine them and still honor regulatory, warranty, and manufacturer requirements." },
 { q: "How often should preventive maintenance be performed?", a: "There is no universal interval. Start with applicable requirements and manufacturer guidance, then account for duty cycle, environment, criticality, and failure history. Adjust only through a documented review." },
 { q: "What should a preventive maintenance checklist include?", a: "Include the asset, trigger, task steps, safety requirements, tools and parts, measurable acceptance criteria, owner, estimated duration, findings, escalation rule, completion date, and next due date." },
 { q: "Can a spreadsheet manage preventive maintenance?", a: "A spreadsheet can support a small stable program. A CMMS becomes more practical when schedules must generate work automatically, multiple technicians update status, findings create follow-up work, or audits require reliable asset history." },
 ],
 related: ["cmms", "work-order", "fleet-maintenance", "predictive-maintenance", "mtbf", "mttr", "total-productive-maintenance"],
 internalLinks: [
 { label: "download the preventive maintenance checklist", href: "/templates/preventive-maintenance-checklist" },
 { label: "work order workflow", href: "/learn/work-order" },
 { label: "asset management software", href: "/solutions/asset-management-software" },
 { label: "preventive maintenance software", href: "/solutions/preventive-maintenance-software" },
 { label: "facility management guide", href: "/facility-management" },
 ],
 sources: [
 { label: "OSHA process-equipment inspection and testing guidance", url: "https://www.osha.gov/chemical-executive-order/psm-terminology" },
 ],
 },
 {
 slug: "total-productive-maintenance",
 term: "Total Productive Maintenance: The 8 Pillars, KPIs, and Implementation Plan",
 short: "Total productive maintenance (TPM) is a company-wide operating system that engages production, maintenance, quality, engineering, safety, and support teams in preventing equipment losses.",
 metaTitle: "Total Productive Maintenance: 8 Pillars, KPIs & Plan",
 metaDescription: "Learn the 8 pillars of total productive maintenance, calculate OEE and reliability KPIs, follow a 30/60/90-day plan, and use the TPM audit checklist.",
 image: { src: "/images/guides/total-productive-maintenance.png", alt: "The eight total productive maintenance pillars supporting a reliable operating system" },
 published: "2026-08-16",
 updated: "2026-08-16",
 sections: [
 {
 heading: "What is total productive maintenance?",
 body: "Total productive maintenance (TPM) is a management system for improving production-system effectiveness by preventing equipment-related loss across the asset life cycle. The Japan Institute of Plant Maintenance introduced TPM in 1971 and describes it as participation across functions and levels, not a maintenance-department project. The practical aim is to make abnormalities visible, restore basic equipment conditions, remove recurring losses, improve skills, and design future equipment and processes for reliable operation.",
 },
 {
 heading: "The eight pillars of TPM",
 body: "The pillars work as one system. Autonomous maintenance gives operators clear daily ownership without turning them into maintenance technicians. Planned maintenance controls technical work. Focused improvement removes chronic losses, while quality, early equipment management, training, safety, and administrative TPM prevent the same losses from being designed or managed back into the operation.",
 table: {
 caption: "The classic eight TPM pillars with operating examples",
 headers: ["Pillar", "Operating example", "Evidence in the maintenance system"],
 rows: [
 ["Focused improvement", "Cross-functional team removes a recurring minor stop", "Loss code, root cause, action, before/after result"],
 ["Autonomous maintenance", "Operators clean, inspect, lubricate, and tag abnormalities", "Operator checklist, finding, escalation work order"],
 ["Planned maintenance", "Maintenance schedules work from failure modes and condition", "PM plan, labor, parts, meter readings, history"],
 ["Quality maintenance", "Control equipment conditions that create defects", "Quality limit, inspection result, corrective action"],
 ["Early equipment management", "Reliability and maintainability are reviewed before acceptance", "Commissioning punch list, standard job plan, spare-parts plan"],
 ["Education and training", "Skill gaps are mapped to equipment tasks", "Qualification, training record, procedure revision"],
 ["Safety, health, and environment", "Hazards and environmental losses are designed out", "Risk control, inspection, incident follow-up"],
 ["Office TPM", "Planning, purchasing, and stores remove delays and errors", "Approval time, stockout, vendor, and schedule data"],
 ],
 },
 },
 {
 heading: "A phased 30/60/90-day TPM implementation plan",
 body: "A 90-day plan should prove the operating model on one pilot area, not claim company-wide TPM maturity. Choose a constrained line or asset family with visible loss, stable leadership support, and enough data to establish a baseline. Expand only after roles, standards, escalation, and review routines work in practice.",
 table: {
 caption: "TPM pilot roadmap",
 headers: ["Phase", "Primary work", "Exit evidence"],
 rows: [
 ["Days 1-30: Baseline", "Name the sponsor and pilot; map losses; restore basic conditions; define safety boundaries; baseline OEE, downtime, MTBF, MTTR, and planned work", "Signed charter, asset list, loss Pareto, red-tag backlog, baseline scorecard"],
 ["Days 31-60: Standardize", "Launch operator checks; revise PM tasks; train operators and technicians; create escalation rules; run one focused-improvement event", "Used checklists, completed work orders, skill matrix, first verified countermeasure"],
 ["Days 61-90: Control", "Audit standards; close recurring-loss actions; review KPI movement; stabilize parts and job plans; decide whether to expand", "Audit result, sustained action ownership, updated standards, expansion decision"],
 ],
 },
 },
 {
 heading: "TPM KPIs and calculations",
 body: "Use a small, balanced scorecard. OEE summarizes productive use of planned production time, but it can hide the source of loss, so retain the availability, performance, and quality components. Maintenance metrics explain whether equipment reliability and restoration are changing. Review hours and event counts behind the percentages so a small denominator does not create a misleading trend.",
 table: {
 caption: "Core TPM formulas",
 headers: ["Metric", "Formula", "Interpretation"],
 rows: [
 ["Availability", "Run time / planned production time", "Loss from breakdowns and setup or adjustment stops"],
 ["Performance", "Ideal cycle time × total count / run time", "Loss from speed reduction and small stops"],
 ["Quality", "Good count / total count", "Loss from defects and startup scrap"],
 ["OEE", "Availability × performance × quality", "Share of planned production time that is fully productive"],
 ["Planned maintenance %", "Planned maintenance hours / total maintenance hours × 100", "How much maintenance labor is controlled in advance"],
 ["MTBF", "Operating time / functional failures", "Average operating exposure between failures"],
 ["MTTR", "Total restoration time / completed repairs", "Average time required to restore service"],
 ["Downtime rate", "Downtime / planned production time × 100", "Share of planned time unavailable"],
 ],
 },
 },
 {
 heading: "TPM audit worksheet",
 body: "Score each statement from 0 to 3: 0 means not defined, 1 means documented but inconsistent, 2 means routinely followed, and 3 means verified and improving. Require evidence for every score. A high self-rating without current records is a discussion prompt, not an audit result.",
 table: {
 caption: "Ten-question TPM pilot audit",
 headers: ["Audit question", "Evidence to inspect"],
 rows: [
 ["Are pilot losses defined and ranked?", "Loss tree, Pareto, agreed definitions"],
 ["Are equipment basic conditions restored?", "Red tags, leaks, guards, cleaning and lubrication standards"],
 ["Do operators complete safe autonomous tasks?", "Used checks, abnormalities, escalations"],
 ["Do PM tasks address known failure modes?", "Failure-mode link, procedure, interval rationale"],
 ["Are defects linked to equipment conditions?", "Quality limits, defect code, equipment finding"],
 ["Are skills matched to assigned work?", "Skill matrix, qualification, observed performance"],
 ["Are safety boundaries explicit?", "Lockout rules, permitted operator tasks, risk review"],
 ["Are recurring losses assigned to an owner?", "Action log, due date, verification"],
 ["Are parts and job plans ready before planned work?", "Kitted parts, job plan, schedule attainment"],
 ["Does the weekly review change standards or priorities?", "Minutes, revised task, closed-loop action"],
 ],
 },
 },
 {
 heading: "How work orders and asset history support TPM",
 body: "TPM depends on evidence moving across teams. Operator findings should create traceable work rather than disappear on a board. Work orders preserve the symptom, loss category, asset, priority, labor, parts, cause, repair, downtime, and verification. Asset history then shows recurring failures, interval performance, restoration time, and the effect of countermeasures. A CMMS does not create participation, but it gives the pilot one shared operational record and prevents each pillar from maintaining a separate spreadsheet.",
 },
 {
 heading: "TPM vs preventive, RCM, and lean maintenance",
 body: "These approaches overlap but answer different questions. TPM is the broad participation and loss-elimination system. Preventive maintenance is a work strategy inside it. Reliability-centered maintenance selects appropriate policies by functions, failures, consequences, and technically effective tasks. Lean maintenance applies lean thinking to maintenance flow and waste. A plant can use RCM to redesign the maintenance program, execute selected PM and condition tasks through a CMMS, and sustain the routines through TPM.",
 table: {
 caption: "Where common maintenance approaches differ",
 headers: ["Approach", "Primary question", "Typical scope", "Distinctive feature"],
 rows: [
 ["TPM", "How do all functions prevent and remove production losses?", "Organization and operating system", "Operator ownership and cross-functional pillars"],
 ["Preventive maintenance", "What planned work should occur before failure?", "Tasks and schedules", "Time, usage, condition, or risk trigger"],
 ["Reliability-centered maintenance", "What policy preserves required functions at acceptable risk?", "Asset systems and failure modes", "Consequence-based task selection"],
 ["Lean maintenance", "How can maintenance flow create more value with less waste?", "Planning, execution, materials, information", "Queue, handoff, motion, waiting, and rework reduction"],
 ],
 },
 },
 {
 heading: "Common TPM implementation failures",
 body: "TPM stalls when it becomes a cleaning campaign, a maintenance-only project, or an OEE reporting exercise. Other warning signs include unsafe transfer of technical tasks to operators, too many pilot assets, scores without evidence, unresolved red tags, PMs copied from manuals without failure-mode logic, and improvement events whose gains never become standard work. Leadership must protect time for the routines and remove cross-functional barriers that the maintenance team cannot solve alone.",
 },
 ],
 faqs: [
 { q: "What does TPM stand for?", a: "TPM stands for total productive maintenance. It is a cross-functional management system for preventing equipment and production losses across the asset life cycle." },
 { q: "What are the eight pillars of total productive maintenance?", a: "Focused improvement, autonomous maintenance, planned maintenance, quality maintenance, early equipment management, education and training, safety-health-environment, and office TPM are the classic eight pillars." },
 { q: "Is autonomous maintenance the same as operators repairing machines?", a: "No. Autonomous maintenance gives trained operators defined, safe tasks such as cleaning, inspection, lubrication, basic adjustment, and abnormality tagging. Technical repairs and safety-critical work remain with qualified personnel." },
 { q: "How is OEE calculated?", a: "OEE equals availability multiplied by performance multiplied by quality. Use decimals or percentages consistently, and review the three components separately to locate the loss." },
 { q: "Can a company implement TPM in 90 days?", a: "A company can establish and evaluate one TPM pilot in 90 days. Company-wide behavior, standards, and improvement routines take longer and should expand only after the pilot is stable." },
 { q: "Does TPM require CMMS software?", a: "No, but a CMMS helps preserve work orders, asset history, operator findings, PM schedules, failure codes, labor, parts, and KPI inputs in one shared record." },
 ],
 related: ["preventive-maintenance", "cmms", "mtbf", "mttr", "root-cause-analysis", "condition-based-maintenance"],
 internalLinks: [
 { label: "preventive maintenance guide and labor calculator", href: "/learn/preventive-maintenance" },
 { label: "free preventive maintenance checklist", href: "/templates/preventive-maintenance-checklist" },
 { label: "work order software", href: "/solutions/work-order-software" },
 { label: "asset management software", href: "/solutions/asset-management-software" },
 ],
 sources: [
 { label: "Japan Institute of Plant Maintenance: TPM definition and history", url: "https://www.jipm.or.jp/business/tpm/" },
 { label: "NIST MEP: TPM downtime and capacity case study", url: "https://www.nist.gov/mep/successstories/2022/total-productive-maintenance-reduces-equipment-downtime-and-lost-capacity" },
 ],
 },
 {
 slug: "work-order",
 term: "Work Order",
 short: "A formal request that describes a maintenance task — what needs doing, on which asset, by whom, when — and tracks it from creation to completion.",
 metaTitle: "What is a Work Order? Anatomy, Lifecycle, and Examples",
 metaDescription: "A work order is the formal record of a maintenance task. Learn what fields it contains, how it flows through statuses, and best practices.",
 updated: "2026-08-14",
 sections: [
 {
 heading: "Definition",
 body: "A work order is the unit of work in maintenance. It captures a task to be performed — replace a belt, repair a leak, inspect a panel — along with the asset, the assignee, the priority, the due date, and any parts or instructions needed. Once complete it becomes the permanent service record for that asset.",
 },
 {
 heading: "Anatomy of a good work order",
 body: "At minimum: a clear title, the asset it relates to, the location, the priority, the requester, the assignee, a description of the problem or task, and a due date. Better work orders also include attached photos, parts needed, estimated time, a checklist of steps, and required signatures. The richer the work order, the less time technicians spend asking clarifying questions in the field.",
 },
 {
 heading: "The work order lifecycle",
 body: "Most teams use four to six statuses: Requested → Approved → Assigned → In Progress → On Hold → Completed → Closed. Approval is optional but useful for cost control. 'On Hold' captures waiting for parts or vendor availability, which is critical for honest reporting on technician utilization.",
 },
 {
 heading: "Reactive vs preventive work orders",
 body: "Reactive work orders are created when something breaks. Preventive work orders are generated automatically by the CMMS from a schedule. Inspection work orders capture rounds and checklists. Healthy teams track the ratio between these three — it is the simplest indicator of whether maintenance is in control of its workload.",
 },
 ],
 faqs: [
 { q: "What is the difference between a work order and a work request?", a: "A request is what an end user submits ('the printer is broken'). The maintenance team triages it, and if it is valid, converts it into a work order with priority, assignee, and due date." },
 { q: "How long should a work order stay open?", a: "Routine preventive work typically closes within a week; reactive work depends on priority. A growing backlog of work orders older than 30 days is a common warning sign." },
 ],
 related: ["cmms", "preventive-maintenance", "facility-maintenance"],
 internalLinks: [
 { label: "work order software", href: "/solutions/work-order-software" },
 { label: "free maintenance work order template", href: "/templates/work-order-template" },
 { label: "modern work order management guide", href: "/blog/the-ultimate-guide-to-modern-work-order-management-in-2026" },
 ],
 },
 {
 slug: "facility-maintenance",
 term: "Facility Maintenance",
 short: "All the work required to keep a building and its systems safe, comfortable, and operational — HVAC, plumbing, electrical, lighting, life safety, and the building envelope.",
 metaTitle: "What is Facility Maintenance? Scope & Examples",
 metaDescription: "Facility maintenance keeps buildings safe, comfortable, and compliant. Learn the scope, common tasks, and how teams organize the work.",
 sections: [
 {
 heading: "Definition",
 body: "Facility maintenance is the discipline of keeping a building and its systems in working order. It spans the building envelope (roof, walls, doors, windows), the major systems inside it (HVAC, plumbing, electrical, fire and life safety), and the equipment that supports occupants (elevators, lighting, security, signage). The goal is a space that is safe, code-compliant, comfortable, and continuously available.",
 },
 {
 heading: "Scope of work",
 body: "Facility maintenance teams handle three broad workload types: preventive tasks (filter changes, inspections, code-required tests), reactive repairs (leaks, outages, broken fixtures), and small projects (paint, signage, minor reconfigurations). Larger capital projects — re-roofing, chiller replacement, full renovations — usually sit with a separate facilities or capital projects function.",
 },
 {
 heading: "How facility teams stay on top of it",
 body: "Most facility teams now run on a CMMS. Assets are registered with locations and warranties. Compliance-driven PMs (fire extinguishers, sprinklers, backflow preventers, generator tests) are scheduled and audit-trailed. Tenants or staff submit requests through a simple portal that drops directly into the work order queue. KPIs that matter: percentage of PMs completed on time, average response time on urgent requests, and reactive-to-planned work ratio.",
 },
 {
 heading: "Common pitfalls",
 body: "Three patterns sink most facility teams: an unmaintained asset list, so PMs are missed and audits are painful; an over-reliance on a single 'tribal knowledge' technician; and no reporting layer, so leadership has no objective view of workload or backlog. All three are solved by adopting purpose-built facility maintenance software.",
 },
 ],
 faqs: [
 { q: "Is facility maintenance the same as building maintenance?", a: "They overlap heavily. 'Facility' tends to imply a broader scope including non-building infrastructure (parking lots, grounds, security systems). In daily use the terms are often interchangeable." },
 { q: "Who is responsible for facility maintenance?", a: "In owner-occupied buildings, an internal facilities team. In leased space, responsibility is split between landlord and tenant per the lease; the CMMS should reflect that split." },
 ],
 related: ["building-maintenance", "property-maintenance", "work-order"],
 internalLinks: [
 { label: "facility management operations hub", href: "/facility-management" },
 { label: "facility maintenance software", href: "/solutions/facility-maintenance-software" },
 { label: "preventive maintenance guide", href: "/learn/preventive-maintenance" },
 ],
 },
 {
 slug: "fleet-maintenance",
 term: "Fleet Maintenance",
 short: "Keeping a group of vehicles — trucks, vans, cars, heavy equipment — safe, compliant, and on the road through scheduled service and quick reactive repairs.",
 metaTitle: "What is Fleet Maintenance? Scope, Schedules & Compliance",
 metaDescription: "Fleet maintenance keeps vehicles safe, compliant, and on the road. Learn what it covers, how schedules are set, and what teams track.",
 sections: [
 {
 heading: "Definition",
 body: "Fleet maintenance is the practice of keeping a group of vehicles operational, safe, and compliant. It covers everything from daily driver inspections to scheduled service, emergency roadside repairs, tire programs, accident damage, and end-of-life disposal. The scope spans light vehicles (cars, vans), medium and heavy trucks, trailers, and off-road equipment.",
 },
 {
 heading: "How fleet schedules are set",
 body: "Unlike most maintenance, fleet schedules are usually meter-based rather than calendar-based. Oil changes by mileage, brake inspections by mileage, DOT inspections by federal or local regulation. Modern fleet maintenance software pulls odometer readings directly from telematics so PMs trigger themselves the moment a vehicle crosses its threshold, eliminating the spreadsheet that used to live in dispatch.",
 },
 {
 heading: "Compliance is non-negotiable",
 body: "Commercial fleets in most jurisdictions must keep auditable records of inspections, repairs, and driver vehicle inspection reports (DVIRs). Penalties for missing records are steep, and insurance carriers increasingly require digital records to renew coverage. A fleet CMMS that stores DVIRs, inspection results, and service history per vehicle handles this automatically.",
 },
 {
 heading: "KPIs that matter",
 body: "Cost per mile by vehicle, downtime hours per month, percentage of PMs completed on time, average repair turnaround, and warranty recovery rate. The last one is widely under-tracked; warranty claims that slip through unfiled are pure margin lost.",
 },
 ],
 faqs: [
 { q: "Do I need separate software for fleet maintenance?", a: "Not always. A general CMMS can handle a small fleet. Above roughly 20–30 vehicles, or once telematics integration and DOT compliance become priorities, dedicated fleet maintenance software pays off." },
 { q: "What is a DVIR?", a: "Driver Vehicle Inspection Report — a pre- and post-trip safety check the driver completes. In commercial transport it is legally required in most jurisdictions." },
 ],
 related: ["preventive-maintenance", "cmms", "work-order"],
 },
 {
 slug: "mro",
 term: "MRO (Maintenance, Repair & Operations)",
 short: "The supplies, parts, and consumables a maintenance team uses to keep operations running — separate from raw materials that become finished products.",
 metaTitle: "What is MRO? Maintenance, Repair & Operations Explained",
 metaDescription: "MRO covers the parts, tools, and consumables maintenance teams use day to day. Learn what it includes and how to control MRO inventory.",
 sections: [
 {
 heading: "Definition",
 body: "MRO stands for Maintenance, Repair, and Operations. It refers to the goods a business consumes to keep itself running, as opposed to the raw materials that get turned into finished products. Spare bearings, lubricants, hand tools, safety gloves, light bulbs, cleaning supplies, and PPE are all MRO. In accounting terms MRO is usually expensed rather than capitalized.",
 },
 {
 heading: "Why MRO is hard to control",
 body: "MRO inventory tends to sprawl. Items are low-value individually but high-value in aggregate. Multiple people order from multiple suppliers, often without checking stock first. Critical spares hide in personal toolboxes, while obsolete parts gather dust. Most plants discover during their first real audit that MRO inventory is 20–40% larger than the system shows.",
 },
 {
 heading: "How a CMMS helps",
 body: "A CMMS with parts and inventory tracks on-hand quantity, reorder points, supplier and cost, and — critically — which assets each part fits. When a technician closes a work order and consumes a bearing, stock decrements automatically. Reorder alerts fire before stockouts trigger emergency overnight shipping. Vendor performance becomes measurable.",
 },
 {
 heading: "MRO best practices",
 body: "Standardize on as few part numbers as possible; consolidate suppliers to negotiate better terms; lock the storeroom and require check-out; do a quarterly cycle count rather than an annual full inventory; and review the slow-moving list every six months to write off true obsolescence.",
 },
 ],
 faqs: [
 { q: "Is MRO the same as spare parts?", a: "Spare parts are a subset of MRO. MRO also covers consumables, tools, and operating supplies that are not strictly 'parts'." },
 { q: "How much MRO inventory should I carry?", a: "Enough to cover critical-spare lead times for assets where downtime is expensive, and no more. Anything else ties up cash without reducing risk." },
 ],
 related: ["cmms", "work-order", "preventive-maintenance"],
 },
 {
 slug: "building-maintenance",
 term: "Building Maintenance",
 short: "The day-to-day and scheduled work needed to keep a building's structure, systems, and finishes in safe and serviceable condition.",
 metaTitle: "What is Building Maintenance? Tasks, Types & Schedules",
 metaDescription: "Building maintenance covers structural, mechanical, and cosmetic work to keep buildings safe and serviceable. Learn what it includes.",
 sections: [
 {
 heading: "Definition",
 body: "Building maintenance is the set of activities required to preserve a building in working condition. It spans structural elements (foundation, walls, roof), enclosing surfaces (windows, doors, weatherproofing), interior finishes (paint, flooring, ceilings), and the mechanical systems that keep the building habitable (HVAC, plumbing, electrical). It is sometimes used interchangeably with facility maintenance, though building maintenance leans toward the physical structure itself.",
 },
 {
 heading: "Routine vs corrective vs cosmetic",
 body: "Routine maintenance is recurring work: filter changes, gutter cleaning, lamp replacement, lubrication. Corrective maintenance fixes something that has broken: a leaking pipe, a failed motor, a damaged door. Cosmetic maintenance restores appearance: paint touch-ups, carpet cleaning, signage refresh. Most building maintenance budgets are dominated by routine work, but corrective spikes are what get noticed.",
 },
 {
 heading: "How modern teams run it",
 body: "Buildings get registered as locations, with each floor and each room as nested sub-locations. Assets (HVAC units, water heaters, fire panels) are placed within those locations. Tenants or occupants submit requests through a portal or QR code; the CMMS routes the request to the right trade, assigns it, and tracks completion. Preventive schedules cover the predictable work; reactive requests flow through the same system so reporting is honest.",
 },
 {
 heading: "Outsourced vs in-house",
 body: "Most building maintenance programs blend in-house staff for fast response and routine work with outsourced contractors for specialized work (elevator service, fire-system testing, roofing). A CMMS makes the contractor side visible: scheduled work, invoices, warranty claims, and certificates of insurance all tracked alongside in-house work.",
 },
 ],
 faqs: [
 { q: "What is the difference between building maintenance and janitorial?", a: "Janitorial (or custodial) work is daily cleaning. Building maintenance is the technical work to keep systems and structure functional. They are usually separate teams or contracts." },
 { q: "How much should I budget for building maintenance?", a: "A common rule of thumb for commercial buildings is 2–4% of replacement value per year for ongoing maintenance, with larger reserves set aside for capital renewals." },
 ],
 related: ["facility-maintenance", "property-maintenance", "work-order"],
 },
 {
 slug: "property-maintenance",
 term: "Property Maintenance",
 short: "Ongoing upkeep of residential or commercial rental property — units, common areas, grounds, and life-safety systems — to protect the asset and keep tenants happy.",
 metaTitle: "What is Property Maintenance? Scope for Landlords & PMs",
 metaDescription: "Property maintenance keeps rental units, common areas, and grounds in good condition. Learn the scope and how PM teams stay organized.",
 sections: [
 {
 heading: "Definition",
 body: "Property maintenance is the work required to keep a real estate asset — a single-family rental, a multifamily community, a strip center, an office portfolio — in good condition. It covers the interior of units (appliances, fixtures, finishes), the building exterior, common areas, grounds, parking, and the major systems that serve all of it. The audience is typically property managers, landlords, and HOA boards rather than industrial maintenance teams.",
 },
 {
 heading: "Make-ready and turnover",
 body: "In residential property management, the dominant workload is turnover: getting a unit cleaned, painted, repaired, and re-keyed between residents. Speed matters because every day vacant is lost rent. A property maintenance system tracks the turn as a structured checklist with photos and sign-offs, so leasing can confidently market the unit before the work is fully done.",
 },
 {
 heading: "Resident requests",
 body: "The second major workload is resident-submitted work orders. Best practice is a portal or QR code that captures the issue, location within the unit, photos, and access permission ('OK to enter when not home') in one step. From there a CMMS routes the request to the right technician, sends the resident automatic status updates, and closes the loop with a satisfaction prompt.",
 },
 {
 heading: "Compliance and risk",
 body: "Property owners carry significant liability for habitability, life safety, and accessibility. Smoke and CO detector tests, pool inspections, playground inspections, lead paint and asbestos disclosures, and ADA accommodations all generate recurring tasks that belong on a preventive schedule with an audit trail.",
 },
 ],
 faqs: [
 { q: "Is property maintenance the same as facility maintenance?", a: "They overlap, but property maintenance is oriented around rental real estate (units, residents, turnover), while facility maintenance is oriented around owner-occupied buildings (offices, plants, hospitals)." },
 { q: "Should small landlords use maintenance software?", a: "Once you cross roughly 10 units, yes. The cost is small and the time saved tracking resident requests by text and email pays for itself within a month." },
 ],
 related: ["facility-maintenance", "building-maintenance", "work-order"],
 },
 {
 slug: "reactive-maintenance",
 term: "Reactive Maintenance",
 short: "Fixing equipment after it has already broken down — the unplanned, run-to-failure work that a maintenance program tries to shrink.",
 metaTitle: "What is Reactive Maintenance? Definition, Cost & Examples",
 metaDescription: "Reactive maintenance is repairing equipment after it fails. Learn when it makes sense, what it really costs, and how to shift toward planned work.",
 sections: [
 {
 heading: "Definition",
 body: "Reactive maintenance — also called breakdown or run-to-failure maintenance — is any repair carried out after an asset has already failed or stopped performing. There is no schedule and no warning: a machine goes down, a work order is raised, and a technician scrambles to fix it. It is the default mode every maintenance team starts in, and the mode a good preventive program is designed to escape.",
 },
 {
 heading: "What reactive maintenance really costs",
 body: "The repair bill is only part of it. Reactive work also brings unplanned downtime, lost production, emergency overtime, rushed parts ordering at premium prices, and collateral damage when one failed component takes others with it. Industry studies consistently put reactive repairs at three to nine times the cost of the equivalent planned work. The hidden tax is unpredictability — reactive-heavy teams can never plan their week because the week plans them.",
 },
 {
 heading: "When reactive maintenance is the right call",
 body: "Not every asset deserves a preventive schedule. For cheap, non-critical, easily replaced items — a light fixture, a $20 pump, a redundant component with a standby — running to failure is often the rational choice. The skill is deciding deliberately: reactive maintenance should be a strategy you chose for low-stakes assets, not a condition you are stuck in for critical ones.",
 },
 {
 heading: "How to reduce reactive maintenance",
 body: "Start by measuring it: tag every work order as planned or reactive using a documented rule, then review the assets generating repeated emergency calls. Move suitable failure modes onto approved preventive or condition-based tasks, track whether breakdowns change, and repeat. Set the target from your own baseline, asset risk, production needs, and staffing rather than copying an unsupported universal ratio.",
 },
 ],
 faqs: [
 { q: "Is reactive maintenance always bad?", a: "No. For low-cost, non-critical assets it can be the cheapest strategy. It becomes a problem when critical equipment is run to failure by accident rather than by choice." },
 { q: "How do I know if I have too much reactive maintenance?", a: "Track the planned-vs-reactive ratio in your CMMS. If more than ~30% of your work is unplanned breakdowns, there is room to shift work into preventive schedules." },
 ],
 related: ["preventive-maintenance", "predictive-maintenance", "cmms"],
 },
 {
 slug: "predictive-maintenance",
 term: "Predictive Maintenance",
 short: "Using live condition data — vibration, temperature, current — to predict failures and service equipment just before it would break, not on a fixed calendar.",
 metaTitle: "What is Predictive Maintenance? Definition & How It Works",
 metaDescription: "Predictive maintenance uses sensor data to fix equipment just before it fails. Learn how it works, how it differs from preventive maintenance.",
 sections: [
 {
 heading: "Definition",
 body: "Predictive maintenance (PdM) uses real-time condition data to forecast when an asset is likely to fail, so work is performed just in time — late enough to get full life out of components, early enough to avoid the breakdown. Instead of a calendar telling you to act, the equipment itself does, through signals like vibration, temperature, ultrasonic noise, oil particulates, or motor current.",
 },
 {
 heading: "How predictive maintenance works",
 body: "It runs in three layers. First, sensors (or manual readings) capture a condition signal over time. Second, a baseline of normal behavior is established. Third, when readings drift outside normal — a bearing's vibration climbing, a motor drawing more current — the system flags a developing fault and generates a work order with lead time to plan parts and labor. Modern CMMS platforms increasingly fold in AI models that learn each asset's failure signature from its own history.",
 },
 {
 heading: "Predictive vs preventive maintenance",
 body: "Preventive maintenance acts on a fixed schedule whether the asset needs it or not, which means some work is done too early (wasting component life) and some failures still slip through between intervals. Predictive maintenance acts only on evidence, so it cuts both unnecessary work and surprise breakdowns. The trade-off is setup: PdM needs sensors or readings and a baseline, where preventive needs only a calendar.",
 },
 {
 heading: "Where to start with predictive maintenance",
 body: "Begin with your most critical, most expensive-to-fail assets — the ones whose downtime hurts most. Pick one measurable signal (vibration on rotating equipment is the classic starting point), capture it regularly, and watch for trend changes. You do not need a full sensor rollout to start; even routine manual readings logged in a CMMS turn into a predictive trend over time.",
 },
 ],
 faqs: [
 { q: "Do I need expensive sensors for predictive maintenance?", a: "Not to start. Manual condition readings (temperature, vibration pens, oil samples) logged consistently in a CMMS build a usable trend. Permanent sensors pay off on the most critical assets." },
 { q: "Is predictive maintenance the same as condition-based maintenance?", a: "They are closely related. Condition-based maintenance acts when a reading crosses a threshold; predictive maintenance goes further and forecasts the failure ahead of time, often with models." },
 ],
 related: ["agentic-cmms", "preventive-maintenance", "condition-based-maintenance", "reactive-maintenance"],
 internalLinks: [
 { label: "infrared thermography camera inspection guide", href: "/learn/infrared-thermography-inspection" },
 { label: "preventive maintenance software", href: "/solutions/preventive-maintenance-software" },
 ],
 },
 {
 slug: "corrective-maintenance",
 term: "Corrective Maintenance",
 short: "Planned repair work that fixes a known defect found during an inspection or PM — before it becomes a breakdown.",
 metaTitle: "What is Corrective Maintenance? Definition & Examples",
 metaDescription: "Corrective maintenance repairs a fault that has been identified but hasn't caused failure yet. Learn how it differs from reactive and preventive maintenance.",
 sections: [
 {
 heading: "Definition",
 body: "Corrective maintenance is work that restores a failed or failing asset to working order. Crucially, in modern usage it usually refers to planned corrective work: a technician spots a worn belt, a small leak, or an out-of-spec reading during an inspection or preventive task, raises a work order, and the fix is scheduled before the asset actually breaks down.",
 },
 {
 heading: "Corrective vs reactive maintenance",
 body: "The terms are often confused. Reactive (breakdown) maintenance happens after an unexpected failure, under time pressure. Corrective maintenance is the planned cousin: the defect is known, parts and labor are organized, and the work is scheduled into the normal flow. Both fix a problem, but corrective work is calm and cheap where reactive work is chaotic and expensive.",
 },
 {
 heading: "Where corrective maintenance comes from",
 body: "Most corrective work is generated by other maintenance activity. A preventive task or inspection surfaces a defect that is not yet a failure — this is exactly why inspections pay off. The finding becomes a corrective work order, ideally linked to the same asset so its history shows the full chain from detection to repair.",
 },
 {
 heading: "Tracking corrective maintenance well",
 body: "Tag corrective work orders distinctly from preventive and reactive so reporting stays honest. A healthy program shows preventive inspections feeding a steady stream of planned corrective fixes, with reactive breakdowns shrinking over time. If corrective work is rare and reactive work is high, your inspections are probably not catching defects early enough.",
 },
 ],
 faqs: [
 { q: "Is corrective maintenance planned or unplanned?", a: "Modern usage treats it as planned: the defect is already known (found during a PM or inspection) and the repair is scheduled, unlike a reactive breakdown." },
 { q: "What triggers corrective maintenance?", a: "Usually a preventive task or inspection that finds a developing fault — a worn part, a leak, an out-of-tolerance reading — which becomes a scheduled corrective work order." },
 ],
 related: ["preventive-maintenance", "reactive-maintenance", "work-order"],
 },
 {
 slug: "condition-based-maintenance",
 term: "Condition-Based Maintenance",
 short: "Servicing equipment when a monitored condition (temperature, vibration, pressure) crosses a defined threshold — not on a fixed schedule.",
 metaTitle: "What is Condition-Based Maintenance (CBM)? A Plain Guide",
 metaDescription: "Condition-based maintenance triggers work when a measured condition crosses a threshold. See how CBM compares to preventive and predictive.",
 sections: [
 {
 heading: "Definition",
 body: "Condition-based maintenance (CBM) triggers service based on the actual, measured condition of an asset rather than a calendar or runtime interval. A monitored parameter — bearing temperature, vibration amplitude, oil cleanliness, differential pressure across a filter — is compared against a defined limit, and when it crosses that limit, a work order is raised. The asset is serviced because it shows it needs it, not because a schedule said so.",
 },
 {
 heading: "How condition-based maintenance works",
 body: "First, choose a condition that reliably indicates wear or impending failure for that asset class. Second, set a threshold based on manufacturer specs and your own history. Third, monitor — continuously with sensors, or periodically with manual readings logged in a CMMS. When the reading breaches the threshold, the system generates the work. The art is choosing thresholds that fire early enough to plan but not so early that you waste component life.",
 },
 {
 heading: "CBM vs preventive vs predictive",
 body: "Preventive maintenance acts on time. Condition-based maintenance acts on a present-moment reading crossing a line. Predictive maintenance goes one step further, using trends and models to forecast when the line will be crossed in the future. CBM is often the practical middle ground: more efficient than fixed schedules, far simpler to implement than full predictive analytics.",
 },
 {
 heading: "Getting started with CBM",
 body: "Pick one critical asset and one telling parameter — vibration on a pump, temperature on a motor, pressure drop on a filter. Decide the threshold, log readings on a regular route, and let your CMMS raise the work order when the limit is hit. As confidence grows, add parameters and assets. Manual CBM with a clipboard and a CMMS is a legitimate, low-cost place to begin.",
 },
 ],
 faqs: [
 { q: "Does condition-based maintenance require sensors?", a: "Not necessarily. Permanent sensors enable continuous monitoring, but periodic manual readings (temperature, vibration, pressure) logged in a CMMS are a valid, low-cost form of CBM." },
 { q: "How is CBM different from predictive maintenance?", a: "CBM reacts when a reading crosses a threshold now. Predictive maintenance forecasts when that threshold will be crossed in the future, usually with trend analysis or models." },
 ],
 related: ["predictive-maintenance", "preventive-maintenance", "mtbf"],
 },
 {
 slug: "mtbf",
 term: "MTBF (Mean Time Between Failures)",
 short: "The average operating time between one failure and the next for a repairable asset — a core reliability metric maintenance teams track to spot bad actors.",
 metaTitle: "What is MTBF? Mean Time Between Failures Formula",
 metaDescription: "MTBF measures the average time between failures of a repairable asset. Learn the formula, how to use it, and how it differs from MTTR and MTTF.",
 sections: [
 {
 heading: "Definition",
 body: "MTBF stands for Mean Time Between Failures. It is the average amount of operating time a repairable asset runs between one failure and the next. A higher MTBF means a more reliable asset. It is one of the most widely used reliability metrics in maintenance and is most useful for comparing assets, tracking whether reliability is improving, and prioritizing where to focus preventive effort.",
 },
 {
 heading: "MTBF formula",
 body: "MTBF = total operating time ÷ number of failures over that period. For example, if a pump ran for 1,200 hours and failed 3 times, its MTBF is 400 hours. The number is only as good as the data behind it, which is why teams track failures in a CMMS — accurate failure counts and runtime are what make the metric trustworthy.",
 },
 {
 heading: "MTBF vs MTTR vs MTTF",
 body: "MTBF measures reliability — how long an asset runs between failures. MTTR (Mean Time To Repair) measures maintainability — how long it takes to get it running again. The two together describe availability. MTTF (Mean Time To Failure) is used for non-repairable items that are replaced rather than fixed; MTBF is for repairable assets.",
 },
 {
 heading: "How to use MTBF in practice",
 body: "Track MTBF per asset and watch the trend. A falling MTBF flags an asset that is degrading and may need a tighter preventive schedule, a rebuild, or replacement. Comparing MTBF across similar assets surfaces the bad actors that deserve attention first. Avoid over-reading a single number — MTBF is an average, so it is most meaningful as a trend over time on assets with enough failure history.",
 },
 ],
 faqs: [
 { q: "What is a good MTBF?", a: "There is no universal target — it depends entirely on the asset and industry. MTBF is most useful as a trend (is it improving?) and as a way to compare similar assets, not as an absolute score." },
 { q: "What's the difference between MTBF and MTTR?", a: "MTBF measures how long an asset runs between failures (reliability); MTTR measures how long it takes to repair after a failure (maintainability). Together they drive availability." },
 ],
 related: ["mttr", "preventive-maintenance", "cmms"],
 },
 {
 slug: "mttr",
 term: "MTTR (Mean Time To Repair)",
 short: "The average time it takes to restore a failed asset to working order — a key maintainability metric that captures how fast your team responds.",
 metaTitle: "What is MTTR? Mean Time To Repair Formula & Tips",
 metaDescription: "MTTR measures the average time to repair a failed asset. Learn the formula, what drives it, and practical ways to bring it down.",
 sections: [
 {
 heading: "Definition",
 body: "MTTR stands for Mean Time To Repair: the average time it takes to restore a failed asset to working condition, measured from the moment it goes down to the moment it is back in service. It captures everything in between — diagnosis, waiting for parts, the actual repair, testing, and handback. A lower MTTR means faster recovery and less downtime.",
 },
 {
 heading: "MTTR formula",
 body: "MTTR = total repair time ÷ number of repairs over a period. If a line suffered 4 failures last month and the total time-to-restore across them was 8 hours, MTTR is 2 hours. As with MTBF, the metric is only as reliable as the timestamps behind it — recording when work orders open and close in a CMMS is what makes MTTR measurable.",
 },
 {
 heading: "What drives MTTR up",
 body: "The repair itself is often the smallest slice. The big drivers are usually waiting — for a technician to be notified, for the right parts to be on hand, for documentation or a manual, for an approval. That is why MTTR is as much a logistics and process metric as a wrench-time one: faster notification, better spare-parts stocking, and clear procedures cut it more than working faster ever could.",
 },
 {
 heading: "How to reduce MTTR",
 body: "Tighten notification so the right technician knows immediately. Stock critical spares so repairs don't stall waiting for parts. Attach manuals, photos, and procedures to each asset so diagnosis is fast. Capture failure history so recurring problems have a known fix. A CMMS supports all four — mobile alerts, parts tracking, asset documentation, and history — which is why MTTR usually falls once a team moves off spreadsheets.",
 },
 ],
 faqs: [
 { q: "What is included in MTTR?", a: "Everything from failure to restored service: detection, diagnosis, waiting for parts or approvals, the repair, and testing. Much of MTTR is waiting, not wrench time." },
 { q: "How can I lower MTTR?", a: "Speed up notification, stock critical spare parts, attach procedures and history to each asset, and track recurring failures — all of which a CMMS makes easier." },
 ],
 related: ["mtbf", "work-order", "cmms"],
 },
 {
  slug: "cmms-benchmarks-2026",
  term: "Maintenance KPI Reference: Build an Internal Baseline",
  short: "A practical reference for defining planned-work ratio, MTTR, PM compliance, and cost per work order without treating unrelated industry figures as universal targets.",
  metaTitle: "Maintenance KPI Reference: Definitions and Baselines",
  metaDescription: "Define maintenance KPIs, document calculation rules, build a comparable internal baseline, and avoid unsupported universal benchmark claims.",
  published: "2026-08-11",
  updated: "2026-08-21",
  sections: [
   {
     heading: "This page is a KPI reference, not a benchmark study",
     body: "MaintenEase does not currently publish a documented customer cohort, sample period, calculation method, or auditable dataset that would support an original industry benchmark. This page therefore explains how to define and compare maintenance KPIs using your own stable baseline. A number from another industry, asset class, or operating schedule should not become a target without checking whether the populations and formulas are comparable.",
   },
   {
     heading: "Planned-work ratio",
     body: "Define which work-order types count as planned before calculating the ratio. A defensible formula is planned work orders completed divided by all maintenance work orders completed in the same period. Some teams use labor hours instead of order count; either method can work, but switching the denominator makes periods incomparable. Record whether inspections, projects, and emergency follow-up work are included.",
   },
   {
     heading: "Mean Time To Repair (MTTR)",
     body: "MTTR is total repair-restoration time divided by the number of repair events in the period. State the start and stop events: failure detected, work order opened, technician assigned, repair started, or asset returned to service. Segment by asset class and criticality so a fleet of simple pumps is not compared with complex production lines. Track waiting and active repair separately when the data supports it.",
   },
   {
     heading: "PM compliance",
     body: "PM compliance is preventive tasks completed within the defined completion window divided by preventive tasks due in the period. Publish the window with the result, such as due date through seven days late. Exclude canceled schedules only under a documented rule, and do not quietly move due dates after the work is late.",
   },
   {
     heading: "Cost per work order",
     body: "Choose whether cost includes technician labor, contractors, parts, freight, downtime, and allocated overhead. Divide the included total by completed work orders for the same period. Report preventive, corrective, and emergency work separately; blending them can hide a changing work mix even when the overall average looks stable.",
   },
   {
     heading: "Build a comparable internal baseline",
     body: "Select a period long enough to include normal operating variation, freeze each KPI definition, and note missing records or changes in staffing, production hours, or asset scope. Compare the next period using the same rules. If a definition changes, recalculate the earlier period or start a new series rather than joining unlike values.",
   },
   {
     heading: "What a real external benchmark would need",
     body: "Before relying on an external percentile or average, look for the sample size, industries, geography, asset population, data period, inclusion rules, statistic used, missing-data treatment, and sponsor. MaintenEase will not label this page as original research unless those details and the underlying evidence can be published. No MaintenEase customer data is used for the statements on this page.",
   },
  ],
  faqs: [
    { q: "Does MaintenEase publish customer benchmarks?", a: "No. MaintenEase does not currently publish the cohort, sample period, method, or auditable dataset required to substantiate original customer benchmarks." },
    { q: "Can I compare my MTTR with another company?", a: "Only when asset scope, criticality, operating schedule, and start and stop definitions are comparable. Otherwise use the external number as a question prompt, not a target." },
    { q: "How often should a KPI baseline be updated?", a: "Keep the calculation rules stable and review on an operating cadence that produces enough events to be meaningful. Document scope changes and start a new series when the definition materially changes." },
  ],
  related: ["mtbf", "mttr", "preventive-maintenance", "cmms"],
 },
 {
  slug: "cmms-roi",
  term: "CMMS ROI Calculator Method: Use Your Own Baseline",
  short: "A transparent way to estimate CMMS return using your own downtime, labor, parts, implementation, and subscription inputs instead of vendor benchmark claims.",
  metaTitle: "CMMS ROI Calculation Method: Inputs, Formula, Example",
  metaDescription: "Estimate CMMS ROI with documented baseline inputs, conservative scenarios, implementation costs, a transparent formula, and an illustrative example.",
  published: "2026-08-11",
  updated: "2026-08-21",
  sections: [
   {
     heading: "Start with a measured baseline",
     body: "Record current annual software and administration cost, unplanned-downtime hours, the site-approved cost per downtime hour, technician time spent on selected administrative tasks, emergency freight, and inventory carrying cost. Do not assign a savings percentage before the baseline and measurement owner exist. Exclude benefits that cannot be measured or defend them as qualitative rather than financial.",
   },
   {
     heading: "Downtime scenario",
     body: "Calculate downtime benefit as baseline unplanned hours minus observed or conservatively forecast unplanned hours, multiplied by the site's approved cost per hour. Keep production loss, overtime, scrap, and expedited freight from being counted twice. Run low, expected, and high cases, and make the low case the approval threshold when uncertainty is large.",
   },
   {
     heading: "Work and labor scenario",
     body: "For a proposed workflow change, estimate the number of affected events and minutes saved per event, then multiply by a validated loaded labor rate. Count time only when it becomes usable capacity or avoided paid hours. For reactive work, compare actual labor, parts, freight, and collateral cost with a matched planned task instead of applying a universal multiplier.",
   },
   {
     heading: "Parts and inventory scenario",
     body: "Use recorded emergency orders, freight, stockouts, write-offs, and average inventory value. A benefit is defensible when the proposed controls change a measurable event: fewer emergency shipments, fewer duplicate purchases, or lower approved stock while service levels remain acceptable. Do not treat the entire inventory reduction as annual savings; use the organization's finance-approved carrying-cost method.",
   },
   {
     heading: "Include the full investment",
     body: "Add subscription fees, implementation services, internal setup time, data cleanup, training, devices, integrations, ongoing administration, and change-management effort. If a cost already exists and will continue regardless of the project, label it as baseline rather than charging it to the CMMS case.",
   },
   {
     heading: "ROI and payback formulas",
     body: "Annual ROI equals annual quantified benefit minus annualized total cost, divided by annualized total cost, multiplied by 100. Payback months equal initial and first-year cost divided by expected monthly quantified benefit. Show each input and assumption next to the result so finance and operations can revise the scenario without reverse-engineering it.",
   },
   {
     heading: "Illustrative example — not a benchmark",
     body: "Assume a team documents $30,000 of annual benefit from four avoided downtime hours at its approved $7,500 hourly cost, plus $6,000 of avoided emergency freight. Assume $12,000 of first-year subscription, setup, training, and administration cost. The illustrative net benefit is $24,000 and ROI is 200%: ($36,000 minus $12,000) divided by $12,000. These numbers are teaching inputs, not MaintenEase customer results or expected performance.",
   },
   {
     heading: "Measure after launch",
     body: "Assign an owner to every input, preserve the baseline definition, and compare at agreed checkpoints. Record adoption and data-quality limits beside the financial result. If downtime or labor changes cannot be attributed to the system, report the uncertainty rather than claiming the entire change as software ROI.",
   },
  ],
  faqs: [
    { q: "How fast should a CMMS pay back?", a: "There is no universal period. Use your approved baseline, complete implementation cost, conservative benefit scenario, and organization-specific investment threshold." },
    { q: "What belongs in CMMS ROI?", a: "Include only quantified changes with a baseline and owner, such as documented downtime, paid labor, emergency freight, or finance-approved inventory carrying cost. Keep qualitative benefits separate." },
    { q: "Is the worked example a MaintenEase customer result?", a: "No. It is an illustrative calculation with explicit teaching inputs, not a benchmark, forecast, study, or customer outcome." },
    { q: "How do I calculate CMMS subscription cost for my team?", a: "Use the CMMS cost calculator to model published subscription prices by team size. Add your own setup, training, device, integration, and administration costs to build the full business case." },
  ],
  related: ["cmms-benchmarks-2026", "preventive-maintenance", "mttr", "cmms"],
 },
 {
  slug: "root-cause-analysis",
  term: "Root Cause Analysis (RCA)",
  short: "A structured method for finding why a failure happened — not just what broke — so the same problem can be eliminated instead of repeatedly repaired.",
  metaTitle: "Root Cause Analysis in Maintenance: 5 Whys & Fishbone",
  metaDescription: "Root Cause Analysis uncovers why equipment fails. Learn the 5 Whys, Fishbone diagrams, and how to track corrective actions in a CMMS.",
  sections: [
   {
    heading: "What is Root Cause Analysis?",
    body: "Root Cause Analysis (RCA) is a structured problem-solving process used to identify the underlying cause of a failure rather than just the symptoms. In a maintenance context, RCA turns a recurring bearing failure, a leaking seal, or a repeated trip event into a permanent fix. Teams that skip RCA end up in a loop — same asset, same failure, same repair — while teams that adopt it systematically shift work from reactive to planned and cut downtime hours over time.",
   },
   {
    heading: "When to run an RCA",
    body: "Not every work order deserves a full RCA. Trigger one when a failure is safety-related, causes significant downtime, exceeds a cost threshold (many teams use $5,000), or has repeated more than twice on the same asset in a rolling 90-day window. A CMMS makes these triggers visible: filter closed work orders by asset and failure code, and any asset that shows up three or more times is a candidate.",
   },
   {
    heading: "The 5 Whys method",
    body: "The 5 Whys is the simplest RCA technique — ask 'why' five times, each answer becoming the next question. Example: the conveyor stopped (why?) — the motor overheated (why?) — the cooling fan failed (why?) — the bearing seized (why?) — it was never lubricated (why?) — it wasn't on the PM schedule. The corrective action isn't 'replace the fan' — it's 'add lubrication PM.' Five is a guideline, not a rule; keep asking until you hit a systemic cause you can actually change.",
   },
   {
    heading: "Fishbone (Ishikawa) diagrams",
    body: "When a failure has multiple contributing factors, a Fishbone diagram organizes them into categories — commonly Man, Machine, Method, Material, Measurement, and Environment (the '6 Ms'). Teams brainstorm potential causes under each branch, then vote on which ones to investigate. Fishbones are ideal for group RCA sessions and for failures where the 5 Whys keeps splitting into parallel chains.",
   },
   {
    heading: "Turning findings into tracked corrective actions",
    body: "An RCA that ends in a report is worth almost nothing; an RCA that ends in scheduled work is worth everything. Every root cause should map to a corrective action with an owner, a due date, and a completion record. In MaintenEase, corrective actions become work orders or PM schedule changes linked back to the original failure, so you can prove the fix actually landed and measure whether the failure recurs.",
   },
  ],
  faqs: [
   { q: "How long should an RCA take?", a: "A 5 Whys walkthrough takes 15–30 minutes and can happen at the work-order close-out. A full Fishbone session with a cross-functional team takes 60–90 minutes. Reserve deeper investigations only for safety events or high-cost failures." },
   { q: "Who should lead an RCA?", a: "A maintenance supervisor or reliability engineer usually facilitates, but the technician who did the repair must be in the room — they hold the most useful evidence. Involve operators too when human factors are in play." },
   { q: "How does a CMMS help with Root Cause Analysis?", a: "A CMMS surfaces the failure history that makes RCA possible (same asset, same failure code, repeated), stores photos and notes from the original work order, and tracks the corrective actions that come out of the analysis so nothing falls through the cracks." },
   { q: "What is the difference between RCA and RCFA?", a: "RCFA (Root Cause Failure Analysis) is RCA applied specifically to equipment failures. In maintenance the terms are used interchangeably; RCA is the broader label used across quality, safety, and operations." },
 ],
 related: ["mtbf", "mttr", "preventive-maintenance", "corrective-maintenance"],
 internalLinks: [
 { label: "maintenance fishbone diagram generator", href: "/tools/root-cause-fishbone-generator" },
 { label: "work order template", href: "/templates/work-order-template" },
 ],
 },
 {
 slug: "deferred-maintenance",
 term: "Deferred Maintenance",
 short: "Maintenance work that is known, needed, and postponed — usually for budget or staffing reasons — and that quietly accumulates into a backlog with a price tag.",
 metaTitle: "Deferred Maintenance: Definition, Backlog & Real Cost",
 metaDescription: "Deferred maintenance is needed work that gets postponed. Learn how the backlog is measured, what it costs, and how to reduce it with a CMMS.",
 published: "2026-08-11",
 updated: "2026-08-11",
 sections: [
 {
 heading: "What is deferred maintenance?",
 body: "Deferred maintenance is work that has been identified as necessary but postponed to a later budget period. It is not the same as work nobody knew about: the roof survey, the chiller inspection, or the pavement condition report already flagged the problem, and someone decided to wait. Schools, hospitals, municipalities, and property portfolios use the term formally, because the accumulated value of that postponed work has to be reported. In industrial settings the same idea appears as maintenance backlog.",
 },
 {
 heading: "Why teams defer maintenance",
 body: "Three reasons dominate. Budget: capital is allocated annually and repairs compete with visible projects. Staffing: a short-handed team triages toward whatever is currently broken, so condition-based work slides. Visibility: if the finding lives in a PDF survey rather than the maintenance system, it never becomes a scheduled work order and effectively disappears until it fails. The third cause is the easiest to fix and the most commonly ignored.",
 },
 {
 heading: "The real cost of deferring work",
 body: "Postponing work rarely holds cost flat. A small roof leak becomes deck replacement and interior damage; a missed bearing lubrication becomes a motor rebuild plus unplanned downtime. Deferred maintenance also increases risk exposure — safety incidents, compliance findings, and insurance disputes all trace back to documented-but-unaddressed conditions. Facilities teams commonly express the exposure as a Facility Condition Index (FCI): the cost of the deferred backlog divided by the current replacement value of the asset or building.",
 table: {
 caption: "Reading the Facility Condition Index",
 headers: ["FCI", "Common interpretation", "What it usually implies"],
 rows: [
 ["Under 0.05", "Good", "Routine PM is keeping pace"],
 ["0.05 – 0.10", "Fair", "Backlog is growing; prioritize by risk"],
 ["0.10 – 0.30", "Poor", "Renewal funding needed, not just repairs"],
 ["Over 0.30", "Critical", "Replacement may cost less than catching up"],
 ],
 },
 },
 {
 heading: "How to measure your deferred maintenance backlog",
 body: "Start by making every deferred item a record rather than a memory: one entry per finding, with the asset, the estimated cost, the consequence of continued deferral, and the source (inspection, survey, or technician note). Total the estimated cost to get the backlog value, and divide by replacement value for FCI. Track backlog age too — work deferred for three consecutive years is behaving like a decision, not a delay. A CMMS gives you this for free if findings are captured as work orders with a status and a cost estimate.",
 },
 {
 heading: "Reducing the backlog without a budget increase",
 body: "Rank the backlog by risk rather than by age or by who shouted loudest: consequence of failure multiplied by likelihood, adjusted for asset criticality. Then attack three categories first — items that threaten safety or compliance, items whose repair cost escalates fastest, and items that are cheap to close and clear noise from the list. Convert repeat findings into preventive maintenance schedules so the same item stops re-entering the backlog every year, and bring the ranked list to budget conversations with cost-of-inaction numbers attached.",
 },
 ],
 faqs: [
 { q: "What is an example of deferred maintenance?", a: "A building survey flags a failing HVAC compressor and a section of roof at end of life. Neither is funded this year, so both are recorded and postponed. That recorded, unfunded work is deferred maintenance." },
 { q: "Is deferred maintenance the same as a maintenance backlog?", a: "They overlap. Backlog usually means all open work not yet completed, including recent requests. Deferred maintenance specifically means known work that has been consciously postponed beyond its recommended timing." },
 { q: "How is deferred maintenance calculated?", a: "Sum the estimated cost of every identified but unfunded maintenance item. Facilities teams then divide that total by the current replacement value of the asset or portfolio to produce the Facility Condition Index." },
 { q: "How does a CMMS reduce deferred maintenance?", a: "It keeps every deferred item as a live, costed record instead of a line in an old PDF, shows how long each item has been waiting, and converts recurring findings into preventive schedules so the backlog stops regenerating." },
 ],
 related: ["cmms", "preventive-maintenance", "reactive-maintenance", "corrective-maintenance", "cmms-roi"],
 },
 {
 slug: "infrared-thermography-inspection",
 term: "Infrared Thermography Camera Guide for Maintenance Inspections",
 short: "Infrared thermography cameras reveal surface-temperature patterns that can help trained maintenance teams find abnormal electrical, mechanical, insulation, and process conditions without contact.",
 metaTitle: "Infrared Thermography Camera Guide for Maintenance",
 metaDescription: "Choose an infrared camera for maintenance routes. Learn key specifications, inspection controls, severity triage, documentation, and work-order follow-up.",
 published: "2026-08-17",
 updated: "2026-08-17",
 sections: [
 {
 heading: "What an infrared thermography camera does",
 body: "An infrared thermography camera converts detected infrared radiation into a thermal image and estimated surface temperatures. Maintenance teams use the patterns to compare similar components, find unexpected hot or cold areas, and trend changes over time on electrical connections, motors, bearings, steam systems, insulation, roofs, process equipment, and building envelopes. A thermal pattern is an inspection finding, not a standalone diagnosis: load, emissivity, reflected temperature, distance, focus, weather, and operating state can all change the image.",
 },
 {
 heading: "How to choose a camera for maintenance work",
 body: "Match the camera to the smallest target, working distance, temperature range, and environment in the route. Compare detector resolution and field of view together, not resolution alone. Check thermal sensitivity for subtle building or mechanical differences, temperature accuracy for measurement work, focus options, measurement tools, voice or text annotations, visible-light pairing, route support, reporting software, battery life, environmental rating, calibration support, and whether the model can safely be used from the required distance. A low-cost camera can be useful for close comparative checks; small electrical targets at distance usually require more pixels on target and better optics.",
 table: {
 caption: "Infrared camera specifications that affect maintenance inspections",
 headers: ["Specification", "Why it matters", "Question to test"],
 rows: [
 ["Detector resolution and optics", "Determine how many pixels cover the target at the inspection distance", "Can the camera resolve the smallest connection, bearing, or insulation defect from the safe position?"],
 ["Thermal sensitivity", "Affects the ability to distinguish small temperature differences", "Are subtle envelope, moisture, or mechanical patterns part of the route?"],
 ["Temperature range and accuracy", "Set the measurable range and stated uncertainty", "Does the range cover normal and abnormal equipment temperatures with margin?"],
 ["Focus and measurement controls", "Poor focus and incorrect parameters weaken temperature data", "Can the operator control focus, emissivity, reflected temperature, distance, and span?"],
 ["Route and reporting workflow", "Keeps inspection points, settings, images, notes, and history together", "Can results be tied to a stable asset ID and exported into the maintenance record?"],
 ],
 },
 },
 {
 heading: "Build a repeatable thermography inspection route",
 body: "Give every inspection point a stable asset and component ID, safe viewing position, reference image, required operating state or load, camera and lens, measurement parameters, image framing, and comparison method. Capture thermal and visible images from the same position. Record load, ambient conditions, emissivity, reflected apparent temperature, distance, focus, maximum and reference temperatures, delta-T comparison, observed pattern, and operator. Repeatable routes matter more than isolated attractive images because trend quality depends on comparable conditions.",
 },
 {
 heading: "Use severity bands as a triage workflow",
 body: "Do not copy a universal temperature table into every program. A defensible severity decision considers the component type and rating, absolute temperature, temperature rise above a similar loaded component or ambient reference, load at inspection, failure consequence, rate of change, measurement uncertainty, and applicable manufacturer or site criteria. Use local bands such as monitor, plan, urgent, and immediate only after a qualified program owner defines the thresholds and actions. An immediate electrical hazard follows the site electrical-safety procedure; it is not handled as an ordinary work-order priority.",
 },
 {
 heading: "Turn a thermal finding into a work order",
 body: "Create a follow-up record with the asset and component ID, thermal and visible images, measurement settings, operating conditions, apparent and reference temperatures, delta-T, severity rationale, suspected failure modes, required safety controls, responsible trade, due date, and verification plan. After repair, capture a comparable image under similar load and close the work order only when the acceptance criterion is met. Keep both the original and verification images in the asset history.",
 },
 {
 heading: "Electrical thermography safety",
 body: "Opening or approaching energized electrical equipment can expose a worker to shock and arc-flash hazards even though the camera itself is non-contact. Only people qualified for the specific equipment and task should perform testing on or near exposed energized parts, using the organization’s electrical-safety program, approach boundaries, PPE, equipment condition controls, and approved procedure. When safe access cannot be established, change the method or operating condition rather than treating the camera as protection.",
 },
 ],
 faqs: [
 { q: "What is the best infrared thermography camera for maintenance?", a: "The best camera is the one that resolves the smallest target from the required safe distance, covers the temperature range, and fits the route and reporting workflow. Detector resolution, optics, focus, thermal sensitivity, accuracy, annotations, calibration support, and software matter more than one headline specification." },
 { q: "Can an infrared camera see through walls or electrical panels?", a: "No. A thermal camera primarily shows infrared radiation from the visible surface. It does not see through ordinary walls or closed metal panels. Apparent patterns can still be influenced by surface finish, reflections, airflow, and internal heat transfer." },
 { q: "How often should thermography inspections be performed?", a: "Set frequency from asset criticality, failure history, operating cycle, electrical or mechanical risk, manufacturer guidance, and the rate at which conditions can change. High-consequence or deteriorating equipment may need shorter intervals than stable low-risk assets." },
 { q: "Does a hot spot always mean the component is failing?", a: "No. Load, emissivity, reflections, geometry, airflow, focus, and normal design can create apparent temperature differences. Confirm the image under known conditions and combine it with inspection, electrical, mechanical, or process evidence before diagnosing the failure mode." },
 ],
 related: ["predictive-maintenance", "condition-based-maintenance", "preventive-maintenance", "root-cause-analysis"],
 internalLinks: [
 { label: "preliminary hazard analysis template", href: "/templates/preliminary-hazard-analysis-template" },
 { label: "preventive maintenance software", href: "/solutions/preventive-maintenance-software" },
 { label: "asset management software", href: "/solutions/asset-management-software" },
 ],
 sources: [
 { label: "U.S. Department of Energy: Operations & Maintenance Best Practices Guide", url: "https://www1.eere.energy.gov/femp/pdfs/om_6.pdf" },
 { label: "OSHA: Training and PPE for testing on electrical equipment", url: "https://www.osha.gov/laws-regs/standardinterpretations/1998-06-22-0" },
 { label: "FLIR documentation: Inspection Route", url: "https://docs.flir.com/T810587/en-US/latest/s18.html" },
 { label: "FLIR: How emissivity affects thermal imaging", url: "https://www.flir.com/discover/professional-tools/how-does-emissivity-affect-thermal-imaging/" },
 ],
 },
 ...emergingAiGlossary,
];

export const getGlossaryTerm = (slug: string) =>
 glossary.find((g) => g.slug === slug);
