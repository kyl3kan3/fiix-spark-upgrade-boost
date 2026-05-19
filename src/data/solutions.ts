export type Solution = {
  slug: string;
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
    name: "Work Order Software",
    h1: "Work Order Software that turns requests into completed work",
    tagline: "Capture, assign, and close work orders without the spreadsheet sprawl.",
    metaTitle: "Work Order Software — Capture, Assign & Close Faster | MaintenEase",
    metaDescription: "Work order software for maintenance teams. Submit, assign, prioritize, and close work from any device. Free trial — no credit card.",
    intro:
      "MaintenEase replaces clipboards, email chains, and shared spreadsheets with a single work order queue your whole team works from. Requests come in through a portal, QR code, or quick mobile form. Each work order carries the asset, location, priority, assignee, parts, photos, and a full audit trail. Technicians close work from their phone in the field; managers see status in real time.",
    benefits: [
      { title: "Faster response", body: "Work orders route to the right technician the moment they are submitted, with mobile push alerts so urgent issues never sit in an inbox." },
      { title: "Honest reporting", body: "Every status change is timestamped. Backlog, mean time to repair, and technician throughput stop being a guess." },
      { title: "Lower friction for requesters", body: "Staff or tenants submit issues through a simple QR-coded form — no app install, no training required." },
    ],
    features: [
      { title: "Mobile-first work orders", body: "Create, update, and close work orders from a phone with photos, voice-to-text, and offline support." },
      { title: "Smart routing and priority", body: "Auto-assign by asset, location, trade, or priority. Escalate when SLAs slip." },
      { title: "Parts and labor on every work order", body: "Track time, parts consumed, and total cost per work order, asset, and location." },
      { title: "Approvals and SLAs", body: "Optional approval steps for high-cost work; SLA timers that visibly count down on the work order card." },
    ],
    useCases: [
      "Manufacturing plants drowning in reactive breakdown calls",
      "Property managers handling resident maintenance requests",
      "Facility teams supporting multiple buildings or campuses",
      "Hospitality and retail chains coordinating across locations",
    ],
    faqs: [
      { q: "Can requesters submit work without a MaintenEase login?", a: "Yes. Public request links and QR codes let staff or tenants submit issues without creating an account; they get email or SMS updates as the work progresses." },
      { q: "Do you support recurring work orders?", a: "Yes. Any recurring task lives as a preventive maintenance schedule and generates work orders automatically." },
    ],
  },
  {
    slug: "preventive-maintenance-software",
    name: "Preventive Maintenance Software",
    h1: "Preventive Maintenance Software that stops failures before they cost you",
    tagline: "Schedule by date, runtime, or meter — and watch reactive work shrink.",
    metaTitle: "Preventive Maintenance Software | Schedule, Track & Audit",
    metaDescription: "Preventive maintenance software that schedules work by date, runtime, or meter reading. Cut downtime and pass audits with confidence.",
    intro:
      "MaintenEase turns preventive maintenance from a calendar reminder into an audited, automated process. Build schedules per asset by date, runtime hours, or meter reading. Work orders generate themselves, route to the right technician, and surface the procedure, parts, and safety steps inline. Compliance reports — fire systems, life safety, regulated inspections — export with a click.",
    benefits: [
      { title: "Fewer breakdowns", body: "Teams typically cut reactive work by 30–50% within the first year of running preventive maintenance on a schedule." },
      { title: "Smoother technician days", body: "Planned work replaces firefighting. Workload is visible a week ahead, not discovered each morning." },
      { title: "Audit-ready records", body: "Every PM closes with a timestamped record, photos, and signatures — exactly what regulators and insurance carriers want to see." },
    ],
    features: [
      { title: "Flexible schedules", body: "Time, runtime, meter, condition-based — or any combination. Holiday blackouts and grouping rules included." },
      { title: "Procedures and checklists", body: "Step-by-step instructions, pass/fail items, photo evidence, and required signatures attached to every PM." },
      { title: "Compliance pack", body: "Fire-system tests, sprinkler inspections, generator runs, electrical thermography — pre-built templates and audit exports." },
      { title: "Schedule health insights", body: "See which PMs are overdue, which assets keep failing between PMs, and where intervals should change." },
    ],
    useCases: [
      "Compliance-heavy facilities (healthcare, education, public sector)",
      "Manufacturing teams chasing a higher planned-to-reactive ratio",
      "Property managers managing recurring life-safety tasks",
      "Fleet operators running meter-based service schedules",
    ],
    faqs: [
      { q: "Can we import our existing PM schedule from a spreadsheet?", a: "Yes — CSV import is supported, and our team will help map columns on the first import." },
      { q: "What happens if a PM is missed?", a: "Missed PMs stay visible in a dedicated overdue queue with an aging color code, and roll up into compliance reports so they cannot be quietly forgotten." },
    ],
  },
  {
    slug: "facility-maintenance-software",
    name: "Facility Maintenance Software",
    h1: "Facility Maintenance Software for buildings that have to just work",
    tagline: "One system for assets, work orders, PMs, and tenant requests across every building.",
    metaTitle: "Facility Maintenance Software | Multi-Site Buildings & Assets",
    metaDescription: "Facility maintenance software for multi-site teams. Manage assets, work orders, PMs, and occupant requests in one place.",
    intro:
      "MaintenEase gives facility teams a single system across every building, floor, and room they look after. Register assets with locations, warranties, and manuals. Schedule the predictable work. Collect occupant requests through a QR code on the wall. Report up to leadership with numbers that hold up to scrutiny.",
    benefits: [
      { title: "Multi-site visibility", body: "See backlog, response time, and PM compliance per building and per portfolio in one dashboard." },
      { title: "Happier occupants", body: "Tenants and staff get automatic status updates from the moment they submit a request to the moment work is complete." },
      { title: "Lower operating cost", body: "Standardized vendor management, warranty tracking, and parts visibility quietly trim 5–15% from facility budgets." },
    ],
    features: [
      { title: "Nested locations", body: "Portfolio → site → building → floor → room — assets and work orders inherit the hierarchy and roll up cleanly." },
      { title: "Vendor and contractor management", body: "COI tracking, scoped POs, vendor performance scoring, and one work-order queue across in-house and outsourced work." },
      { title: "Occupant request portal", body: "Branded QR codes per location capture requests with photos, location, and access permission — no app install required." },
      { title: "Compliance and audit", body: "Life-safety, ADA, environmental, and inspection programs pre-built and exportable for any audit." },
    ],
    useCases: [
      "Corporate real estate and workplace teams",
      "Healthcare and life sciences facilities",
      "K–12 and higher education campuses",
      "Retail, hospitality, and restaurant chains",
    ],
    faqs: [
      { q: "Can we restrict what each building manager sees?", a: "Yes. Role and location-based permissions limit each user to the sites and data they are responsible for." },
      { q: "Do you integrate with our building management system?", a: "MaintenEase exposes a documented API and supports common BMS triggers via webhooks — talk to us about the specific system in play." },
    ],
  },
  {
    slug: "fleet-maintenance-software",
    name: "Fleet Maintenance Software",
    h1: "Fleet Maintenance Software that keeps vehicles safe, compliant, and on the road",
    tagline: "Meter-based PMs, DVIRs, and compliance reports — without the spreadsheet.",
    metaTitle: "Fleet Maintenance Software | DVIRs, PMs & Compliance",
    metaDescription: "Fleet maintenance software with meter-based PMs, DVIRs, and audit-ready records. Keep every vehicle safe, compliant, and earning.",
    intro:
      "MaintenEase treats every vehicle as an asset with its own service history, parts, warranties, and PM schedule. Telematics-fed odometer readings trigger PMs the moment a threshold is crossed. Drivers complete DVIRs on their phone before and after every shift. Compliance reports export ready for any inspection.",
    benefits: [
      { title: "Less downtime", body: "Meter-based scheduling and parts visibility mean vehicles come into the shop ready and leave faster." },
      { title: "DOT-ready records", body: "Every inspection, every repair, every DVIR — timestamped, signed, and exportable per vehicle." },
      { title: "Lower cost per mile", body: "Track cost per mile by vehicle and class to spot which units to keep, repair, or retire." },
    ],
    features: [
      { title: "Meter-based PMs", body: "Schedule by mileage, engine hours, or fuel burn. Pulls readings from telematics so nothing has to be entered by hand." },
      { title: "Mobile DVIRs", body: "Drivers complete inspections from their phone with photos and signatures; defects open work orders automatically." },
      { title: "Parts, warranty, and recalls", body: "Track parts per vehicle, recover warranty claims, and flag affected units when a recall lands." },
      { title: "Compliance exports", body: "DOT, FMCSA, and provincial reports built and exportable in one click." },
    ],
    useCases: [
      "Last-mile delivery and logistics fleets",
      "Service fleets (HVAC, plumbing, electrical contractors)",
      "Municipal fleets and public works",
      "Heavy equipment and construction yards",
    ],
    faqs: [
      { q: "Do you integrate with telematics providers?", a: "Yes — common providers (Samsara, Geotab, and others) can feed odometer and engine-hour readings into MaintenEase via API." },
      { q: "Can drivers use this without a full MaintenEase license?", a: "Yes. Drivers can complete DVIRs through a lightweight driver role at a reduced per-seat cost." },
    ],
  },
];

export const getSolution = (slug: string) => solutions.find((s) => s.slug === slug);