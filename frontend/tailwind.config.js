/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Tokens
        primary: '#00288e',
        'on-primary': '#ffffff',
        'primary-container': '#1e40af',
        'on-primary-container': '#a8b8ff',
        'primary-fixed': '#dde1ff',
        'on-primary-fixed': '#001453',
        'on-primary-fixed-variant': '#173bab',
        'primary-fixed-dim': '#b8c4ff',
        'inverse-primary': '#b8c4ff',
        
        secondary: '#006a61',
        'on-secondary': '#ffffff',
        'secondary-container': '#86f2e4',
        'on-secondary-container': '#006f66',
        'secondary-fixed': '#89f5e7',
        'secondary-fixed-dim': '#6bd8cb',
        'on-secondary-fixed': '#00201d',
        'on-secondary-fixed-variant': '#005049',
        
        tertiary: '#003d27',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#00563a',
        'on-tertiary-container': '#3fd298',
        'tertiary-fixed': '#6ffbbe',
        'tertiary-fixed-dim': '#4edea3',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005236',
        
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        
        surface: '#f8f9fa',
        'on-surface': '#191c1d',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface-variant': '#444653',
        'surface-variant': '#e1e3e4',
        'outline': '#757684',
        'outline-variant': '#c4c5d5',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        'surface-tint': '#3755c3',
        
        background: '#f8f9fa',
        'on-background': '#191c1d',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'lg': '0.25rem',
        'xl': '0.5rem',
        'full': '0.75rem',
      },
    },
  },
  plugins: [],
}
