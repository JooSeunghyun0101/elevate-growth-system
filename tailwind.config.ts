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
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				// OK 컬러 팔레트
				'ok-orange': 'hsl(var(--ok-orange))',
				'ok-dark-brown': 'hsl(var(--ok-dark-brown))',
				'ok-yellow': 'hsl(var(--ok-yellow))',
				'ok-bright-gray': 'hsl(var(--ok-bright-gray))',
				'ok-gold': 'hsl(var(--ok-gold))',
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
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
				'confetti-fall': {
					'0%': {
						transform: 'translateY(-10px) rotate(0deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(100px) rotate(360deg)',
						opacity: '0'
					}
				},
				'confetti-spin': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(180deg) scale(1.2)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				'rain-drop': {
					'0%': {
						transform: 'translateY(-20px)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(80px)',
						opacity: '0'
					}
				},
				'sad-face': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)' },
					'25%': { transform: 'scale(1.1) rotate(-5deg)' },
					'75%': { transform: 'scale(1.1) rotate(5deg)' }
				},
				'celebration': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)' },
					'25%': { transform: 'scale(1.2) rotate(-10deg)' },
					'50%': { transform: 'scale(1.3) rotate(0deg)' },
					'75%': { transform: 'scale(1.2) rotate(10deg)' }
				},
				'sparkle': {
					'0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
					'50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0) rotate(0deg)' },
					'50%': { transform: 'scale(1.2) rotate(180deg)' },
					'100%': { transform: 'scale(1) rotate(360deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						transform: 'scale(1)', 
						filter: 'brightness(1) drop-shadow(0 0 0px currentColor)' 
					},
					'50%': { 
						transform: 'scale(1.1)', 
						filter: 'brightness(1.2) drop-shadow(0 0 10px currentColor)' 
					}
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'fade-in-up': {
					'0%': { 
						transform: 'translateY(20px)', 
						opacity: '0' 
					},
					'100%': { 
						transform: 'translateY(0)', 
						opacity: '1' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'confetti-fall': 'confetti-fall 1.5s ease-out infinite',
				'confetti-spin': 'confetti-spin 2s linear infinite',
				'rain-drop': 'rain-drop 2s ease-in-out infinite',
				'sad-face': 'sad-face 1s ease-in-out',
				'celebration': 'celebration 0.8s ease-in-out',
				'sparkle': 'sparkle 1.5s ease-in-out infinite',
				'bounce-in': 'bounce-in 0.8s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shake': 'shake 0.5s ease-in-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
