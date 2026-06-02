# MaintenEase "Clean Tech" Site Blueprint

This document serves as the master manifest for rebuilding the MaintenEase platform. It bridges the gap between high-fidelity designs and a functional, data-driven application.

## 1. Global Sitemap & Flow Architecture

### Public / Marketing (External)
- **Home (Index)**: Hero, features overview, social proof, and primary CTA.
- **Solutions (Industry Specific)**: e.g., Manufacturing, Healthcare, Education.
- **Pricing**: Tiered subscription plans (Starter, Professional, Enterprise).
- **Resources**: Documentation, API guides, and maintenance blog.
- **Sign In / Sign Up**: Authentication entry points.

### Workspace (Authenticated)
- **Dashboard**: High-level KPI overview and "What's Next" cards.
- **Operations**:
    - **Work Order Management**: Grid/List view of all tasks.
    - **Work Order Detail**: Deep dive into specific task data.
    - **Inspections**: Active checklists and field data entry.
    - **PM Scheduler**: Calendar and list views for preventive tasks.
- **Assets & Infrastructure**:
    - **Asset Registry**: Equipment database with interactive cards.
    - **Asset Detail**: Technical specs, history, and linked documents for a single asset.
    - **Locations & Sites**: Hierarchy of facilities, buildings, and rooms.
- **People & Partners**:
    - **Team Directory**: Management of internal technicians and admins.
    - **Vendor Registry**: External contractor management.
    - **Vendor Detail**: Compliance, contact info, and service history.
- **Strategy**:
    - **Analytics & Reports**: Visual data trends and cost analysis.

### Admin & Configuration
- **Organization Settings**: Company profile, localization, and branding.
- **Billing & Subscription**: Invoices, seat management, and plan upgrades.
- **Automations**: "If-Then" workflow builder.
- **Integrations**: API keys, webhooks, and third-party app connections.
- **SSO & Security**: Enterprise identity provider configuration (SAML 2.0).

---

## 2. Shared Component Specifications

### Side Navigation (`SideNavBar`)
- **Width**: `240px` (Expanded), `72px` (Collapsed).
- **Active State**: `border-l-4 border-primary bg-primary/5 text-primary`.
- **Logic**: Dynamic tab highlighting based on current route.
- **Components**: Brand mark, Navigation items (with icons), CTA button (e.g., "New Work Order"), User footer.

### Top Navigation (`TopNavBar`)
- **Height**: `64px`.
- **Features**: Global Search, Notification bell (with badge), Help icon, User Profile dropdown.
- **Styling**: `bg-surface/80 backdrop-blur-md sticky top-0`.

### Data Cards (`DataCard`)
- **Padding**: `p-6`.
- **Interaction**: `hover:shadow-md transition-all duration-200 cursor-pointer`.
- **Visuals**: `border border-outline-variant/30 rounded-lg`.

---

## 3. Data Schema & Relationships

### Work Order Object
```json
{
  "id": "WO-8892",
  "title": "Rooftop Unit 04 Inspection",
  "status": ["Pending", "In Progress", "Completed", "On Hold"],
  "priority": ["Low", "Medium", "High", "Critical"],
  "asset_id": "ASSET-123",
  "assigned_to": "USER-456",
  "due_date": "2023-10-24T14:00:00Z",
  "cost": 1240.00
}
```

### Asset Object
```json
{
  "id": "AHU-04",
  "name": "Air Handling Unit 04",
  "category": "HVAC",
  "location": "Main Plant - Sector B",
  "health_score": 98.4,
  "last_service": "2023-09-12"
}
```

---

## 4. CSS Implementation (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': '#00288e',      // Clean Tech Deep Navy
        'secondary': '#0d9488',    // Clean Tech Teal
        'surface': '#f8f9ff',      // Light Background
        'outline-variant': 'rgba(0, 40, 142, 0.1)',
      },
      fontFamily: {
        'headline': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
      }
    }
  }
}
```