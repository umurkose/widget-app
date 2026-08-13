"use client"

import { Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ACCENTS,
  FONTS,
  RADII,
  TEXT_SIZES,
  THEMES,
} from "@/lib/preferences"
import { usePreferences } from "@/components/preferences-provider"
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

const optionClass = (active: boolean) =>
  cn(
    "flex flex-col items-center justify-center gap-0.5 rounded-lg border transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
    active ? "border-ring bg-muted/50" : "border-border"
  )

export function ThemePreferences() {
  const { prefs, setPreference } = usePreferences()

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Preferences" />
            }
          >
            <Palette />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Preferences</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-68 p-4">
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
                        aria-pressed={prefs.accent === a.key}
                        onClick={() => setPreference("accent", a.key)}
                        style={a.value ? { background: a.value } : undefined}
                        className={cn(
                          "size-6 rounded-full border border-foreground/10 transition-[box-shadow,transform] outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50",
                          !a.value && "bg-foreground",
                          prefs.accent === a.key &&
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
                        aria-pressed={prefs.theme === t.key}
                        onClick={() => setPreference("theme", t.key)}
                        className={cn(optionClass(prefs.theme === t.key), "gap-1 p-1.5")}
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
                        aria-pressed={prefs.font === f.key}
                        onClick={() => setPreference("font", f.key)}
                        className={cn(optionClass(prefs.font === f.key), "p-2")}
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
              Text size
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {TEXT_SIZES.map((t) => (
                <Tooltip key={t.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${t.label} text size`}
                        aria-pressed={prefs.textSize === t.key}
                        onClick={() => setPreference("textSize", t.key)}
                        className={cn(
                          optionClass(prefs.textSize === t.key),
                          "h-11"
                        )}
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className={cn("leading-none font-medium", t.preview)}
                    >
                      A
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {t.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.label} text size</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">
              Corner radius
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {RADII.map((r) => (
                <Tooltip key={r.key}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${r.label} corner radius`}
                        aria-pressed={prefs.radius === r.key}
                        onClick={() => setPreference("radius", r.key)}
                        className={cn(
                          optionClass(prefs.radius === r.key),
                          "justify-center p-2"
                        )}
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-5 border-2 border-muted-foreground/60",
                        r.preview,
                        prefs.radius === r.key && "border-foreground"
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
