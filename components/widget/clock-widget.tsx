"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { WidgetShell } from "@/components/widget/widget-shell"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

const HAND_LAYER =
  "absolute inset-0 motion-reduce:[animation-play-state:paused]"

// Soft-UI depth: light from the top-left, shade to the bottom-right. Dark
// mode keeps the shade and thins the highlight, the way real matte does.
const RAISED =
  "shadow-[5px_5px_12px_rgb(0_0_0/0.10),-4px_-4px_10px_rgb(255_255_255/0.85)] dark:shadow-[6px_6px_14px_rgb(0_0_0/0.55),-4px_-4px_10px_rgb(255_255_255/0.04)]"
const INSET =
  "shadow-[inset_2px_2px_5px_rgb(0_0_0/0.10),inset_-2px_-2px_5px_rgb(255_255_255/0.85)] dark:shadow-[inset_3px_3px_6px_rgb(0_0_0/0.55),inset_-2px_-2px_5px_rgb(255_255_255/0.04)]"

/**
 * Hands are driven entirely by CSS: each layer spins with the real period
 * (60s / 1h / 12h) and a negative animation-delay winds it to the current
 * time at mount — perfectly smooth, zero re-renders. Memoised so the ticking
 * digital readout never restarts those animations.
 */
const AnalogClock = React.memo(function AnalogClock({
  now,
  className,
}: {
  now: Date
  className?: string
}) {
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000
  const minutes = now.getMinutes() * 60 + seconds
  const hours = (now.getHours() % 12) * 3600 + minutes

  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-square rounded-full bg-card",
        RAISED,
        className
      )}
    >
      {/* recessed dial inside the raised body */}
      <div className={cn("absolute inset-[9%] rounded-full bg-card", INSET)} />
      {/* four quiet markers — 12, 3, 6, 9 */}
      {[0, 90, 180, 270].map((deg) => (
        <span
          key={deg}
          className="absolute inset-0"
          style={{ transform: `rotate(${deg}deg)` }}
        >
          <span className="absolute top-[15%] left-1/2 h-[6%] w-px -translate-x-1/2 rounded-full bg-foreground/25" />
        </span>
      ))}
      {/* hour hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_43200s_linear_infinite]")}
        style={{ animationDelay: `-${hours}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[24%] w-[3.5%] -translate-x-1/2 rounded-full bg-foreground/80" />
      </span>
      {/* minute hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_3600s_linear_infinite]")}
        style={{ animationDelay: `-${minutes}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[35%] w-[2.5%] -translate-x-1/2 rounded-full bg-foreground/80" />
      </span>
      {/* second hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_60s_linear_infinite]")}
        style={{ animationDelay: `-${seconds}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[38%] w-[1.5%] -translate-x-1/2 rounded-full bg-primary" />
      </span>
      <span className="absolute top-1/2 left-1/2 size-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/80" />
    </div>
  )
})

function weekDates(now: Date): number[] {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return DAY_LABELS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate()
  })
}

function parts(now: Date) {
  const hour = now.getHours()
  return {
    time: `${String(hour % 12 || 12).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`,
    suffix: hour < 12 ? "AM" : "PM",
  }
}

/** Week strip: today sits in a pressed well, the rest stay flat and quiet. */
function WeekStrip({
  dates,
  today,
  compact,
}: {
  dates: number[]
  today: number
  compact?: boolean
}) {
  return (
    <div className="flex shrink-0 items-stretch justify-between gap-1">
      {DAY_LABELS.map((label, i) => {
        const isToday = i === today
        return (
          <div
            key={i}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5",
              isToday && cn("bg-card", INSET)
            )}
          >
            <span
              className={cn(
                "text-[9px] leading-none font-medium tracking-wider",
                isToday ? "text-foreground/70" : "text-muted-foreground/70"
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "font-accent leading-none font-medium tabular-nums",
                compact ? "text-[10px]" : "text-[11px]",
                isToday ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {dates[i] ?? ""}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ClockWidget({ compact }: { compact?: boolean }) {
  // Fixed at mount: winds the CSS hands. Never updated, or they would jump.
  const [mountedAt, setMountedAt] = React.useState<Date | null>(null)
  // Ticks so the digital readout stays honest across a minute boundary.
  const [now, setNow] = React.useState<Date | null>(null)

  // Clock state starts after paint so the server markup never claims a time.
  React.useEffect(() => {
    let interval: number | undefined
    const start = window.setTimeout(() => {
      const at = new Date()
      setMountedAt(at)
      setNow(at)
      interval = window.setInterval(() => setNow(new Date()), 1000)
    }, 0)
    return () => {
      window.clearTimeout(start)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  const todayIndex = now ? (now.getDay() + 6) % 7 : -1
  const dates = now ? weekDates(now) : []
  const { time, suffix } = now ? parts(now) : { time: "--:--", suffix: "" }

  if (compact) {
    return (
      <WidgetShell title="Clock" icon={Clock} compact>
        <div className="flex min-h-0 flex-1 items-center gap-3.5">
          {mountedAt && <AnalogClock now={mountedAt} className="h-full" />}
          <div className="min-w-0">
            <div className="font-accent flex items-baseline gap-1 text-2xl leading-none font-medium tracking-tight tabular-nums">
              {time}
              <span className="text-[10px] font-medium text-muted-foreground">
                {suffix}
              </span>
            </div>
            <div className="pt-1.5 text-[10px] text-muted-foreground">
              {now?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              }) ?? "—"}
            </div>
          </div>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Clock" icon={Clock}>
      <div className="flex min-h-0 flex-1 items-center justify-between gap-4">
        {mountedAt ? (
          <AnalogClock now={mountedAt} className="h-full max-h-30" />
        ) : (
          <div
            className={cn(
              "aspect-square h-full max-h-30 rounded-full bg-card",
              RAISED
            )}
          />
        )}
        <div className="flex flex-col items-end text-right">
          <div className="font-accent flex items-baseline gap-1.5 text-4xl leading-none font-medium tracking-tight tabular-nums">
            {time}
            <span className="text-xs font-medium text-muted-foreground">
              {suffix}
            </span>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            {now?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }) ?? "—"}
          </div>
        </div>
      </div>
      <WeekStrip dates={dates} today={todayIndex} />
    </WidgetShell>
  )
}
