"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { WidgetShell } from "@/components/widget/widget-shell"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

const HAND_LAYER =
  "absolute inset-0 motion-reduce:[animation-play-state:paused]"

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
      className={cn("relative aspect-square rounded-full bg-muted", className)}
    >
      {/* a tick per minute: quarters longest, hours mid, minutes hairline */}
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="absolute inset-0"
          style={{ transform: `rotate(${i * 6}deg)` }}
        >
          <span
            className={cn(
              "absolute left-1/2 w-px -translate-x-1/2 rounded-full",
              i % 15 === 0
                ? "top-[13%] h-[7%] bg-foreground/55"
                : i % 5 === 0
                  ? "top-[13%] h-[5%] bg-foreground/35"
                  : "top-[13%] h-[2.5%] bg-foreground/15"
            )}
          />
        </span>
      ))}
      {/* hour hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_43200s_linear_infinite]")}
        style={{ animationDelay: `-${hours}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[22%] w-[2.5%] -translate-x-1/2 rounded-full bg-foreground/70" />
      </span>
      {/* minute hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_3600s_linear_infinite]")}
        style={{ animationDelay: `-${minutes}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[33%] w-[1.8%] -translate-x-1/2 rounded-full bg-foreground/70" />
      </span>
      {/* second hand */}
      <span
        className={cn(HAND_LAYER, "animate-[spin_60s_linear_infinite]")}
        style={{ animationDelay: `-${seconds}s` }}
      >
        <span className="absolute bottom-[49%] left-1/2 h-[36%] w-[1%] -translate-x-1/2 rounded-full bg-primary" />
      </span>
      <span className="absolute top-1/2 left-1/2 size-[3.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70" />
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

/** Week strip: flat and quiet — today is marked by weight and a dot. */
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
          <div key={i} className="flex flex-1 flex-col items-center gap-1 py-1">
            <span
              className={cn(
                "text-[9px] leading-none font-medium tracking-wider",
                isToday ? "text-foreground" : "text-muted-foreground/70"
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "font-accent leading-none tabular-nums",
                compact ? "text-[10px]" : "text-[11px]",
                isToday
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {dates[i] ?? ""}
            </span>
            <span
              aria-hidden
              className={cn(
                "size-1 rounded-full",
                isToday ? "bg-primary" : "bg-transparent"
              )}
            />
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
      <div className="flex min-h-0 flex-1 items-center justify-center gap-6">
        {mountedAt ? (
          <AnalogClock now={mountedAt} className="h-full max-h-30" />
        ) : (
          <div className="aspect-square h-full max-h-30 rounded-full bg-muted" />
        )}
        <div className="flex flex-col items-start">
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
