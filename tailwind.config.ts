
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['"Inter"', 'system-ui', 'sans-serif'],
				display: ['"Playfair Display"', 'Georgia', 'serif'],
				headline: ['"Playfair Display"', 'Georgia', 'serif'],
				serif: ['"Playfair Display"', 'Georgia', 'serif'],
				mono: ['"Inter"', 'system-ui', 'sans-serif'],
				// Clean Tech bundle named families
				'body-lg': ['"Inter"', 'system-ui', 'sans-serif'],
				'body-md': ['"Inter"', 'system-ui', 'sans-serif'],
				'label-md': ['"Inter"', 'system-ui', 'sans-serif'],
				'label-sm': ['"Inter"', 'system-ui', 'sans-serif'],
				'headline-md': ['"Playfair Display"', 'Georgia', 'serif'],
				'headline-lg': ['"Playfair Display"', 'Georgia', 'serif'],
				'headline-lg-mobile': ['"Playfair Display"', 'Georgia', 'serif'],
				'display-lg': ['"Playfair Display"', 'Georgia', 'serif'],
			},
			fontSize: {
				// Clean Tech named text scale (matches bundle's embedded tailwind config)
				'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
				'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
				'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
				'label-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
				'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
				'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
				'headline-lg-mobile': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
				'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
			},
			spacing: {
				// Clean Tech named spacing tokens (matches bundle)
				base_unit: '8px',
				gutter: '24px',
				card_padding: '24px',
				container_padding: '32px',
				sidebar_collapsed: '64px',
				sidebar_expanded: '240px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					variant: 'hsl(var(--primary-variant))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				// Clean Tech / Material-3 surface family (matches bundle's embedded tailwind config)
				'surface': 'hsl(var(--background))',
				'surface-bright': 'hsl(var(--background))',
				'surface-dim': 'hsl(220 30% 92%)',
				'surface-blue': 'hsl(var(--background))',
				'surface-tint': 'hsl(var(--primary))',
				'surface-variant': 'hsl(220 14% 91%)',
				'surface-container': 'hsl(var(--card))',
				'surface-container-low': 'hsl(228 60% 96%)',
				'surface-container-lowest': '#ffffff',
				'surface-container-high': 'hsl(228 50% 94%)',
				'surface-container-highest': 'hsl(228 40% 90%)',
				// Material-3 color tokens (referenced in bundle's class strings)
				'on-background': 'hsl(var(--foreground))',
				'on-surface': 'hsl(var(--foreground))',
				'on-surface-variant': 'hsl(var(--muted-foreground))',
				'on-primary': 'hsl(var(--primary-foreground))',
				'on-primary-container': 'hsl(var(--primary))',
				'on-secondary': 'hsl(var(--secondary-foreground))',
				'on-secondary-container': 'hsl(var(--secondary))',
				'on-tertiary': '#ffffff',
				'on-tertiary-container': 'hsl(220 30% 18%)',
				'on-error': '#ffffff',
				'on-error-container': 'hsl(0 84% 30%)',
				'primary-container': 'hsl(226 100% 95%)',
				'primary-fixed': 'hsl(226 100% 92%)',
				'primary-fixed-dim': 'hsl(226 100% 80%)',
				'on-primary-fixed': 'hsl(226 100% 18%)',
				'on-primary-fixed-variant': 'hsl(226 100% 28%)',
				'secondary-container': 'hsl(174 60% 92%)',
				'secondary-fixed': 'hsl(174 60% 88%)',
				'secondary-fixed-dim': 'hsl(174 50% 75%)',
				'on-secondary-fixed': 'hsl(174 84% 14%)',
				'on-secondary-fixed-variant': 'hsl(174 84% 22%)',
				'tertiary': 'hsl(220 8% 30%)',
				'tertiary-container': 'hsl(220 8% 30%)',
				'tertiary-fixed': 'hsl(220 8% 88%)',
				'tertiary-fixed-dim': 'hsl(220 8% 78%)',
				'on-tertiary-fixed': 'hsl(220 8% 10%)',
				'on-tertiary-fixed-variant': 'hsl(220 8% 26%)',
				'container-blue': 'hsl(228 60% 94%)',
				'error': 'hsl(var(--destructive))',
				'error-container': 'hsl(0 84% 95%)',
				'inverse-surface': 'hsl(220 30% 18%)',
				'inverse-on-surface': 'hsl(228 100% 96%)',
				'inverse-primary': 'hsl(226 100% 75%)',
				'outline': 'hsl(220 14% 70%)',
				'outline-variant': 'rgba(0, 40, 142, 0.10)',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(0 0% 100%)'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(0 0% 100%)'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(0 0% 100%)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'calc(var(--radius) + 2px)',
				md: 'var(--radius)',
				sm: 'calc(var(--radius) - 1px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				"entry-fade-slide": {
					"0%": { opacity: "0", transform: "translateY(24px)" },
					"100%": { opacity: "1", transform: "translateY(0)" }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.7s ease-out',
				"entry-fade-slide": "entry-fade-slide 0.45s cubic-bezier(0.4,0,0.2,1)",
			},
			// Add custom gradients for glassmorphism and primary accent
			backgroundImage: {
				'card-gradient': 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
				'glass-morphism': 'linear-gradient(112.1deg, rgba(255,255,255,0.85) 0%, rgba(233,245,255,0.60) 100%)',
				'dark-card-gradient': 'linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%)',
				'dark-glass-morphism': 'linear-gradient(120deg, rgba(36,40,62,0.65) 0%, rgba(15,12,41,0.90) 100%)'
			}
		}
	},
	plugins: [
		tailwindcssAnimate,
		function ({ addUtilities }) {
			addUtilities({
				".card-gradient": {
					"background": "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
				},
				".card-gradient-dark": {
					"background": "linear-gradient(135deg, #222e34 0%, #09101c 100%)"
				},
				".glass-morphism": {
					"background": "linear-gradient(112.1deg, rgba(255,255,255,0.90) 0%, rgba(233,245,255,0.72) 100%)",
					"backdropFilter": "blur(20px)",
					"borderRadius": "1.1rem",
					"border": "1.5px solid rgba(255,255,255,0.22)"
				},
				".glass-morphism-dark": {
					"background": "linear-gradient(112.1deg, rgba(36,40,62,0.80) 0%, rgba(15,12,41,0.86) 100%)",
					"backdropFilter": "blur(20px)",
					"borderRadius": "1.1rem",
					"border": "1.5px solid rgba(30,47,60,0.48)"
				}
			});
		}
	],
} satisfies Config;
