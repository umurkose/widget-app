// Single source of truth for the user preferences that live on <html>:
// the provider applies them, the popover renders them, and the blocking
// script below re-applies them before first paint so navigation and reloads
// never flash the default theme.

export const PREFS_STORAGE_KEY = "widget-board-prefs"

export const ACCENTS = [
  { key: "mono", label: "Mono", value: null },
  { key: "blue", label: "Blue", value: "oklch(0.546 0.245 262.881)" },
  { key: "violet", label: "Violet", value: "oklch(0.541 0.281 293.009)" },
  { key: "green", label: "Green", value: "oklch(0.627 0.194 149.214)" },
  { key: "orange", label: "Orange", value: "oklch(0.646 0.222 41.116)" },
  { key: "rose", label: "Rose", value: "oklch(0.645 0.246 16.439)" },
] as const

// Color themes defined in globals.css via html[data-app-theme=...] blocks
// (each with its own light + dark palette). The stripes preview each theme's
// light background, muted surface, primary and dark background.
export const THEMES = [
  {
    key: "default",
    label: "Default",
    stripes: ["oklch(1 0 0)", "oklch(0.97 0 0)", "oklch(0.205 0 0)", "oklch(0.145 0 0)"],
  },
  {
    key: "ocean",
    label: "Ocean",
    stripes: ["oklch(0.985 0.006 235)", "oklch(0.955 0.012 235)", "oklch(0.55 0.19 252)", "oklch(0.16 0.025 245)"],
  },
  {
    key: "forest",
    label: "Forest",
    stripes: ["oklch(0.985 0.006 150)", "oklch(0.955 0.014 150)", "oklch(0.52 0.13 155)", "oklch(0.17 0.02 155)"],
  },
  {
    key: "sunset",
    label: "Sunset",
    stripes: ["oklch(0.985 0.008 60)", "oklch(0.955 0.018 65)", "oklch(0.6 0.17 35)", "oklch(0.17 0.02 40)"],
  },
] as const

// `sans` drives the body face, `display` the value/heading face; null resets
// back to Geist. The serif option keeps the body sans and serifs the display.
export const FONTS = [
  { key: "geist", label: "Geist", sans: null, display: null },
  {
    key: "inter",
    label: "Inter",
    sans: "var(--font-inter)",
    display: "var(--font-inter)",
  },
  { key: "serif", label: "Serif", sans: null, display: "var(--font-serif)" },
] as const

// Text size scales the whole app: every rem-based size (type, spacing, radii)
// follows the root font size, so this is the accessibility zoom control.
export const TEXT_SIZES = [
  { key: "sm", label: "Small", value: "14px", preview: "text-[11px]" },
  { key: "md", label: "Default", value: null, preview: "text-[13px]" },
  { key: "lg", label: "Large", value: "18px", preview: "text-[16px]" },
] as const

// `value` drives --radius (cards, dialogs, kbd…); `control` drives
// --radius-control (buttons, selects — pill by default).
export const RADII = [
  {
    key: "none",
    label: "None",
    value: "0rem",
    control: "0px",
    preview: "rounded-none",
  },
  {
    key: "sm",
    label: "Small",
    value: "0.45rem",
    control: "0.5rem",
    preview: "rounded-[5px]",
  },
  {
    key: "lg",
    label: "Large",
    value: "1rem",
    control: null,
    preview: "rounded-[12px]",
  },
] as const

export type Preferences = {
  accent: string
  theme: string
  font: string
  textSize: string
  radius: string
}

export const DEFAULT_PREFERENCES: Preferences = {
  accent: "mono",
  theme: "default",
  font: "serif",
  textSize: "lg",
  radius: "lg",
}

export const ACCENT_FOREGROUND = "oklch(0.985 0 0)"

/** Keep only values we still ship; anything else falls back to the default. */
export function normalizePreferences(raw: unknown): Preferences {
  const saved = (raw ?? {}) as Record<string, unknown>
  const pick = <T extends { key: string }>(
    options: readonly T[],
    value: unknown,
    fallback: string
  ) => (options.some((o) => o.key === value) ? (value as string) : fallback)

  return {
    accent: pick(ACCENTS, saved.accent, DEFAULT_PREFERENCES.accent),
    theme: pick(THEMES, saved.theme, DEFAULT_PREFERENCES.theme),
    font: pick(FONTS, saved.font, DEFAULT_PREFERENCES.font),
    textSize: pick(TEXT_SIZES, saved.textSize, DEFAULT_PREFERENCES.textSize),
    radius: pick(RADII, saved.radius, DEFAULT_PREFERENCES.radius),
  }
}

/** Applies (or clears) every preference on the document element. */
export function applyPreferences(root: HTMLElement, prefs: Preferences) {
  const accent = ACCENTS.find((a) => a.key === prefs.accent)?.value
  if (accent) {
    root.style.setProperty("--primary", accent)
    root.style.setProperty("--primary-foreground", ACCENT_FOREGROUND)
    root.style.setProperty("--ring", accent)
  } else {
    root.style.removeProperty("--primary")
    root.style.removeProperty("--primary-foreground")
    root.style.removeProperty("--ring")
  }

  if (prefs.theme !== "default") root.setAttribute("data-app-theme", prefs.theme)
  else root.removeAttribute("data-app-theme")

  const font = FONTS.find((f) => f.key === prefs.font)
  if (font?.sans) root.style.setProperty("--font-sans-active", font.sans)
  else root.style.removeProperty("--font-sans-active")
  if (font?.display)
    root.style.setProperty("--font-display-active", font.display)
  else root.style.removeProperty("--font-display-active")

  const radius = RADII.find((r) => r.key === prefs.radius)
  if (radius?.value) root.style.setProperty("--radius", radius.value)
  else root.style.removeProperty("--radius")
  if (radius?.control)
    root.style.setProperty("--radius-control", radius.control)
  else root.style.removeProperty("--radius-control")

  const textSize = TEXT_SIZES.find((t) => t.key === prefs.textSize)?.value
  if (textSize) root.style.fontSize = textSize
  else root.style.removeProperty("font-size")
}

/**
 * Runs before first paint (see app/layout.tsx) so a reload lands on the saved
 * theme instead of flashing the default one.
 */
export function preferencesInitScript(): string {
  const maps = {
    key: PREFS_STORAGE_KEY,
    accentForeground: ACCENT_FOREGROUND,
    d: DEFAULT_PREFERENCES,
    accents: Object.fromEntries(ACCENTS.map((a) => [a.key, a.value])),
    fonts: Object.fromEntries(FONTS.map((f) => [f.key, [f.sans, f.display]])),
    radii: Object.fromEntries(RADII.map((r) => [r.key, [r.value, r.control]])),
    textSizes: Object.fromEntries(TEXT_SIZES.map((t) => [t.key, t.value])),
  }

  return `(function(){try{var M=${JSON.stringify(maps)};var s={};try{s=JSON.parse(localStorage.getItem(M.key)||"{}")||{}}catch(e){}var p={accent:s.accent||M.d.accent,theme:s.theme||M.d.theme,font:s.font||M.d.font,radius:s.radius||M.d.radius,textSize:s.textSize||M.d.textSize};var r=document.documentElement;var a=M.accents[p.accent];if(a){r.style.setProperty("--primary",a);r.style.setProperty("--primary-foreground",M.accentForeground);r.style.setProperty("--ring",a)}if(p.theme&&p.theme!=="default")r.setAttribute("data-app-theme",p.theme);var f=M.fonts[p.font];if(f){if(f[0])r.style.setProperty("--font-sans-active",f[0]);if(f[1])r.style.setProperty("--font-display-active",f[1])}var d=M.radii[p.radius];if(d){if(d[0])r.style.setProperty("--radius",d[0]);if(d[1])r.style.setProperty("--radius-control",d[1])}var t=M.textSizes[p.textSize];if(t)r.style.fontSize=t}catch(e){}})()`
}
