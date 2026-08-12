"use client"

import { ArrowDownRight, ArrowUpRight, Globe } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

const SOURCE_STYLES = [
  { name: "Google", stroke: "stroke-primary", swatch: "bg-primary" },
  { name: "Direct", stroke: "stroke-primary/60", swatch: "bg-primary/60" },
  { name: "x.com", stroke: "stroke-primary/35", swatch: "bg-primary/35" },
  { name: "Newsletter", stroke: "stroke-primary/15", swatch: "bg-primary/15" },
]

type TrafficRangeData = {
  label: string
  value: string
  delta: string
  deltaShort: string
  dir: "up" | "down"
  centerCaption: string
  // shares aligned to SOURCE_STYLES order, sums to 100
  shares: number[]
}

const TODAY: TrafficRangeData = {
  label: "Visitors today",
  value: "18.9K",
  delta: "-2.4% vs last Mon",
  deltaShort: "-2.4%",
  dir: "down",
  centerCaption: "today",
  shares: [52, 24, 15, 9],
}

const RANGE_DATA: Record<RangeKey, TrafficRangeData> = {
  all: TODAY,
  today: TODAY,
  yesterday: {
    label: "Visitors yesterday",
    value: "17.6K",
    delta: "-4.1% vs prior day",
    deltaShort: "-4.1%",
    dir: "down",
    centerCaption: "yesterday",
    shares: [49, 26, 16, 9],
  },
  "7d": {
    label: "Visitors · last 7 days",
    value: "128K",
    delta: "+3.8% vs prior 7 days",
    deltaShort: "+3.8%",
    dir: "up",
    centerCaption: "7 days",
    shares: [54, 22, 14, 10],
  },
  "14d": {
    label: "Visitors · last 14 days",
    value: "251K",
    delta: "+2.9% vs prior 14 days",
    deltaShort: "+2.9%",
    dir: "up",
    centerCaption: "14 days",
    shares: [53, 23, 15, 9],
  },
}

export function TrafficWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]
  const DeltaIcon = d.dir === "up" ? ArrowUpRight : ArrowDownRight
  const offsets = d.shares.map((_, i) =>
    d.shares.slice(0, i).reduce((sum, share) => sum + share, 0)
  )

  if (compact) {
    return (
      <WidgetShell title="Traffic" icon={Globe} compact>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="text-xl leading-none font-semibold tracking-tight">
            {d.value}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
            <DeltaIcon aria-hidden className="size-3" />
            <span>{d.deltaShort}</span>
          </div>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Traffic" icon={Globe}>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{d.label}</div>
          <div className="mt-1 mb-0.5 text-2xl leading-none font-semibold tracking-tight">
            {d.value}
          </div>
          <div className="mt-1.5 flex items-center gap-0.5 text-xs text-muted-foreground">
            <DeltaIcon aria-hidden className="size-3" />
            <span>{d.delta}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative size-24 shrink-0">
            <svg aria-hidden viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                strokeWidth="4"
                className="stroke-primary/10"
              />
              {SOURCE_STYLES.map((source, i) => (
                <circle
                  key={source.name}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="butt"
                  strokeDasharray={`${d.shares[i] - 1.5} 100`}
                  strokeDashoffset={-offsets[i]}
                  className={source.stroke}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold">{d.value}</span>
              <span className="text-[9px] text-muted-foreground">
                {d.centerCaption}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {SOURCE_STYLES.map((source, i) => (
              <div key={source.name} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${source.swatch}`}
                />
                <span className="min-w-0 flex-1 truncate text-xs">
                  {source.name}
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {d.shares[i]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
