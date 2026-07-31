/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#0891b2',
      },
    },
  },
  plugins: [],
  safelist: [
    // Button classes
    'btn', 'btn-sm', 'btn-lg',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-secondary', 'btn-info',
    'btn-outline', 'btn-ghost', 'btn-indigo',
    // Badge classes
    'badge', 'badge-success', 'badge-warning', 'badge-danger', 'badge-info', 'badge-secondary', 'badge-purple', 'badge-orange', 'badge-blue',
    // Card classes
    'card', 'stat-card', 'stat-card-icon', 'stat-card-value', 'stat-card-label', 'stat-card-change', 'stat-card-change.positive', 'stat-card-change.negative',
    // Table classes
    'table-container',
    // Modal classes
    'modal-overlay', 'modal', 'modal-header', 'modal-body', 'modal-footer',
    // Utility classes
    'shadow-subtle', 'shadow-elevated', 'shadow-lg', 'shadow-xl',
    'glass', 'glass-dark',
    'text-gradient', 'text-gradient-success',
    // Filter bar
    'filter-bar',
    // Animation classes
    'animate-scale-in', 'animate-fade-in', 'animate-slide-in-up', 'animate-slide-in', 'animate-pulse', 'animate-bounce', 'animate-slide',
    // Toast
    'toast', 'toast-success', 'toast-error',
    // Form classes
    'form-input-wrapper', 'form-input-icon', 'form-label', 'form-label.required', 'form-error', 'form-section-heading', 'input-with-icon',
    // Page header
    'page-header',
    // Spacing
    'gap-spacing-default', 'spacing-section', 'spacing-section-sm',
    // Filter bar
    'filter-bar',
  ],
}
