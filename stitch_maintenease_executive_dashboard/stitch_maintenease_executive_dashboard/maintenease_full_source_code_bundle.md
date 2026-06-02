# MaintenEase Clean Tech - Full Source Code Manifest

This document contains the complete HTML and Tailwind CSS source code for the core screens of the MaintenEase platform. Use these as the structural and stylistic templates for your project.

---

## 1. Landing Page (Home)
**Target File**: `index.html` / `Home.jsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_42}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_42}}
```

---

## 2. Dashboard (Workspace Home)
**Target File**: `dashboard.html` / `Dashboard.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_37}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_37}}
```

---

## 3. Work Order Management
**Target File**: `work-orders.html` / `WorkOrders.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_53}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_53}}
```

---

## 4. Asset Registry
**Target File**: `assets.html` / `AssetRegistry.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_33}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_33}}
```

---

## 5. Analytics & Reports
**Target File**: `reports.html` / `Analytics.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_16}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_16}}
```

---

## 6. Organization Settings
**Target File**: `settings.html` / `Settings.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_7}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_7}}
```

---

## 7. Welcome Onboarding
**Target File**: `onboarding.html` / `Welcome.tsx`
**Visual Reference**: {{DATA:SCREEN:SCREEN_56}}
**Source Code**:
```html
{{DATA:SCREEN:SCREEN_56}}
```

---

## 8. Shared Components Logic
### Navigation & Shell
Refer to the `SideNavBar` and `TopNavBar` classes within any of the workspace screens above. 
- **Sidebar Width**: `240px`
- **Shell Layout**: `flex` with a `ml-sidebar` margin for content alignment.

### Tailwind Theme Reminder
Ensure your `tailwind.config.js` is updated with:
```javascript
theme: {
  extend: {
    colors: {
      'primary': '#00288e',
      'secondary': '#0d9488',
      'surface': '#f8f9ff',
    },
    fontFamily: {
      'headline': ['Playfair Display', 'serif'],
      'body': ['Inter', 'sans-serif'],
    }
  }
}
```
