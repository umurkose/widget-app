"use client"

import * as React from "react"
import { Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ACCENTS = [
  { key: "mono", label: "Mono", value: null },
  { key: "blue", label: "Blue", value: "oklch(0.546 0.245 262.881)" },
  { key: "violet", label: "Violet", value: "oklch(0.541 0.281 293.009)" },
  { key: "green", label: "Green", value: "oklch(0.627 0.194 149.214)" },
  { key: "orange", label: "Orange", value: "oklch(0.646 0.222 41.116)" },
  { key: "rose", label: "Rose", value: "oklch(0.645 0.246 16.439)" },
] as const

// `value` drives --radius (cards, dialogs, kbd…); `control` drives
// --radius-control (buttons, selects — pill by default).
// Color themes defined in globals.css via html[data-app-theme=...] blocks
// (each with its own light + dark palette). The stripes preview each theme's
// light background, muted surface, primary and dark background.
const THEMES = [
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
const FONTS = [
  { key: "geist", label: "Geist", sans: null, display: null },
  {
    key: "inter",
    label: "Inter",
    sans: "var(--font-inter)",
    display: "var(--font-inter)",
  },
  { key: "serif", label: "Serif", sans: null, display: "var(--font-serif)" },
] as const

const RADII = [
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
    key: "md",
    label: "Default",
    value: null,
    control: null,
    preview: "rounded-[8px]",
  },
  {
    key: "lg",
    label: "Large",
    value: "1rem",
    control: null,
    preview: "rounded-[12px]",
  },
] as const

const STORAGE_KEY = "widget-board-prefs"

export function ThemePreferences() {
  const [accent, setAccent] = React.useState<string>("mono")
  const [radius, setRadius] = React.useState<string>("md")
  const [font, setFont] = React.useState<string>("geist")
  const [theme, setTheme] = React.useState<string>("default")

  const hydrated = React.useRef(false)

  // Restore persisted preferences once on mount. The read happens
  // synchronously (before the save effect could overwrite the store) and the
  // save effect stays silent until this restore has been applied.
  React.useEffect(() => {
    let saved: Record<string, string> = {}
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
    } catch {
      // corrupted storage — fall back to defaults
    }
    const timeout = setTimeout(() => {
      if (ACCENTS.some((a) => a.key === saved.accent)) setAccent(saved.accent)
      if (RADII.some((r) => r.key === saved.radius)) setRadius(saved.radius)
      if (FONTS.some((f) => f.key === saved.font)) setFont(saved.font)
      if (THEMES.some((t) => t.key === saved.theme)) setTheme(saved.theme)
      hydrated.current = true
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  React.useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accent, radius, font, theme })
    )
  }, [accent, radius, font, theme])

  React.useEffect(() => {
    const root = document.documentElement
    if (theme !== "default") root.setAttribute("data-app-theme", theme)
    else root.removeAttribute("data-app-theme")
  }, [theme])

  React.useEffect(() => {
    const root = document.documentElement
    const entry = FONTS.find((f) => f.key === font)
    if (entry?.sans) root.style.setProperty("--font-sans-active", entry.sans)
    else root.style.removeProperty("--font-sans-active")
    if (entry?.display)
      root.style.setProperty("--font-display-active", entry.display)
    else root.style.removeProperty("--font-display-active")
  }, [font])

  React.useEffect(() => {
    const root = document.documentElement
    const value = ACCENTS.find((a) => a.key === accent)?.value
    if (value) {
      root.style.setProperty("--primary", value)
      root.style.setProperty("--primary-foreground", "oklch(0.985 0 0)")
      root.style.setProperty("--ring", value)
    } else {
      root.style.removeProperty("--primary")
      root.style.removeProperty("--primary-foreground")
      root.style.removeProperty("--ring")
    }
  }, [accent])

  React.useEffect(() => {
    const root = document.documentElement
    const entry = RADII.find((r) => r.key === radius)
    if (entry?.value) root.style.setProperty("--radius", entry.value)
    else root.style.removeProperty("--radius")
    if (entry?.control)
      root.style.setProperty("--radius-control", entry.control)
    else root.style.removeProperty("--radius-control")
  }, [radius])

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Preferences"
              />
            }
          >
            <Palette />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Preferences</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-56 p-4">
        <div className="space-y-4">
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">
              Accent
            </legend>
            <div className="mt-2 flex items-center gap-2">
              {ACCENTS.map((a) => (
                <Tooltip key={a.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={a.label}
                        aria-pressed={accent === a.key}
                        onClick={() => setAccent(a.key)}
                        style={a.value ? { background: a.value } : undefined}
                        className={cn(
                          "size-6 rounded-full border border-foreground/10 transition-[box-shadow,transform] outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50",
                          !a.value && "bg-foreground",
                          accent === a.key &&
                            "ring-2 ring-ring ring-offset-2 ring-offset-popover"
                        )}
                      />
                    }
                  />
                  <TooltipContent>{a.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">
              Theme
            </legend>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {THEMES.map((t) => (
                <Tooltip key={t.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${t.label} theme`}
                        aria-pressed={theme === t.key}
                        onClick={() => setTheme(t.key)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                          theme === t.key
                            ? "border-ring bg-muted/50"
                            : "border-border"
                        )}
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className="flex h-6 w-full overflow-hidden rounded-md border border-foreground/10"
                    >
                      {t.stripes.map((c, i) => (
                        <span
                          key={i}
                          className="flex-1"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {t.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">
              Font
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {FONTS.map((f) => (
                <Tooltip key={f.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${f.label} font`}
                        aria-pressed={font === f.key}
                        onClick={() => setFont(f.key)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                          font === f.key
                            ? "border-ring bg-muted/50"
                            : "border-border"
                        )}
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className="text-base leading-none font-medium"
                      style={{
                        fontFamily:
                          f.display ?? f.sans ?? "var(--font-geist-sans)",
                      }}
                    >
                      Ag
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {f.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{f.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">
              Corner radius
            </legend>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {RADII.map((r) => (
                <Tooltip key={r.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${r.label} corner radius`}
                        aria-pressed={radius === r.key}
                        onClick={() => setRadius(r.key)}
                        className={cn(
                          "flex items-center justify-center rounded-lg border p-2 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                          radius === r.key
                            ? "border-ring bg-muted/50"
                            : "border-border"
                        )}
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-5 border-2 border-muted-foreground/60",
                        r.preview,
                        radius === r.key && "border-foreground"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{r.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
        </div>
      </PopoverContent>
    </Popover>
  )
}
