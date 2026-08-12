"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { WidgetShell } from "@/components/widget/widget-shell"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

const HAND_LAYER =
  "absolute inset-0 motion-reduce:[animation-play-state:paused]"

// Hands are driven entirely by CSS: each layer spins with the real period
// (60s / 1h / 12h) and a negative animation-delay winds it to the current
// time at mount — perfectly smooth, zero re-renders.
function AnalogClock({ now, className }: { now: Date; className?: string }) {
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000
  const minutes = now.getMinutes() * 60 + seconds
  const hours = (now.getHours() % 12) * 3600 + minutes

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-square rounded-full border bg-card shadow-[inset_0_1px_3px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.08)]",
        className
      )}
    >
      {/* 60 minute ticks, every 5th is a bolder hour marker */}
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="absolute inset-0"
          style={{ transform: `rotate(${i * 6}deg)` }}
        >
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 rounded-full",
              i % 5 === 0
                ? "top-[5%] h-[8%] w-[1.5px] bg-foreground/70"
                : "top-[5%] h-[4%] w-px bg-foreground/20"
            )}
          />
        </span>
      ))}
      {/* hour hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_43200s_linear_infinite]")}
        style={{ animationDelay: `-${hours}s` }}
      >
        <span className="absolute bottom-[47%] left-1/2 h-[28%] w-[4.5%] -translate-x-1/2 rounded-full bg-foreground" />
      </span>
      {/* minute hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_3600s_linear_infinite]")}
        style={{ animationDelay: `-${minutes}s` }}
      >
        <span className="absolute bottom-[47%] left-1/2 h-[42%] w-[3%] -translate-x-1/2 rounded-full bg-foreground" />
      </span>
      {/* second hand — thin, accent-colored, with a counterweight tail */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_60s_linear_infinite]")}
        style={{ animationDelay: `-${seconds}s` }}
      >
        <span className="absolute bottom-[38%] left-1/2 h-[57%] w-[1.5%] -translate-x-1/2 rounded-full bg-primary" />
      </span>
      {/* arbor: foreground cap under an accent pin */}
      <span className="absolute top-1/2 left-1/2 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
      <span className="absolute top-1/2 left-1/2 size-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  )
}

function weekDates(now: Date): number[] {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return DAY_LABELS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate()
  })
}

export function ClockWidget({ compact }: { compact?: boolean }) {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => setNow(new Date()), 0)
    return () => clearTimeout(timeout)
  }, [])

  const mondayIndex = now ? (now.getDay() + 6) % 7 : -1
  const dates = now ? weekDates(now) : []

  if (compact) {
    return (
      <WidgetShell title="Clock" icon={Clock} compact>
        <div className="flex min-h-0 flex-1 items-center gap-3.5">
          {now && <AnalogClock now={now} className="h-full" />}
          <div className="min-w-0">
            <div className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {now?.toLocaleDateString("en-US", { weekday: "long" }) ?? "—"}
            </div>
            <div className="font-heading text-2xl leading-tight font-semibold tracking-tight">
              {now
                ? now.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </div>
          </div>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Clock" icon={Clock}>
      <div className="flex min-h-0 flex-1 items-center justify-between gap-4">
        {now ? (
          <AnalogClock now={now} className="h-full max-h-32" />
        ) : (
          <div className="aspect-square h-full max-h-32 rounded-full border bg-card" />
        )}
        <div className="text-right">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {now?.toLocaleDateString("en-US", { weekday: "long" }) ?? "—"}
          </div>
          <div className="font-heading text-3xl leading-tight font-semibold tracking-tight">
            {now?.getDate() ?? "–"}
          </div>
          <div className="text-xs text-muted-foreground">
            {now?.toLocaleDateString("en-US", { month: "long" }) ?? "—"}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-start justify-between">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="flex w-6 flex-col items-center gap-0.5">
            <span className="text-[9px] font-medium tracking-wide text-muted-foreground">
              {d}
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px] font-medium tabular-nums transition-colors",
                i === mondayIndex
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80"
              )}
            >
              {dates[i] ?? ""}
            </span>
          </span>
        ))}
      </div>
    </WidgetShell>
  )
}
