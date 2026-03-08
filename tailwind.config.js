/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
		 keyframes: {
        echo: {
          '0%': { opacity: '0.6', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.2)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'sticker-slap': {
          '0%': { opacity: '0', transform: 'scale(2) rotate(var(--rot))' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--rot))' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        'reveal-pop': {
          '0%': { transform: 'scale(0.7) translateY(4px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'sentence-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blank-click': {
          '0%': { opacity: '0', transform: 'translateY(50px) rotate(20deg) scale(0.8)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) rotate(-2deg) scale(1.05)' },
          '80%': { opacity: '1', transform: 'translateY(2px) rotate(0.5deg) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0deg) scale(1)' },
        },
        'score-flash': {
          '0%': { color: 'hsl(var(--game-blue))' },
          '30%': { color: 'hsl(var(--game-red))', transform: 'scale(1.1)' },
          '100%': { color: 'hsl(var(--game-blue))', transform: 'scale(1)' },
        },
        'pip-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,135,58,0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(200,135,58,0)' },
        },
        'badge-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'stamp-bounce': {
          '0%': { transform: 'scale(1.8) translateY(-20px)', opacity: '0' },
          '60%': { transform: 'scale(0.95) translateY(2px)', opacity: '1' },
          '80%': { transform: 'scale(1.05) translateY(-1px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        'ink-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'score-float': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-24px)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-6px)' },
          '30%': { transform: 'translateX(5px)' },
          '45%': { transform: 'translateX(-4px)' },
          '60%': { transform: 'translateX(3px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
        'milestone-toast': {
          '0%': { transform: 'translateY(-40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        echo: 'echo 0.6s ease-out',
        'confetti-fall': 'confetti-fall 2.5s ease-in forwards',
        'sticker-slap': 'sticker-slap 0.3s ease-out forwards',
        'float-up': 'float-up 0.8s ease forwards',
        'reveal-pop': 'reveal-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'sentence-in': 'sentence-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'blank-click': 'blank-click 0.45s cubic-bezier(0.22,1.2,0.36,1) both',
        'score-flash': 'score-flash 0.4s ease',
        'pip-pulse': 'pip-pulse 1.2s ease-in-out infinite',
        'badge-pulse': 'badge-pulse 1.2s ease-out forwards',
        'stamp-bounce': 'stamp-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'ink-ring': 'ink-ring 0.8s ease-out both',
        'score-float': 'score-float 1.2s ease-out both',
        shake: 'shake 0.4s ease-in-out',
        'milestone-toast': 'milestone-toast 0.4s ease-out',
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			// Idle Hours brand tokens
  			linen: 'hsl(var(--linen))',
  			'brand-dark': 'hsl(var(--brand-dark))',
  			'brand-green': 'hsl(var(--brand-green))',
  			'accent-green': 'hsl(var(--accent-green))',
  			'burnt-orange': 'hsl(var(--burnt-orange))',
  			teal: 'hsl(var(--teal))',
		// Game sub-brand tokens
		'game-blue': 'hsl(var(--game-blue))',
		'game-blue-dark': 'hsl(var(--game-blue-dark))',
		'game-blue-light': 'hsl(var(--game-blue-light))',
		'game-ink': 'hsl(var(--game-ink))',
		'game-ink-mid': 'hsl(var(--game-ink-mid))',
		'game-ink-light': 'hsl(var(--game-ink-light))',
		'game-amber': 'hsl(var(--game-amber))',
		'game-green': 'hsl(var(--game-green))',
		'game-red': 'hsl(var(--game-red))',
		'electric-blue': '#4199f1',
		'diff-easy':     '#00e116',
		'diff-avg':      '#f3a740',
		'diff-hard':     '#e8134b',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
