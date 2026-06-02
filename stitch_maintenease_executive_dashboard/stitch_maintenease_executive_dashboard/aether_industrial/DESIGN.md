---
name: Aether Industrial
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#45e3ce'
  on-tertiary: '#003731'
  tertiary-container: '#07c7b2'
  on-tertiary-container: '#004d44'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#62fae3'
  tertiary-fixed-dim: '#3cddc7'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-xs: 4px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system establishes a high-performance environment for asset management, blending the precision of industrial engineering with the elegance of modern luxury. The aesthetic is "Modern Industrial," characterized by dark, layered surfaces, technical accuracy, and sophisticated high-contrast accents.

The target audience consists of high-stakes decision-makers who require clarity and professional rigor. The UI evokes a sense of controlled power, reliability, and technological advancement. By utilizing a mix of **Modern Corporate** structure and **Glassmorphism**, the interface feels deep and immersive rather than flat and utilitarian. 

Key visual principles:
- **Intentional Depth:** Use of light and shadow to define physical hierarchy.
- **Luminescent Accents:** Status indicators and primary actions should appear to emit light against the dark substrate.
- **Architectural Typography:** The juxtaposition of classic serif headings with technical sans-serif body text creates a "heritage tech" feel.

## Colors

The palette is anchored in a deep, celestial navy and slate foundation. The background is nearly black to maximize contrast and focus.

- **Primary (Blue/Teal):** Used for primary actions and active states. It should be applied with a subtle outer glow or high-saturation treatment to ensure it "pops."
- **Secondary (Amber):** Reserved for alerts, critical warnings, or premium highlights. This provides a warm, high-visibility counterpoint to the cool base.
- **Neutral (Slate):** A range of cool grays used to define surfaces, borders, and secondary text.
- **Functional Accents:** Success states utilize the tertiary teal, while error states leverage a high-vibrancy coral to cut through the dark theme.

## Typography

The typographic strategy balances editorial sophistication with technical precision. 

- **Headings:** **Playfair Display** is used in high-contrast white to provide a premium, authoritative voice. Headlines should be set with tighter letter-spacing to maintain a modern look.
- **Body:** **Hanken Grotesk** offers a sharp, contemporary feel that ensures maximum legibility for data-heavy views.
- **Technical Data:** **JetBrains Mono** is introduced for labels, status chips, and numerical data to reinforce the industrial, high-tech nature of the system.

Always ensure a minimum contrast ratio of 7:1 for body text against the dark backgrounds.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with a hard 8px baseline.

- **Desktop (1440px+):** 12-column layout with 24px gutters and 48px outer margins. Content is centered within a maximum-width container.
- **Tablet (768px - 1439px):** 8-column layout with 20px gutters and 32px margins.
- **Mobile (Up to 767px):** 4-column layout with 16px gutters and 16px margins.

Spacing should be applied using the "Stack" philosophy—consistent vertical rhythm (stack-md) between major sections and tighter grouping (stack-sm) for related components. Whitespace is used aggressively to prevent the dark theme from feeling cramped or heavy.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism**, avoiding traditional heavy drop shadows.

- **Level 0 (Canvas):** The deepest layer (#020617), used for the main background.
- **Level 1 (Surfaces):** Cards and main containers use #1e293b with a 1px border (#334155).
- **Level 2 (Glass Overlay):** Floating elements like dropdowns and modals use a semi-transparent background (70% opacity) with a `backdrop-filter: blur(12px)`.
- **Inner Glow:** Interactive elements (like active inputs) should use a subtle inner shadow or "bloom" effect rather than an outer shadow to simulate an emissive screen.
- **Borders:** Use thin, high-precision borders to define structure. Avoid soft gradients on borders; keep them sharp and architectural.

## Shapes

To maintain the "Modern Industrial" aesthetic, the design system utilizes **Soft** geometry. Sharp corners feel too aggressive, while pill-shapes feel too casual.

- **Small Components (Buttons, Inputs):** 0.25rem (4px) corner radius. This conveys precision and technical hardware.
- **Medium Components (Cards, Modals):** 0.5rem (8px) corner radius. 
- **Large Components (Sections, Hero Containers):** 0.75rem (12px) corner radius.

Icons should follow a consistent linear style with a 2px stroke weight to match the architectural feel of the borders.

## Components

- **Buttons:** 
  - *Primary:* Solid primary blue with white text. Apply a subtle outer glow on hover.
  - *Secondary:* Ghost style with a 1px slate-400 border and subtle slate-800 background fill.
- **Input Fields:** Darker than the card surface (#0f172a) with a 1px border. On focus, the border changes to the primary blue with a 2px "neon" outer glow. Use JetBrains Mono for placeholder text.
- **Cards:** Use a subtle top-down linear gradient (from #1e293b to #0f172a). Borders should be slightly lighter on the top and left to simulate a top-down light source.
- **Chips/Status:** Use `label-caps` typography. Backgrounds should be low-opacity versions of the status color (e.g., 10% Teal for "Active") with a high-vibrancy text color to create a "glowing" effect.
- **Lists:** Use subtle 1px horizontal dividers (#334155). Ensure high contrast between primary list text and secondary metadata.
- **Data Tables:** Use a strict grid with no vertical lines. Highlight rows on hover with a slight increase in surface brightness (+5%).