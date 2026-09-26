export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dg: {
          bg: '#F8F6F1',
          surface: '#FFFFFF',
          primary: '#F97316',
          navy: '#182235',
          text: '#182235',
          muted: '#5F6B7A',
          border: '#E5E1D8',
          danger: '#DC2626',
          warning: '#F59E0B',
          success: '#16A34A',
        },
        // Legacy colors to be replaced incrementally
        charcoal: '#1E293B',
        darkslate: '#0F172A',
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#10B981'
      }
    },
  },
  plugins: [],
}
