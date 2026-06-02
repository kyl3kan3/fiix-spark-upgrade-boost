# MaintenEase Handoff Guide

This document provides the technical specifications and implementation details for the MaintenEase "Clean Tech" design system.

## Design Tokens

### Typography
- **Headings**: `Playfair Display` (Serif)
- **Body & Data**: Professional Sans-Serif (e.g., Inter or Geist)
- **Scale**:
  - Display: `text-5xl` / `font-bold`
  - Headline: `text-2xl` / `font-semibold`
  - Body: `text-base` / `font-normal`
  - Labels: `text-sm` / `font-medium`

### Colors
- **Primary**: `#00288e` (Deep Navy)
- **Secondary**: `#0d9488` (Teal)
- **Surface**: `#f8f9ff` (Light Background)
- **Border**: `rgba(0, 40, 142, 0.1)` (Faint Navy)
- **Success**: `#22c55e`
- **Warning**: `#f59e0b`
- **Critical**: `#ef4444`

### Elevation & Roundness
- **Radius**: `8px` (`rounded-lg`)
- **Shadow**: `shadow-sm` (Subtle) or `shadow-md` (Floating elements)

## Shared Components

### Side Navigation
- **Width**: `240px`
- **Styling**: `bg-white border-r border-slate-100`
- **Active State**: `border-l-4 border-primary bg-primary/5 text-primary`

### Data Cards
- **Structure**: `bg-white rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md`
- **Content Padding**: `p-6`

## Implementation Steps
1. **Global Styles**: Add Google Fonts for 'Playfair Display'.
2. **Tailwind Config**: Extend your theme with the primary/secondary colors listed above.
3. **Component Libraries**: Use the provided HTML structures to build your React/Vue/Svelte components.
