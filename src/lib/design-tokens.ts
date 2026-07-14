// Unified design tokens for consistent styling across the app
// These ensure visual consistency without color changes

export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    600: "#16a34a",
    900: "#14532d",
  },
  warning: {
    50: "#fefce8",
    500: "#eab308",
    600: "#ca8a04",
    900: "#422006",
  },
  error: {
    50: "#fef2f2",
    300: "#fca5a5",
    500: "#ef4444",
    600: "#dc2626",
    900: "#7f1d1d",
  },
};

// Spacing scale - consistent padding/margin across app
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

// Border radius scale - hierarchy from small to large
export const radius = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  full: "9999px",
};

// Shadow system - elevation levels
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

// Typography scales
export const typography = {
  h1: {
    fontSize: "2rem", // 32px
    fontWeight: 700,
    lineHeight: "2.5rem",
  },
  h2: {
    fontSize: "1.5rem", // 24px
    fontWeight: 700,
    lineHeight: "2rem",
  },
  h3: {
    fontSize: "1.25rem", // 20px
    fontWeight: 600,
    lineHeight: "1.75rem",
  },
  h4: {
    fontSize: "1rem", // 16px
    fontWeight: 600,
    lineHeight: "1.5rem",
  },
  body: {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: "1.5rem",
  },
  small: {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: "1.25rem",
  },
  xs: {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: "1rem",
  },
};

// Z-index hierarchy for layering
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Button size variants
export const buttonSizes = {
  sm: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    height: "2rem",
  },
  md: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    height: "2.5rem",
  },
  lg: {
    padding: "1rem 2rem",
    fontSize: "1rem",
    height: "3rem",
  },
};

// Form input sizes
export const inputSizes = {
  sm: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    height: "2rem",
  },
  md: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    height: "2.5rem",
  },
  lg: {
    padding: "1rem 1.25rem",
    fontSize: "1rem",
    height: "3rem",
  },
};
