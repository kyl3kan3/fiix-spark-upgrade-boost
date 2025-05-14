
import type { Config } from "tailwindcss";

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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
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
				maintenease: {
					50: "#e6f7f3",
					100: "#ccefe7",
					200: "#99dfcf",
					300: "#66cfb7",
					400: "#33bf9f",
					500: "#00af87",
					600: "#008c6c",
					700: "#006951",
					800: "#004636",
					900: "#00231b"
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
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
		require("tailwindcss-animate"),
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
