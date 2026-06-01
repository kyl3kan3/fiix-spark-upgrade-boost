# MaintenEase Clean Tech - Final Implementation Tokens

To ensure the "Clean Tech" aesthetic is applied correctly across your entire Lovable project, use these specific configuration values.

## 1. Tailwind Configuration (`tailwind.config.js`)
Add this to your configuration to register the core brand colors and typography.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': '#00288e',          // Deep Navy (Clean Tech)
        'primary-variant': '#001a5e',
        'secondary': '#0d9488',        // Teal (Clean Tech)
        'surface': '#f8f9ff',          // Main Background
        'surface-container': '#ffffff',
        'outline-variant': 'rgba(0, 40, 142, 0.1)',
        'on-surface-variant': '#64748b',
      },
      fontFamily: {
        'headline': ['"Playfair Display"', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    }
  }
}
```

## 2. Global CSS / Font Import
Ensure you import the core fonts at the top of your global CSS file.

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
```

## 3. Core Design Tokens
- **Primary Action**: `bg-primary text-white hover:bg-primary-variant`
- **Secondary Action**: `bg-white text-primary border border-primary/20 hover:bg-primary/5`
- **Sidebar Background**: `bg-white border-r border-slate-100`
- **Active Navigation**: `border-l-4 border-primary bg-primary/5 text-primary font-semibold`
- **Card Styling**: `bg-white rounded-lg border border-slate-100 shadow-sm`
