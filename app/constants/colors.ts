/**
 * Centralized color palette for the app.
 * Use these constants instead of hardcoded hex values.
 */
export const colors = {
  // Primary (slate-900) – buttons, FAB, key text, shadows
  primary: "#0f172a",

  // Text
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  textChip: "#475569",

  // Backgrounds
  background: "#f8fafc",
  backgroundAlt: "#f4f4f5",
  surface: "#ffffff",

  // Borders
  border: "#e2e8f0",
  borderAlt: "#e4e4e7",
  borderLight: "#f1f5f9",

  // Shadows (use for shadowColor)
  shadow: "#0f172a",

  // On primary (text/icon on primary buttons, FAB)
  onPrimary: "#ffffff",

  // States
  error: "#dc2626",
  errorAlt: "#b91c1c",

  // Placeholders
  placeholder: "#94a3b8",
  placeholderAlt: "#a1a1aa",
} as const;

export type Colors = typeof colors;
