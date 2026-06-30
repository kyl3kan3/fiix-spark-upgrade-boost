export type GlossaryTerm = {
 slug: string;
 term: string;
 short: string;
 metaTitle: string;
 metaDescription: string;
 sections: { heading: string; body: string }[];
 faqs: { q: string; a: string }[];
 related: string[];
};

export const glossary: GlossaryTerm[] = [
 {
 slug: "cmms",
 term: "CMMS (Computerized Maintenance Management System)",
 short: "Software that centralizes work orders, assets, and preventive maintenance schedules so teams stop relying on spreadsheets and paper.",
 metaTitle: "What is a CMMS? A Plain-English Guide for Maintenance Teams",
 metaDescription: "A CMMS is software that centralizes work orders, assets, and preventive maintenance. Learn what it does, who needs one, and how to choose.",
 sections: [
 {
 heading: "What does CMMS stand for?",
 body: "CMMS stands for Computerized Maintenance Management System. In practice it is the system of record for everything a maintenance team does — every asset they look after, every work order they raise, every inspection they complete, and every preventive task that comes due. Before CMMS software existed, this information lived in clipboards, whiteboards, and a tangle of spreadsheets. A modern CMMS replaces all of that with one searchable place that the whole team works from.",
 },
 {
 heading: "What does a CMMS actually do?",
 body: "Most CMMS platforms cover four core jobs. First, an asset registry: every machine, building, vehicle, or piece of equipment with its location, manuals, photos, and service history. Second, work orders: create, assign, prioritize, complete, and close them with a full audit trail. Third, preventive maintenance: recurring schedules that automatically generate work orders by date, meter reading, or runtime. Fourth, reporting: how many work orders are open, which assets fail most often, mean time between failures, technician throughput.",
 },
 {
 heading: "Who needs a CMMS?",
 body: "Any team responsible for physical assets benefits from a CMMS — manufacturing plants, facility managers, property managers, fleet operators, hospitals, schools, hotels, and municipal operations. The threshold is usually not company size but asset complexity. If you maintain more than a handful of assets, preventive work keeps slipping, or compliance audits require service history, a CMMS pays for itself quickly through avoided downtime alone.",
 },
 {
 heading: "CMMS vs EAM vs FSM",
 body: "A CMMS focuses on maintenance operations. An EAM (Enterprise Asset Management) system covers the full lifecycle of an asset, including procurement, depreciation, and disposal — it overlaps heavily with finance. FSM (Field Service Management) is geared toward dispatching technicians to customer sites and handling billing. Many teams start with a CMMS and only graduate to EAM or FSM when their needs clearly outgrow it.",
 },
 ],
 faqs: [
 { q: "Is CMMS the same as maintenance management software?", a: "Yes — the terms are used interchangeably. CMMS is the older industry acronym; maintenance management software is the plain-English version." },
 { q: "Do I need a CMMS if I only have a few assets?", a: "Probably not. Once you cross roughly 20–30 assets, or once preventive work routinely slips past its due date, the math usually flips in favor of a CMMS." },
 { q: "Is a CMMS expensive?", a: "Modern cloud CMMS platforms (including MaintenEase) charge per user per month and start well under what a single avoided breakdown would cost." },
 ],
 related: ["preventive-maintenance", "work-order", "mro"],
 },
 {
 slug: "preventive-maintenance",
 term: "Preventive Maintenance",
 short: "Scheduled service performed before equipment fails — by calendar date, runtime hours, or meter reading — to extend asset life and avoid downtime.",
 metaTitle: "What is Preventive Maintenance? Definition & Examples",
 metaDescription: "Preventive maintenance is scheduled service done before equipment fails. Learn how to set frequencies, what to track, and where to start.",
 sections: [
 {
 heading: "Definition",
 body: "Preventive maintenance (PM) is any service task performed on a recurring schedule with the goal of preventing failure rather than reacting to it. Schedules can be time-based (every 30 days), runtime-based (every 250 operating hours), meter-based (every 5,000 miles), or condition-based (when a sensor reading crosses a threshold). The opposite of preventive maintenance is reactive or run-to-failure maintenance.",
 },
 {
 heading: "Why it matters",
 body: "Studies across multiple industries consistently find that a dollar spent on preventive work avoids three to nine dollars of reactive repair, lost production, and emergency overtime. Preventive maintenance also extends asset life, smooths out the workload for technicians, and turns chaotic days into planned ones. It is the single biggest lever a maintenance team has to control cost.",
 },
 {
 heading: "How to set a PM schedule",
 body: "Start with the manufacturer's recommended intervals — they are conservative, but they are a defensible starting point. Layer in observed failure patterns from your own history (every CMMS will surface these). Group PMs by asset, by location, and by trade so a single technician visit knocks out several tasks at once. Review schedules quarterly: tasks that have never found anything wrong are candidates to lengthen, and assets that keep failing between PMs are candidates to shorten.",
 },
 {
 heading: "Common preventive maintenance tasks",
 body: "Lubrication, filter changes, belt and bearing inspections, calibration checks, fluid sampling, infrared scans of electrical panels, fire-system tests, HVAC coil cleans, vehicle oil changes, and tire rotations. Most preventive work is short, predictable, and ideal for assigning to junior technicians from a checklist.",
 },
 ],
 faqs: [
 { q: "How is preventive maintenance different from predictive maintenance?", a: "Preventive runs on a fixed schedule. Predictive uses live sensor data (vibration, temperature, current draw) to trigger work only when the asset shows it is needed." },
 { q: "What percentage of work should be preventive?", a: "World-class maintenance teams typically run 70–80% planned (preventive + scheduled) and 20–30% reactive. Most teams start much closer to 20/80 and improve from there." },
 ],
 related: ["cmms", "work-order", "fleet-maintenance"],
 },
 {
 slug: "work-order",
 term: "Work Order",
 short: "A formal request that describes a maintenance task — what needs doing, on which asset, by whom, when — and tracks it from creation to completion.",
 metaTitle: "What is a Work Order? Anatomy, Lifecycle, and Examples",
 metaDescription: "A work order is the formal record of a maintenance task. Learn what fields it contains, how it flows through statuses, and best practices.",
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
 body: "Start by measuring it: a CMMS tags every work order as planned or reactive so you can see the ratio. Then attack the worst offenders — the handful of assets generating most of the emergency calls usually reveal a clear preventive fix. Move those onto schedules, track whether breakdowns drop, and repeat. Most teams start near 80% reactive and work toward the 20–30% that world-class operations sustain.",
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
 metaDescription: "Predictive maintenance uses sensor data to fix equipment just before it fails. Learn how it works, how it differs from preventive maintenance, and where to start.",
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
 related: ["preventive-maintenance", "condition-based-maintenance", "reactive-maintenance"],
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
 metaDescription: "Condition-based maintenance triggers work when a measured condition crosses a threshold. Learn how CBM works and how it compares to preventive and predictive maintenance.",
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
 metaTitle: "What is MTBF (Mean Time Between Failures)? Formula & Examples",
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
 metaTitle: "What is MTTR (Mean Time To Repair)? Formula & How to Improve It",
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
];

export const getGlossaryTerm = (slug: string) =>
 glossary.find((g) => g.slug === slug);