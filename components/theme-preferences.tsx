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

export function ThemePreferences() {
  const [accent, setAccent] = React.useState<string>("mono")
  const [radius, setRadius] = React.useState<string>("md")

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
