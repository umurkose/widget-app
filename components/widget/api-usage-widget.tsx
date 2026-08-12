"use client"

import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i, pts) => {
    if (i === 0) return `M ${x} ${y}`
    const [px, py] = pts[i - 1]
    const [ppx, ppy] = pts[i - 2] ?? pts[i - 1]
    const [nx, ny] = pts[i + 1] ?? pts[i]
    const c1x = px + (x - ppx) / 6
    const c1y = py + (y - ppy) / 6
    const c2x = x - (nx - px) / 6
    const c2y = y - (ny - py) / 6
    return `${d} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y}`
  }, "")
}

function buildChart(points: [number, number][]) {
  const line = smoothPath(points)
  return {
    line,
    area: `${line} L 100 32 L 0 32 Z`,
    lastY: points[points.length - 1][1],
  }
}

const TODAY_POINTS: [number, number][] = [
  [0, 24],
  [9, 22],
  [18, 23],
  [27, 19],
  [36, 20],
  [45, 16],
  [55, 17],
  [64, 13],
  [73, 14],
  [82, 10],
  [91, 9],
  [100, 6],
]

const YESTERDAY_POINTS: [number, number][] = [
  [0, 18],
  [9, 20],
  [18, 17],
  [27, 21],
  [36, 19],
  [45, 22],
  [55, 20],
  [64, 23],
  [73, 21],
  [82, 24],
  [91, 22],
  [100, 20],
]

const WEEK_POINTS: [number, number][] = [
  [0, 26],
  [9, 24],
  [18, 25],
  [27, 21],
  [36, 22],
  [45, 18],
  [55, 19],
  [64, 15],
  [73, 16],
  [82, 12],
  [91, 10],
  [100, 7],
]

const FORTNIGHT_POINTS: [number, number][] = [
  [0, 28],
  [9, 26],
  [18, 27],
  [27, 23],
  [36, 24],
  [45, 20],
  [55, 21],
  [64, 16],
  [73, 17],
  [82, 12],
  [91, 9],
  [100, 5],
]

type ApiRangeData = {
  accessory: string
  label: string
  value: string
  delta: string
  dir: "up" | "down"
  p95: string
  err: string
  chart: ReturnType<typeof buildChart>
  axis: [string, string]
}

const TODAY: ApiRangeData = {
  accessory: "24h",
  label: "Requests (24h)",
  value: "2.4M",
  delta: "+11% vs prior 24h",
  dir: "up",
  p95: "p95 182 ms",
  err: "err 0.42%",
  chart: buildChart(TODAY_POINTS),
  axis: ["24h ago", "now"],
}

const RANGE_DATA: Record<RangeKey, ApiRangeData> = {
  all: TODAY,
  today: TODAY,
  yesterday: {
    accessory: "Yesterday",
    label: "Requests (yesterday)",
    value: "2.1M",
    delta: "-6% vs prior 24h",
    dir: "down",
    p95: "p95 190 ms",
    err: "err 0.51%",
    chart: buildChart(YESTERDAY_POINTS),
    axis: ["00:00", "24:00"],
  },
  "7d": {
    accessory: "7d",
    label: "Requests · last 7 days",
    value: "15.8M",
    delta: "+9% vs prior 7 days",
    dir: "up",
    p95: "p95 185 ms",
    err: "err 0.44%",
    chart: buildChart(WEEK_POINTS),
    axis: ["7d ago", "now"],
  },
  "14d": {
    accessory: "14d",
    label: "Requests · last 14 days",
    value: "30.6M",
    delta: "+7% vs prior 14 days",
    dir: "up",
    p95: "p95 187 ms",
    err: "err 0.47%",
    chart: buildChart(FORTNIGHT_POINTS),
    axis: ["14d ago", "now"],
  },
}

export function ApiUsageWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]
  const DeltaIcon = d.dir === "up" ? ArrowUpRight : ArrowDownRight

  if (compact) {
    return (
      <WidgetShell title="API usage" icon={Activity} compact>
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="text-xl font-semibold leading-none tracking-tight">
            {d.value}
          </div>
          <div className="text-xs text-muted-foreground">{d.p95}</div>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="API usage" icon={Activity} accessory={d.accessory}>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">{d.label}</div>
          <div className="mt-1 mb-0.5 text-2xl font-semibold leading-none tracking-tight">
            {d.value}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DeltaIcon aria-hidden className="size-3" />
            <span>{d.delta}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {d.p95} &middot; {d.err}
          </div>
        </div>
        <div className="shrink-0 space-y-1">
          <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 100 32"
              preserveAspectRatio="none"
              className="h-10 w-full overflow-visible"
            >
              <defs>
                <linearGradient id="apiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    className="[stop-color:var(--primary)]"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    className="[stop-color:var(--primary)]"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path d={d.chart.area} fill="url(#apiFill)" />
              <path
                d={d.chart.line}
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
              className="absolute size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-card"
              style={{ right: 0, top: `${(d.chart.lastY / 32) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>{d.axis[0]}</span>
            <span>{d.axis[1]}</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
