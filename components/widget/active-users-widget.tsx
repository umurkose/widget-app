"use client"

import { Users } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { StatBlock, StatRow } from "@/components/widget/stat-block"
import { WidgetShell } from "@/components/widget/widget-shell"

const ONLINE_NOW = "3,412"

const SEGMENTS = [
  { name: "Web", share: 58, mark: "bg-primary" },
  { name: "Mobile", share: 32, mark: "bg-primary/50" },
  { name: "API", share: 10, mark: "bg-primary/20" },
]

type ActiveUsersRangeData = {
  context: string
  dir: "up" | "down"
  peak: string
}

const TODAY: ActiveUsersRangeData = {
  context: "+312 vs an hour ago",
  dir: "up",
  peak: "Peak today 4,918 · 09:00-10:00",
}

const RANGE_DATA: Record<RangeKey, ActiveUsersRangeData> = {
  all: TODAY,
  today: TODAY,
  yesterday: {
    context: "-2.1% avg vs prior day",
    dir: "down",
    peak: "Peak yesterday 4,655 · 10:00-11:00",
  },
  "7d": {
    context: "+4.6% avg vs prior week",
    dir: "up",
    peak: "Peak this week 5,204 · Tue 10:00",
  },
  "14d": {
    context: "+3.4% avg vs prior 2 weeks",
    dir: "up",
    peak: "Peak last 14 days 5,311 · Wed 11:00",
  },
}

export function ActiveUsersWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]

  if (compact) {
    return (
      <WidgetShell title="Active users" icon={Users} compact>
        <StatRow
          value={ONLINE_NOW}
          right={
            <div aria-hidden className="flex h-1.5 w-20 gap-0.5">
              {SEGMENTS.map((segment) => (
                <div
                  key={segment.name}
                  className={`rounded-full ${segment.mark}`}
                  style={{ width: `${segment.share}%` }}
                />
              ))}
            </div>
          }
        />
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Active users" icon={Users} accessory="Live">
      <div className="flex flex-1 flex-col justify-between gap-2">
        <StatBlock
          label="Online now"
          value={ONLINE_NOW}
          delta={d.context}
          direction={d.dir}
          detail={d.peak}
        />
        <div className="shrink-0 space-y-1.5">
          <div
            aria-hidden
            className="flex h-2 gap-0.5 overflow-hidden rounded-full"
          >
            {SEGMENTS.map((segment) => (
              <div
                key={segment.name}
                className={`rounded-full ${segment.mark}`}
                style={{ width: `${segment.share}%` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {SEGMENTS.map((segment) => (
              <span key={segment.name} className="flex items-center gap-1">
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${segment.mark}`}
                />
                <span>{segment.name}</span>
                <span className="tabular-nums">{segment.share}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  )
}
