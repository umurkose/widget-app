"use client"

import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

type RevenueRangeData = {
  label: string
  value: string
  delta: string
  deltaShort: string
  dir: "up" | "down"
  // 12 hardcoded points on a 100x32 viewBox
  linePath: string
  // last point y of 32 -> % from the top
  endDotTop: string
  axisLabels: string[]
}

// last point y = 5 of 32 -> 15.625% from the top
const TODAY: RevenueRangeData = {
  label: "Revenue today",
  value: "$48.2K",
  delta: "+3.1% vs last Tue",
  deltaShort: "+3.1%",
  dir: "up",
  linePath:
    "M0,24 C3,24 6,21 9,21 C12,21 15,23 18,23 C21,23 24,17 27,17 C30,17 33,19 36,19 C39,19 42,13 45,13 C48,13 52,15 55,15 C58,15 61,10 64,10 C67,10 70,12 73,12 C76,12 79,7 82,7 C85,7 88,9 91,9 C94,9 97,5 100,5",
  endDotTop: "calc(15.625% - 4px)",
  axisLabels: DAY_LABELS,
}

const RANGE_DATA: Record<RangeKey, RevenueRangeData> = {
  all: TODAY,
  today: TODAY,
  yesterday: {
    label: "Revenue yesterday",
    value: "$45.6K",
    delta: "-2.2% vs prior Mon",
    deltaShort: "-2.2%",
    dir: "down",
    // last point y = 9 of 32 -> 28.125% from the top
    linePath:
      "M0,25 C3,25 6,23 9,23 C12,23 15,24 18,24 C21,24 24,19 27,19 C30,19 33,21 36,21 C39,21 42,16 45,16 C48,16 52,18 55,18 C58,18 61,13 64,13 C67,13 70,15 73,15 C76,15 79,11 82,11 C85,11 88,12 91,12 C94,12 97,9 100,9",
    endDotTop: "calc(28.125% - 4px)",
    axisLabels: DAY_LABELS,
  },
  "7d": {
    label: "Revenue · last 7 days",
    value: "$312K",
    delta: "+5.8% vs prior 7 days",
    deltaShort: "+5.8%",
    dir: "up",
    // last point y = 4 of 32 -> 12.5% from the top
    linePath:
      "M0,27 C3,27 6,24 9,24 C12,24 15,25 18,25 C21,25 24,20 27,20 C30,20 33,21 36,21 C39,21 42,15 45,15 C48,15 52,16 55,16 C58,16 61,11 64,11 C67,11 70,12 73,12 C76,12 79,7 82,7 C85,7 88,8 91,8 C94,8 97,4 100,4",
    endDotTop: "calc(12.5% - 4px)",
    axisLabels: DAY_LABELS,
  },
  "14d": {
    label: "Revenue · last 14 days",
    value: "$598K",
    delta: "+4.9% vs prior 14 days",
    deltaShort: "+4.9%",
    dir: "up",
    // last point y = 3 of 32 -> 9.375% from the top
    linePath:
      "M0,28 C3,28 6,26 9,26 C12,26 15,27 18,27 C21,27 24,22 27,22 C30,22 33,23 36,23 C39,23 42,17 45,17 C48,17 52,18 55,18 C58,18 61,12 64,12 C67,12 70,13 73,13 C76,13 79,8 82,8 C85,8 88,9 91,9 C94,9 97,3 100,3",
    endDotTop: "calc(9.375% - 4px)",
    axisLabels: ["14d ago", "7d ago", "now"],
  },
}

export function RevenueWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]
  const DeltaIcon = d.dir === "up" ? ArrowUpRight : ArrowDownRight
  const areaPath = `${d.linePath} L100,32 L0,32 Z`

  if (compact) {
    return (
      <WidgetShell title="Revenue" icon={TrendingUp} compact>
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
    <WidgetShell title="Revenue" icon={TrendingUp}>
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
        <div>
          <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 100 32"
              preserveAspectRatio="none"
              className="h-10 w-full overflow-visible"
            >
              <path d={areaPath} className="fill-primary/10" />
              <path
                d={d.linePath}
                className="stroke-primary"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              aria-hidden
              className="absolute size-2 rounded-full bg-primary ring-2 ring-card"
              style={{ right: "-4px", top: d.endDotTop }}
            />
          </div>
          <div className="mt-1 flex justify-between px-0.5">
            {d.axisLabels.map((label, i) => (
              <span key={i} className="text-[9px] text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
