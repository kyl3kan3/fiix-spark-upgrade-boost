import type { GlossaryTerm } from "./glossary";

const published = "2026-08-03";

export const emergingAiGlossary: GlossaryTerm[] = [
  {
    slug: "ai-maintenance-assistant",
    term: "AI Maintenance Assistant",
    short: "An AI interface that helps maintenance teams find records, summarize work, prepare actions, and spend less time navigating CMMS screens.",
    metaTitle: "AI Maintenance Assistant: Uses, Benefits & Safety",
    metaDescription: "See what an AI maintenance assistant can do, where it saves time, how it differs from an agent, and which controls maintenance teams need.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is an AI maintenance assistant?",
        body: "An AI maintenance assistant is a conversational interface for maintenance information and workflows. It can answer questions about work orders, assets, costs, locations, requests, and equipment risk by using authorized CMMS data. More capable assistants can also prepare structured actions, such as drafting a work order from a technician's description. The useful version is not a generic chatbot trained on public maintenance articles. It works with the team's current records, respects company access rules, and makes the result easy for a supervisor or technician to verify.",
      },
      {
        heading: "The best early use cases",
        body: "Start with time-consuming questions that have objective answers: which urgent work orders remain open, what failed repeatedly this quarter, which preventive tasks are overdue, and what requests arrived overnight. An assistant can gather these records and produce a short operational summary. It can also turn rough notes into a complete proposed work order with a title, description, priority, asset, and due date. These jobs reduce searching and typing without asking AI to diagnose equipment or make an independent safety decision.",
      },
      {
        heading: "Assistant vs agent vs predictive model",
        body: "An assistant primarily retrieves, explains, and drafts. An agent can invoke approved tools and complete a software action. A predictive model calculates equipment risk from history or condition data. A single product may include all three, but buyers should evaluate them separately. A polished chat box is not proof of reliable automation, and an equipment risk score does not mean a system can safely schedule or approve maintenance. Ask vendors to demonstrate the exact records used, the action boundaries, and what happens when the request is ambiguous.",
      },
      {
        heading: "What good answers look like",
        body: "A trustworthy answer names the relevant records, preserves identifiers, distinguishes facts from suggestions, and admits when required information is missing. If the assistant says an asset is high risk, it should show the factors behind that conclusion. If it prepares a work order, it should preview every field before submission. Answers should remain scoped to the signed-in user's company and role. Maintenance work is operational, so traceability matters more than conversational polish: the team must be able to move from a summary back to the underlying CMMS record.",
      },
      {
        heading: "Security and human oversight",
        body: "Use individual authentication rather than a shared master account. Separate read operations from write operations, grant only the tools a role needs, and retain the normal CMMS audit history for records created through AI. Require a person to review safety classifications, shutdown choices, regulatory conclusions, and physical work instructions. For write actions, the assistant should display the proposed change and return the created record identifier. These controls let the assistant remove administrative friction without making it the final authority over equipment or people.",
      },
      {
        heading: "How to run a two-week pilot",
        body: "Choose one supervisor and three repeatable questions. Record how long each question takes manually, then compare the assistant's speed and accuracy for two weeks. Track incorrect asset matches, missing fields, stale records, and questions the assistant cannot answer. Clean up naming and permissions before adding more capability. After the read-only pilot is reliable, add one narrow write workflow such as work-order creation with confirmation. Expand based on measured time saved and data quality, not on the number of prompts the demo can answer.",
      },
    ],
    faqs: [
      { q: "Can an AI maintenance assistant create work orders?", a: "Yes, when the CMMS exposes an authenticated work-order tool. The assistant should preview structured fields and preserve the user's normal permissions and audit history." },
      { q: "Does an AI maintenance assistant replace a planner?", a: "No. It reduces searching, summarizing, and data entry. Planners still make priority, safety, labor, parts, and shutdown decisions." },
      { q: "What data does an AI maintenance assistant need?", a: "Useful assistants work from current assets, work orders, requests, locations, procedures, and maintenance history. Better source data produces better answers." },
      { q: "How should teams evaluate accuracy?", a: "Compare every pilot answer with the underlying CMMS record, log errors by type, and delay write access until read-only retrieval is consistently reliable." },
    ],
    related: ["agentic-cmms", "agentic-maintenance-workflows", "ai-work-order-automation", "equipment-risk-scoring"],
    sources: [
      { label: "Fiix Maintenance Assistant Experience announcement", url: "https://fiixsoftware.com/blog/fiix-max/" },
      { label: "Johnson Controls 2026 facilities AI survey findings", url: "https://www.johnsoncontrols.com/building-insights/feature-story/top-3-insights-2026-ai-survey-facilities-managers" },
    ],
  },
  {
    slug: "cmms-for-chatgpt",
    term: "CMMS for ChatGPT",
    short: "A secure connection that lets ChatGPT use approved CMMS tools to retrieve maintenance records or complete defined workflow steps for an authenticated user.",
    metaTitle: "CMMS for ChatGPT: Connect Maintenance Data with MCP",
    metaDescription: "Learn how a CMMS can connect to ChatGPT through authenticated MCP tools for assets, requests, work orders, and maintenance summaries.",
    published,
    updated: published,
    sections: [
      {
        heading: "What does CMMS for ChatGPT mean?",
        body: "A CMMS for ChatGPT gives a compatible ChatGPT experience access to narrowly defined maintenance tools after the user authenticates. Instead of copying records into a conversation, the AI can request current information from the system of record. A tool might list open work orders, search assets, show locations, read incoming requests, or create a work order. The connection should not expose the database directly. It should publish controlled operations with clear input rules while the CMMS continues to enforce identity, tenant boundaries, and validation.",
      },
      {
        heading: "How MCP connects ChatGPT and a CMMS",
        body: "Model Context Protocol provides a standard description of tools an AI client can discover and call. The CMMS hosts an MCP server, each tool declares its purpose and inputs, and the user authorizes access. ChatGPT can then select an appropriate tool during a task, provide structured arguments, and use the returned records in its answer. Current OpenAI developer documentation identifies MCP as a supported tool capability for modern tool-using models. Availability and installation steps can vary by ChatGPT plan, workspace policy, and product surface, so teams should verify their current account controls before rollout.",
      },
      {
        heading: "Useful prompts for maintenance teams",
        body: "Good prompts describe an operational outcome: 'Summarize urgent open work orders by location,' 'Find the service history for Pump P-04,' or 'Show new requests that do not yet have a work order.' If write access is enabled, a supervisor might ask ChatGPT to prepare a high-priority work order from a selected request. The prompt is only the interface. Reliability comes from the underlying tool schema, authentication, and source records. Users should reference specific assets or locations whenever names could be ambiguous.",
      },
      {
        heading: "What MaintenEase can expose",
        body: "MaintenEase has an OAuth-authenticated MCP service whose current tools can list work orders, assets, locations, and incoming maintenance requests and create work orders. Calls run with the signed-in user's token, and database row-level security keeps results scoped to that user's company. This means a ChatGPT integration can operate through defined maintenance actions rather than receive unrestricted database credentials. Administrators should still decide which users need the connection and which write tools are appropriate for each workflow.",
      },
      {
        heading: "Security checklist before connecting",
        body: "Confirm that authentication is individual, tokens can be revoked, and every data request remains tenant-scoped. Review the difference between read and write tools. Test duplicate asset names, missing due dates, invalid priorities, and users with limited roles. Do not paste confidential maintenance data into an unrelated public conversation as a substitute for integration. For actions that change records, configure the AI experience to preview the proposed fields and require confirmation where ambiguity or operational risk exists.",
      },
      {
        heading: "A staged rollout plan",
        body: "Begin with a read-only pilot for supervisors and a small prompt library. Compare every result with the CMMS and document failure cases. Train users to ask for record identifiers and source details, not only polished summaries. Once retrieval is dependable, enable one write action such as creating a pending work order. Review created records weekly and keep safety-critical decisions outside the integration. Expand access only after the organization understands workspace policy, permissions, retention expectations, and who owns support when an AI tool call fails.",
      },
    ],
    faqs: [
      { q: "Can ChatGPT connect directly to a CMMS?", a: "It can use a CMMS that exposes compatible authenticated tools, such as an MCP server. Exact setup depends on the ChatGPT surface, plan, and workspace policy." },
      { q: "Can ChatGPT create a maintenance work order?", a: "Yes, if the connected CMMS provides an authorized create-work-order tool. The action should use the signed-in user's permissions and return the created record." },
      { q: "Does ChatGPT receive the entire maintenance database?", a: "It should not. A well-designed integration returns only the records needed by an approved tool call and preserves CMMS access controls." },
      { q: "Is MCP the same as the OpenAI API?", a: "No. MCP is a protocol for exposing tools and context. OpenAI models and products can use MCP tools, while the OpenAI API is a separate platform for building model-powered applications." },
    ],
    related: ["maintenance-mcp-server", "agentic-cmms", "ai-maintenance-assistant", "ai-work-order-automation"],
    sources: [
      { label: "OpenAI developer documentation", url: "https://developers.openai.com/" },
      { label: "OpenAI model documentation showing MCP tool support", url: "https://developers.openai.com/api/docs/models/chat-latest" },
    ],
  },
  {
    slug: "maintenance-mcp-server",
    term: "Maintenance MCP Server",
    short: "A Model Context Protocol service that exposes controlled maintenance data and actions to compatible AI clients without granting direct database access.",
    metaTitle: "Maintenance MCP Server: Tools, Security & CMMS Design",
    metaDescription: "Understand how a maintenance MCP server exposes CMMS tools, handles OAuth and tenant isolation, and supports safe AI maintenance workflows.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is a maintenance MCP server?",
        body: "A maintenance MCP server is an interface that publishes CMMS capabilities as structured tools for compatible AI clients. Each tool has a name, a purpose, an input schema, and a handler that applies application rules. Typical tools list work orders, find assets, retrieve locations, read maintenance requests, or create a work order. The server sits between the AI client and the maintenance system, so the model does not receive database credentials or invent its own query. This makes MCP a practical boundary for tool-using maintenance assistants and agents.",
      },
      {
        heading: "The minimum useful tool set",
        body: "Start small. Read tools should cover the records people ask about most: open work orders, assets, locations, and incoming requests. One carefully constrained write tool can create a pending work order with validated title, priority, due date, description, and asset identifier. Avoid publishing dozens of overlapping tools at launch. Clear names and narrow inputs help the AI select correctly, simplify permission review, and make failures easier to diagnose. New tools should correspond to a real, measured workflow rather than an imagined autonomous future.",
      },
      {
        heading: "OAuth and user identity",
        body: "The server should know which person authorized the call. OAuth lets the AI client obtain a scoped token without receiving the user's password. The MCP handler forwards that identity to the CMMS data layer, where normal role and company rules apply. Shared organization-wide credentials weaken accountability because every tool call looks the same and may expose more data than a user should see. Tokens need revocation, expiration, and an issuer the CMMS validates. Authentication proves identity; authorization still determines which records and actions that identity may access.",
      },
      {
        heading: "Tenant isolation and validation",
        body: "A multi-tenant CMMS must enforce company boundaries at the database layer as well as in tool code. MaintenEase uses the signed-in token with row-level security so queries remain scoped to the user's company. Write handlers also derive the company and creator from authenticated context rather than accept those sensitive fields from the model. Input schemas should constrain priorities, identifiers, limits, and date formats. The AI may choose arguments, but the server is responsible for rejecting invalid or unauthorized requests.",
      },
      {
        heading: "Read, write, and destructive annotations",
        body: "Tool metadata should tell clients whether an operation is read-only, idempotent, or potentially destructive. Listing assets is read-only. Creating a work order changes state but is normally non-destructive. Closing, deleting, or bulk-editing work would carry higher risk and should require stronger confirmation or remain unavailable. These distinctions help AI clients plan safer interactions and help administrators review exposure. Metadata is not a substitute for authorization, validation, and audit logs, but it makes the contract clearer to both software and people.",
      },
      {
        heading: "Testing a production maintenance MCP service",
        body: "Test with multiple roles and companies, not only an administrator account. Verify that one tenant cannot retrieve another tenant's assets, malformed identifiers fail cleanly, large limits are capped, and unauthenticated calls return no data. Exercise ambiguous asset names and missing work-order fields. Log tool name, authenticated user, outcome, latency, and record identifier without leaking sensitive content. Finally, test client behavior when the server times out or returns an error: the AI should report the failure, not pretend the maintenance action succeeded.",
      },
    ],
    faqs: [
      { q: "What tools should a CMMS MCP server provide?", a: "Begin with narrow tools for work orders, assets, locations, and requests, then add a confirmation-aware work-order creation tool if the read-only pilot is reliable." },
      { q: "Should an MCP server connect directly to the database?", a: "It should use the application's authenticated data layer and database security policies rather than expose unrestricted database access to the AI client." },
      { q: "Is OAuth required for a maintenance MCP server?", a: "Individual OAuth is a strong choice for user-facing multi-tenant systems because it preserves identity and revocation. Other environments may use different secure authentication appropriate to their architecture." },
      { q: "How do I know whether a tool call succeeded?", a: "The server should return an explicit result and record identifier. Clients must surface errors rather than infer success from the original request." },
    ],
    related: ["agentic-cmms", "cmms-for-chatgpt", "ai-work-order-automation", "cmms"],
    sources: [
      { label: "OpenAI developer documentation", url: "https://developers.openai.com/" },
      { label: "OpenAI model documentation showing MCP support", url: "https://developers.openai.com/api/docs/models/gpt-5.6-sol" },
    ],
  },
  {
    slug: "ai-work-order-automation",
    term: "AI Work Order Automation",
    short: "Using AI to turn maintenance requests and operational context into structured work orders while keeping priorities, approvals, and execution under human control.",
    metaTitle: "AI Work Order Automation: Workflow, Controls & Examples",
    metaDescription: "Learn how AI can triage requests, draft work orders, assign structured fields, and reduce maintenance administration without sacrificing control.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is AI work order automation?",
        body: "AI work order automation converts unstructured maintenance information into a structured workflow. A requester may submit a sentence and photo; the system can identify likely location or asset, propose a clear title, summarize the issue, and suggest priority. An authorized agent can then create the record through the CMMS. The goal is not to let AI decide what physical repair to perform. It is to remove the repetitive intake and data-entry work that causes incomplete requests, delayed triage, and maintenance activity that never reaches the system of record.",
      },
      {
        heading: "From request to complete work order",
        body: "A strong flow has five stages: capture the original request, retrieve relevant asset and location context, propose structured fields, let a person review uncertain or high-risk details, and create the work order with a link back to the source request. Preserve the requester's words and attachments so the technician can inspect original evidence. If the asset match is uncertain, present choices rather than silently guessing. The automation should make records more complete without hiding how it reached them.",
      },
      {
        heading: "Which fields AI can prepare safely",
        body: "AI is well suited to normalize a title, summarize a description, extract a location, associate an explicitly named asset, and map ordinary language to an allowed priority value. Due dates, technician assignments, required shutdowns, and safety classifications need rules or review because errors affect schedules and people. The CMMS must validate every field after the model proposes it. Company ID, creator identity, completion state, and other trusted values should come from authenticated application context, never from model-supplied text.",
      },
      {
        heading: "Where confirmation belongs",
        body: "Use risk-based confirmation. Low-risk internal requests can become pending work orders after a quick preview. Ambiguous asset matches, urgent priorities, regulated equipment, shutdown implications, or instructions involving hazardous energy should require explicit human review. The confirmation screen should show exactly what will be written, not a vague statement that an action will occur. After creation, return the work-order number and keep normal change history. If creation fails, leave the source request visible and report the error.",
      },
      {
        heading: "Metrics that prove the automation works",
        body: "Measure request-to-work-order time, percentage of requests missing key fields, planner minutes spent on intake, incorrect asset associations, priority changes after review, and duplicate orders. Speed alone is not success if technicians receive worse instructions. Establish a manual baseline, pilot one request channel, and audit samples weekly. The best result is faster intake with fewer clarification calls and better asset history because more real work is captured in the CMMS.",
      },
      {
        heading: "A practical MaintenEase workflow",
        body: "MaintenEase can receive no-login maintenance requests with location, contact details, text, and photos. An authorized AI assistant or MCP client can review the request inbox and prepare a work order. The create-work-order tool accepts a validated title, description, priority, due date, and optional asset identifier, while authenticated context supplies company and creator identity. This creates a controlled path from plain-language reporting to a trackable maintenance record without giving the AI unrestricted access to application tables.",
      },
    ],
    faqs: [
      { q: "Can AI assign work-order priority?", a: "It can propose an allowed priority from the request, but urgent, safety-related, or operationally critical priorities should be reviewed by a qualified person or governed by explicit rules." },
      { q: "Should AI automatically assign technicians?", a: "Only after skills, availability, location, labor rules, and escalation policies are reliable. Most teams should begin with intake and drafting." },
      { q: "What happens when AI selects the wrong asset?", a: "The workflow should show the proposed asset before creation, retain the original request, and make correction easy. Ambiguous matches should be presented as choices." },
      { q: "How do I measure work-order automation ROI?", a: "Track intake time, missing fields, clarification calls, incorrect associations, duplicate orders, and the share of real maintenance activity captured in the CMMS." },
    ],
    related: ["agentic-maintenance-workflows", "maintenance-request-qr-codes", "ai-maintenance-assistant", "work-order"],
  },
  {
    slug: "equipment-risk-scoring",
    term: "Equipment Risk Scoring",
    short: "A repeatable way to rank assets by likelihood and consequence of failure so maintenance teams can direct limited labor toward the most important work.",
    metaTitle: "Equipment Risk Scoring: Rank Assets Before They Fail",
    metaDescription: "Learn how equipment risk scores combine failure likelihood, asset criticality, work history, and data quality to prioritize maintenance.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is equipment risk scoring?",
        body: "Equipment risk scoring assigns each asset a comparable value based on how likely it is to fail and how much that failure would matter. It turns scattered evidence - age, failure history, overdue preventive work, downtime, condition readings, and asset criticality - into a prioritized maintenance view. The score is a decision aid, not a diagnosis. Its purpose is to help a supervisor answer which assets deserve attention first when labor, parts, and shutdown windows are limited.",
      },
      {
        heading: "Likelihood and consequence",
        body: "A useful model separates probability from impact. Likelihood can reflect recent failures, shrinking time between failures, unresolved corrective work, condition trends, and missing preventive maintenance. Consequence reflects safety, production, service, environmental, cost, and redundancy effects. A frequently failing non-critical fan may deserve routine attention, while a rarely failing single-point-of-failure pump may still rank high because its consequence is severe. Combining the two prevents teams from prioritizing only the noisiest asset.",
      },
      {
        heading: "Inputs available without sensors",
        body: "Teams can build a meaningful starting score from existing CMMS history: failure count, work-order frequency, reactive-to-planned ratio, downtime hours, repair cost, asset age, PM compliance, and criticality. Sensors add current condition evidence but are not a prerequisite for basic prioritization. The first model should favor explainable inputs the team actually records. A sophisticated formula fed by inconsistent data produces false precision; a simple transparent score often changes behavior faster.",
      },
      {
        heading: "Make every score explainable",
        body: "Show the number and the drivers behind it. A supervisor should see that a motor is high risk because of three failures in 60 days, declining MTBF, an overdue inspection, and high production criticality. Explainability lets technicians challenge bad source data and tells planners what action might lower the score. It also exposes missing evidence: if a score depends heavily on asset age because no failures are logged, the right next action may be improving records rather than replacing equipment.",
      },
      {
        heading: "Thresholds and workflow",
        body: "Map score bands to review behavior, not automatic physical instructions. A high score can trigger supervisor review, a condition reading, an inspection, or planning for parts. Medium risk may remain on the normal PM cadence, while low risk receives monitoring. Avoid generating excessive work orders from every score change; that creates alarm fatigue and teaches the team to ignore the system. Recompute on a consistent schedule and require meaningful evidence before escalating an asset repeatedly.",
      },
      {
        heading: "How to validate the model",
        body: "Back-test scores against known failures, then run them prospectively. Compare high-risk assets with actual corrective work and downtime over the next 30 to 90 days. Track false positives, missed failures, data gaps, and whether planners act on the result. Review weights with technicians who know the equipment. A risk model is successful when it improves prioritization and prevents consequential surprises, not when it produces an impressive dashboard number.",
      },
    ],
    faqs: [
      { q: "Is an equipment risk score the probability of failure?", a: "Not necessarily. Many scores combine failure likelihood, consequence, and data-quality factors into a priority index rather than a calibrated probability." },
      { q: "Do risk scores require IoT sensors?", a: "No. Work history, downtime, cost, PM compliance, asset age, and criticality can support a useful first model. Sensors add condition evidence later." },
      { q: "How often should equipment risk be recalculated?", a: "Use a cadence that matches data change and operational need. Daily or several-times-daily updates may suit active facilities; slower environments may review weekly." },
      { q: "Should a high score automatically create a repair?", a: "Usually no. It should trigger review or inspection. A score prioritizes attention but does not by itself identify the correct physical repair." },
    ],
    related: ["predictive-maintenance", "predictive-maintenance-without-sensors", "mtbf", "ai-maintenance-assistant"],
  },
  {
    slug: "predictive-maintenance-without-sensors",
    term: "Predictive Maintenance Without Sensors",
    short: "A practical approach that uses work history, manual readings, inspections, and failure patterns to prioritize equipment risk before investing in permanent sensors.",
    metaTitle: "Predictive Maintenance Without Sensors: A Practical Start",
    metaDescription: "Start predictive maintenance using work orders, manual readings, inspections, MTBF, and equipment risk scoring before buying permanent sensors.",
    published,
    updated: published,
    sections: [
      {
        heading: "Can predictive maintenance work without sensors?",
        body: "Yes, if predictive is used honestly to mean forecasting or prioritizing future risk from available evidence. Permanent sensors provide frequent condition data, but many teams can begin with work-order history, failure intervals, manual meter readings, inspection findings, asset age, and criticality. This approach will not detect every subtle fault. It can still reveal assets whose failures are becoming more frequent, whose repair cost is rising, or whose overdue preventive work creates an increasing risk.",
      },
      {
        heading: "Use the data maintenance already creates",
        body: "Closed work orders contain failure dates, symptoms, repair duration, parts, costs, and notes. Preventive schedules show compliance and overdue work. Asset records supply age, location, manufacturer, and criticality. Together these fields support trends such as MTBF, repeated failure codes, reactive-work frequency, downtime, and cost acceleration. Before buying hardware, standardize asset names and make failure reporting consistent. Historical analysis depends on technicians associating work with the correct asset and closing records accurately.",
      },
      {
        heading: "Manual condition readings count",
        body: "A technician can collect temperature, vibration, pressure, amperage, oil condition, runtime, or visual inspection results during normal rounds. The difference between a clipboard and a predictive program is consistent, time-stamped history attached to the asset. Plot readings, establish a normal range, and investigate sustained drift rather than one isolated value. Portable instruments cost less than a permanent sensor rollout and help the team learn which measurements provide an early warning for each asset class.",
      },
      {
        heading: "Build a simple risk model",
        body: "Start with explainable factors: failures in the last 90 days, change in MTBF, overdue PMs, recent downtime, repair cost, asset age, and criticality. Weight consequence separately so a single-point-of-failure asset receives attention even with limited history. Show why the score changed and route high-risk assets to inspection or supervisor review. Do not present a rough priority index as an exact failure date. The model should guide where to gather better evidence next.",
      },
      {
        heading: "When sensors become worth it",
        body: "Add permanent sensing where failure consequence is high, faults develop between manual rounds, the condition signal is proven, and earlier warning creates enough time to act. Good candidates include critical rotating equipment, refrigeration, electrical loads, and assets whose downtime is expensive. Use the sensor-free phase to identify those candidates and choose the right signal. Instrumenting every asset before understanding its failure modes produces large data volume without a clear maintenance decision.",
      },
      {
        heading: "A 30-day starting plan",
        body: "Select five critical assets. Clean their work history, define failure events, and calculate basic MTBF and downtime. Choose one manual condition reading for each asset and record it on a consistent route. Rank the assets weekly using history, criticality, and readings, then compare the ranking with technician judgment. At day 30, document which signals changed before a defect, which data was missing, and where continuous monitoring might pay back. Expand only after the first group produces usable decisions.",
      },
    ],
    faqs: [
      { q: "Is this really predictive maintenance?", a: "It is a basic form of risk forecasting when it uses historical patterns and trends. It should not be marketed as precise remaining-useful-life prediction without evidence." },
      { q: "Which manual readings should I collect?", a: "Choose a signal linked to the asset's likely failure mode: vibration or temperature for bearings, amperage for motors, pressure for pumps, or visual and oil checks where appropriate." },
      { q: "How much history is required?", a: "Use whatever reliable history exists, but communicate uncertainty. More consistent failure and condition records improve the model over time." },
      { q: "Which assets should get sensors first?", a: "Prioritize high-consequence assets with a measurable failure signal, faults that develop between rounds, and enough avoided downtime to justify continuous monitoring." },
    ],
    related: ["equipment-risk-scoring", "predictive-maintenance", "condition-based-maintenance", "mtbf"],
  },
  {
    slug: "maintenance-request-qr-codes",
    term: "Maintenance Request QR Codes",
    short: "QR codes that open a location- or asset-specific request form so tenants, operators, staff, or guests can report problems without installing an app.",
    metaTitle: "Maintenance Request QR Codes: Setup & Best Practices",
    metaDescription: "Learn how QR maintenance requests work, where to place codes, which fields to collect, and how to turn submissions into trackable work orders.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is a maintenance request QR code?",
        body: "A maintenance request QR code opens a mobile-friendly form when someone scans it. The link can identify a building, room, or asset automatically, reducing the effort required to explain where a problem is. The requester describes the issue, adds contact details and photos, and submits without calling, emailing, or installing an app. The request enters a shared inbox where maintenance can triage it and convert approved work into a formal work order.",
      },
      {
        heading: "Where QR requests work best",
        body: "Place codes where the person noticing a problem is already standing: restrooms, hotel rooms, classrooms, shared equipment, tenant common areas, production stations, vehicles, and public facilities. Location codes suit rooms with multiple maintainable items. Asset-specific codes suit equipment where a serial record and service history matter. Avoid covering a site with indistinguishable stickers. Every printed code should have a plain-language label, short instructions, and a fallback URL or contact method.",
      },
      {
        heading: "Fields that improve triage",
        body: "Collect a concise issue description, urgency indication, photos, requester contact, and prefilled location or asset. Ask what the person observed rather than asking an untrained requester to diagnose the fault. Keep the first screen short; additional required fields reduce completion. For public forms, explain what qualifies as an emergency and provide the correct emergency contact path. Timestamp the submission and preserve its source so supervisors can distinguish public requests from internal work orders.",
      },
      {
        heading: "From QR submission to work order",
        body: "A request is evidence of a need, not automatically a maintenance instruction. Route submissions to an inbox, remove spam or duplicates, confirm asset and priority, and convert accepted requests into work orders. Carry the original description, photos, location, and contact details into the resulting record. AI can summarize or prepare structured fields, but supervisors should review ambiguous or urgent submissions. Link the work order back to the request so the team can update the requester and measure response time.",
      },
      {
        heading: "Security and abuse prevention",
        body: "No-login forms need rate limiting, bot protection, safe file handling, and strict tenant scoping. Do not reveal private asset history or internal work-order details to anyone holding the QR link. Use opaque portal identifiers rather than sequential company IDs. Validate uploads and text, limit personal data collection, and define retention. If a code is removed from service, administrators should be able to disable or rotate the destination without reconfiguring the entire CMMS.",
      },
      {
        heading: "How to measure adoption",
        body: "Track scans or form opens, completed submissions, duplicate rate, average triage time, request-to-work-order conversion, response time, and the share of requests with enough information on first review. Compare QR locations to phone and email channels. A successful program does not merely create more requests; it captures issues earlier, reduces follow-up questions, and gives maintenance a clean record of what was reported and resolved.",
      },
    ],
    faqs: [
      { q: "Do requesters need a CMMS account?", a: "Not when the QR code points to a properly designed public request portal. They can submit the issue while internal records remain protected." },
      { q: "Should every asset have a QR code?", a: "No. Prioritize shared, critical, frequently reported, or hard-to-identify assets. Location-level codes may be simpler for rooms with many fixtures." },
      { q: "Does a QR submission automatically become a work order?", a: "Usually it should enter a request inbox first so maintenance can remove duplicates, confirm priority, and associate the correct asset." },
      { q: "What should the printed label say?", a: "Name the location or asset, say what the code does, provide a brief instruction such as 'Scan to report a problem,' and include an emergency fallback." },
    ],
    related: ["property-maintenance", "ai-work-order-automation", "work-order", "facility-maintenance"],
  },
  {
    slug: "ai-native-cmms",
    term: "AI-Native CMMS",
    short: "Maintenance software designed around AI-assisted retrieval, reasoning, and controlled actions rather than adding a generic chatbot to a legacy workflow.",
    metaTitle: "AI-Native CMMS: Definition, Architecture & Buyer Guide",
    metaDescription: "Understand what AI-native CMMS should mean, how it differs from an AI add-on, and which architecture, safety, and workflow questions buyers should ask.",
    published,
    updated: published,
    sections: [
      {
        heading: "What is an AI-native CMMS?",
        body: "An AI-native CMMS is maintenance software designed so AI can retrieve operational context and participate in controlled workflows through structured interfaces. The label should imply more than a chat window. Asset identity, work history, requests, permissions, and actions need to be organized so the AI can use them reliably. In practice, the category is new and vendors use the phrase differently. Buyers should evaluate demonstrated capabilities and controls rather than assume the term guarantees autonomous or predictive maintenance.",
      },
      {
        heading: "AI-native vs AI added on",
        body: "An add-on assistant may search documentation or summarize a screen while the underlying workflow remains unchanged. An AI-native design exposes application actions as validated tools, keeps identity and tenant context attached to calls, and makes AI output traceable to records. The distinction is architectural, not cosmetic. A mature legacy CMMS can still build excellent tool interfaces, while a new product can call itself AI-native and deliver little more than text generation. Ask to see a complete request-to-record workflow.",
      },
      {
        heading: "The four layers buyers should inspect",
        body: "Inspect data quality, retrieval, action, and governance. Data quality covers consistent assets, locations, work history, and failure codes. Retrieval determines whether answers cite the correct current records. Action covers narrow tools with validated schemas. Governance includes authentication, role permissions, tenant isolation, audit history, confirmation, and revocation. Weakness in any layer limits the others. AI cannot compensate for an asset register full of duplicates or a write tool that bypasses company access rules.",
      },
      {
        heading: "Capabilities that matter today",
        body: "Useful current capabilities include natural-language work-order and asset lookup, shift summaries, request triage, document-to-asset extraction, risk explanations, and confirmation-aware work-order creation. These jobs are frequent, measurable, and grounded in CMMS records. Be skeptical of demonstrations that jump straight to autonomous planning without showing data preparation, permissions, exception handling, and what happens when the model cannot identify an asset. Reliability on ordinary work beats an ambitious but opaque demo.",
      },
      {
        heading: "Safety and accountability",
        body: "AI-native software must strengthen the audit trail, not replace it. Every action should retain user identity, timestamp, changed fields, and resulting record. Safety classification, lockout or shutdown decisions, regulatory interpretation, and physical instructions remain human responsibilities. Read tools should be separated from writes, and destructive operations should be unavailable or strongly confirmed. The system should clearly distinguish a model suggestion, a user-approved action, and a calculation based on maintenance data.",
      },
      {
        heading: "Buyer demonstration checklist",
        body: "Provide a realistic sample asset list with duplicate names and incomplete records. Ask the vendor to find a specific asset, summarize its failures, explain a risk score, triage an ambiguous request, and prepare a work order. Then test a user who should not see another site or company. Ask how tokens are revoked, which data reaches model providers, how errors are logged, and whether the workflow works without AI. Score the evidence, not the vocabulary on the homepage.",
      },
    ],
    faqs: [
      { q: "Is AI-native CMMS a formal standard?", a: "No. It is an emerging product category without one accepted technical definition, so buyers should verify specific workflows, architecture, and controls." },
      { q: "Does AI-native mean fully autonomous?", a: "No. The most useful systems combine AI assistance or tool use with clear permissions and human authority over operational and safety decisions." },
      { q: "Can an older CMMS become AI-native?", a: "A mature product can expose structured tools, improve data models, and add governed AI workflows. Architecture and results matter more than product age." },
      { q: "What is the biggest implementation risk?", a: "Poor maintenance data and weak access controls. AI makes those problems more visible and can amplify them if write actions are enabled too early." },
    ],
    related: ["agentic-cmms", "ai-maintenance-assistant", "maintenance-mcp-server", "equipment-risk-scoring"],
    sources: [
      { label: "Facilio AI-native CMMS announcement", url: "https://www.prnewswire.com/news-releases/facilio-ushers-in-the-ai-native-era-of-cmms-302815869.html" },
      { label: "Rockwell Automation and Augury agentic AI announcement", url: "https://www.rockwellautomation.com/en-us/company/news/press-releases/rockwell-automation-and-augury-partner-to-improve-industrial-performance-with-agentic-ai.html" },
    ],
  },
  {
    slug: "agentic-maintenance-workflows",
    term: "Agentic Maintenance Workflows",
    short: "Controlled maintenance processes in which an AI agent retrieves CMMS context and completes approved software steps while people retain operational authority.",
    metaTitle: "Agentic Maintenance Workflows: 7 Practical Examples",
    metaDescription: "Explore seven agentic maintenance workflows for requests, work orders, asset history, shift summaries, risk review, and controlled CMMS actions.",
    published,
    updated: published,
    sections: [
      {
        heading: "What makes a workflow agentic?",
        body: "A maintenance workflow becomes agentic when AI can choose and invoke approved software tools to move a task forward. It does more than draft prose: it retrieves current records, applies structured inputs, and returns an observable result. The agent does not need broad autonomy. A narrow sequence such as reading requests, finding the matching asset, and preparing a work order is agentic when the tools and decision boundaries are explicit. People remain responsible for maintenance judgment, approval where required, and physical execution.",
      },
      {
        heading: "1. Morning work-order briefing",
        body: "The agent lists open work orders, filters urgent and overdue items, groups them by location, and summarizes changes since the previous shift. It links each statement to a record identifier so the supervisor can open the source. This is a strong first workflow because it is read-only, frequent, and easy to compare with the dashboard. The output should distinguish an empty result from a failed query and should not invent reasons for delay that are absent from the records.",
      },
      {
        heading: "2. Request intake and triage",
        body: "The agent reviews new maintenance requests, extracts location and observed symptoms, checks for obvious duplicates, and proposes structured fields. Ambiguous asset matches remain choices for a supervisor. Approved requests become pending work orders with the original photos and description attached or linked. This reduces planner administration while preserving the difference between a request and authorized work. Urgent, safety-related, or public-facing submissions should follow explicit escalation rules rather than model judgment alone.",
      },
      {
        heading: "3. Asset history retrieval",
        body: "A technician asks for recent failures, open work, manuals, and costs for a named asset. The agent locates the correct record and returns a concise history. If multiple assets share a name, it asks for location or identifier. This workflow saves navigation time and supports diagnosis without allowing the agent to claim a root cause. The technician can use the evidence during inspection while the CMMS remains the authoritative history.",
      },
      {
        heading: "4. Work-order preparation",
        body: "The user describes the needed work in plain language. The agent finds an explicitly referenced asset, proposes a title, description, priority, and due date, then previews the structured record. After confirmation, it invokes the CMMS creation tool and reports the new identifier. The server supplies company and creator identity from authentication. Start with pending work orders and keep completion, shutdown, and destructive state changes outside the agent until governance is mature.",
      },
      {
        heading: "5. Risk review and inspection planning",
        body: "The agent retrieves high-risk assets and explains the recorded drivers: repeated failures, falling MTBF, overdue PMs, recent downtime, cost, criticality, or condition drift. It can prepare an inspection list but should not convert a score into a repair diagnosis. Supervisors decide whether to inspect, collect another reading, order parts, or change a PM schedule. The workflow is valuable when every claim traces back to data and uncertainty is visible.",
      },
      {
        heading: "6. Shift handoff and 7. management reporting",
        body: "For handoff, the agent summarizes work completed, urgent work still open, assets left out of service, and requests needing follow-up. For management reporting, it aggregates approved metrics such as work-order volume, PM compliance, MTTR, downtime, and maintenance cost. Both workflows should use defined time windows and metric formulas. The agent can explain changes and format the result, but source calculations should remain reproducible from CMMS records rather than depend on conversational memory.",
      },
      {
        heading: "How to choose the first workflow",
        body: "Score each candidate by frequency, manual effort, objective verifiability, data readiness, and operational risk. Choose a frequent read-only task with reliable source records. Establish a baseline, pilot with a few users, and log incorrect retrievals or ambiguous inputs. Add one write step only after the read workflow is dependable. The sequence should progress from retrieval to drafting to confirmed action, not from chatbot directly to autonomous maintenance.",
      },
    ],
    faqs: [
      { q: "Which agentic maintenance workflow should I start with?", a: "Start with a read-only morning briefing or asset-history lookup. Both are frequent, easy to verify, and low risk." },
      { q: "Can an agent close work orders automatically?", a: "It is technically possible, but completion affects history, compliance, labor, and cost. Most teams should keep closure under technician or supervisor control." },
      { q: "How is an agentic workflow different from automation rules?", a: "Rules follow predetermined conditions. An agent can interpret a request and choose among approved tools, while the server still validates every action." },
      { q: "What should be logged?", a: "Log authenticated user, tool name, time, arguments appropriate for audit, result, error, and any created or changed record identifier without exposing unnecessary sensitive content." },
    ],
    related: ["agentic-cmms", "ai-work-order-automation", "ai-maintenance-assistant", "equipment-risk-scoring"],
    sources: [
      { label: "Rockwell Automation and Augury agentic AI announcement", url: "https://www.rockwellautomation.com/en-us/company/news/press-releases/rockwell-automation-and-augury-partner-to-improve-industrial-performance-with-agentic-ai.html" },
      { label: "OpenAI model documentation showing MCP and tool support", url: "https://developers.openai.com/api/docs/models/gpt-5.6-sol" },
    ],
  },
];
