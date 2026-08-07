export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#EDE7D9',
        'paper-light': '#F4F0E5',
        ink: '#202C39',
        'ink-soft': '#4A5568',
        amber: '#B5670E',
        'amber-light': '#DCA858',
        teal: '#1F5F5B',
        line: '#C7BFA9',
        'line-soft': '#DAD3BF',
        navy: '#182430',
        'navy-2': '#101923',
      },
      fontFamily: {
        serif: ['Serif Display', 'serif'],
        sans: ['Grotesk', 'sans-serif'],
        mono: ['Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
