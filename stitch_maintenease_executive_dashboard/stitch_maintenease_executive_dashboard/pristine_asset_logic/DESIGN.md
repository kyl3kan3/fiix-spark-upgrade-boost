---
name: MaintenEase Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444652'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c5c5d4'
  surface-tint: '#3d57ba'
  primary: '#00175c'
  on-primary: '#ffffff'
  primary-container: '#00288e'
  on-primary-container: '#7e97fe'
  inverse-primary: '#b8c4ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#1e2020'
  on-tertiary: '#ffffff'
  tertiary-container: '#333535'
  on-tertiary-container: '#9c9d9d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#213da0'
  secondary-fixed: '#e1e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  success: '#10B981'
  warning: '#F59E0B'
  surface-blue: '#f8f9ff'
  container-blue: '#e5eeff'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base_unit: 8px
  sidebar_collapsed: 64px
  sidebar_expanded: 240px
  container_padding: 32px
  card_padding: 24px
  gutter: 24px
---

## Brand & Style
The brand personality is **Precise, Reliable, and Modern**. It targets facility managers and industrial operators who require a high-utility environment that feels both high-tech and trustworthy.

The design style is **Corporate Modern with Glassmorphic accents**. It utilizes a systematic "Utility-First" layout characterized by clean surfaces, subtle backdrop blurs (on the TopAppBar), and a sophisticated color palette. The emotional response should be one of "controlled efficiency"—where complex data is organized through clear hierarchy and gentle micro-interactions.

## Colors
The palette is rooted in a deep "Industrial Navy" primary, signifying stability. 

- **Primary:** Used for core actions, active states, and branding.
- **Surface Palette:** A range of tinted blues (`#f8f9ff` to `#d3e4fe`) replaces neutral greys to maintain a cohesive, clean atmosphere.
- **Semantic Accents:** High-vibrancy Emerald for completion, Amber for pending status, and a sharp Red for urgent work orders. These are used sparingly against low-saturation backgrounds to ensure immediate scanability.

## Typography
The system uses a **Serif-Sans hybrid** approach. 

- **Headlines:** "Playfair Display" is used for major titles and section headers to provide an editorial, premium feel that distinguishes the platform from generic SaaS tools.
- **UI & Data:** "Inter" handles all functional text, labels, and data points. Its high x-height ensures legibility in dense work order grids.
- **Hierarchy:** Weight is used aggressively to denote importance, specifically in `label-md` for navigation and button text.

## Layout & Spacing
The layout follows a **Fluid Grid model** with specific structural anchors:

- **Sidebar:** A collapsible navigation rail that expands on hover, prioritizing canvas space for data.
- **TopAppBar:** A sticky, translucent header that acts as a global control layer.
- **Bento Grid Stats:** A 3-column arrangement for high-level metrics that collapses to a single column on mobile.
- **Responsive Behavior:** 
  - **Desktop:** 24px gutters with 32px external margins.
  - **Tablet:** 2-column card layout.
  - **Mobile:** Single column layout with reduced card padding (16px) and headlines scaling to `-mobile` variants.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Shadows**:

- **Level 0 (Background):** Solid `#f8f9ff`.
- **Level 1 (Cards):** Surface color `#ffffff` with a soft dual-shadow (`0 10px 30px rgba(0, 0, 0, 0.04)`).
- **Level 2 (Hover/Active):** Surfaces lift visually using a deeper shadow (`0 20px 40px rgba(0, 0, 0, 0.08)`) and a subtle `translate-y-1` transform.
- **Glassmorphism:** The TopAppBar uses `backdrop-blur-md` and `bg-surface/80` to provide a sense of place without obstructing content during scroll.

## Shapes
The shape language is **Soft-Geometric**. 

- **Standard Elements:** 8px (0.5rem) radius for buttons and input fields.
- **Cards & Containers:** 12px (0.75rem) to 16px (1rem) radius to soften the high-density data presentation.
- **Indicators:** Fully rounded (pill) shapes for priority badges and status chips to distinguish them from interactive buttons.

## Components
- **Buttons:** 
  - *Primary:* Heavy Navy background, white text, 16px padding, uppercase `label-md`. 
  - *Ghost:* Primary color text, no background, underline on hover.
- **Cards:** White background, 1px transparent border that turns `primary/10` on hover. Cards should be divided into a "Primary Data" section and a "Quick Action" footer using a subtle border.
- **Chips/Badges:** Small, bold, all-caps text with high-contrast background containers (e.g., `error-container` for High Priority).
- **Input Fields:** Filled style using `surface-container-low` with no border, becoming `ring-2 ring-primary` on focus.
- **Progress Rings:** Use SVG circles with `stroke-dasharray` to visualize completion percentage within cards, providing a quick visual check for work order status.
- **Sidebar Links:** Left-border indicator (4px) for active states with a subtle 5% opacity tint of the primary color.