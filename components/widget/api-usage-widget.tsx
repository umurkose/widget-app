"use client"

import { Activity } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { useFilters, type RangeKey } from "@/components/widget/filters"
import { StatBlock, StatRow } from "@/components/widget/stat-block"
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
  err: string
  quota: number
  quotaLabel: string
  chart: ReturnType<typeof buildChart>
  axis: [string, string]
}

const TODAY: ApiRangeData = {
  accessory: "24h",
  label: "Requests (24h)",
  value: "2.4M",
  delta: "+11% vs prior 24h",
  dir: "up",
  err: "0.42% errors",
  quota: 48,
  quotaLabel: "2.4M of 5M requests",
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
    err: "0.51% errors",
    quota: 42,
    quotaLabel: "2.1M of 5M requests",
    chart: buildChart(YESTERDAY_POINTS),
    axis: ["00:00", "24:00"],
  },
  "7d": {
    accessory: "7d",
    label: "Requests · last 7 days",
    value: "15.8M",
    delta: "+9% vs prior 7 days",
    dir: "up",
    err: "0.44% errors",
    quota: 63,
    quotaLabel: "15.8M of 25M requests",
    chart: buildChart(WEEK_POINTS),
    axis: ["7d ago", "now"],
  },
  "14d": {
    accessory: "14d",
    label: "Requests · last 14 days",
    value: "30.6M",
    delta: "+7% vs prior 14 days",
    dir: "up",
    err: "0.47% errors",
    quota: 61,
    quotaLabel: "30.6M of 50M requests",
    chart: buildChart(FORTNIGHT_POINTS),
    axis: ["14d ago", "now"],
  },
}

export function ApiUsageWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]

  if (compact) {
    return (
      <WidgetShell title="API usage" icon={Activity} compact>
        <StatRow
          value={d.value}
          right={
            <div className="flex items-center gap-3">
              <div className="flex w-16 shrink-0 flex-col gap-1">
                <Progress value={d.quota} />
                <span className="font-accent text-[10px] text-muted-foreground tabular-nums">
                  {d.quota}%
                </span>
              </div>
              <div aria-hidden className="h-8 w-20 shrink-0">
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <path d={d.chart.area} className="fill-primary/10" />
                  <path
                    d={d.chart.line}
                    fill="none"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-primary"
                  />
                </svg>
              </div>
            </div>
          }
        />
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="API usage" icon={Activity} accessory={d.accessory}>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <StatBlock
          label={d.label}
          value={d.value}
          delta={d.delta}
          direction={d.dir}
          detail={d.err}
        />
        <div className="shrink-0 space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{d.quotaLabel}</span>
            <span className="font-accent tabular-nums">{d.quota}%</span>
          </div>
          <Progress value={d.quota} />
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
