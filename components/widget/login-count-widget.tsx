"use client"

import { LogIn } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { StatBlock, StatDelta, StatRow } from "@/components/widget/stat-block"
import { WidgetShell } from "@/components/widget/widget-shell"

type LoginRangeData = {
  accessory: string
  label: string
  value: string
  delta: string
  deltaShort: string
  dir: "up" | "down"
  peak: string
  bars: number[]
  axis: [string, string]
}

const TODAY: LoginRangeData = {
  accessory: "Last 12h",
  label: "Sign-ins today",
  value: "1,284",
  delta: "+8.2% vs yesterday",
  deltaShort: "+8.2%",
  dir: "up",
  peak: "Peak 14:00 · 172 sign-ins · 3 failed",
  bars: [24, 38, 55, 42, 68, 80, 62, 91, 74, 58, 86, 95],
  axis: ["12h ago", "now"],
}

const RANGE_DATA: Record<RangeKey, LoginRangeData> = {
  all: TODAY,
  today: TODAY,
  yesterday: {
    accessory: "Yesterday",
    label: "Sign-ins yesterday",
    value: "1,187",
    delta: "-3.9% vs prior day",
    deltaShort: "-3.9%",
    dir: "down",
    peak: "Peak 15:00 · 158 sign-ins · 5 failed",
    bars: [28, 41, 52, 47, 63, 74, 58, 84, 69, 55, 72, 66],
    axis: ["00:00", "24:00"],
  },
  "7d": {
    accessory: "Last 7 days",
    label: "Sign-ins · last 7 days",
    value: "9,340",
    delta: "+6.4% vs prior 7 days",
    deltaShort: "+6.4%",
    dir: "up",
    peak: "Peak Tue 14:00 · 208 sign-ins · 12 failed",
    bars: [42, 55, 48, 66, 58, 74, 62, 85, 70, 90, 78, 96],
    axis: ["7d ago", "now"],
  },
  "14d": {
    accessory: "Last 14 days",
    label: "Sign-ins · last 14 days",
    value: "18,930",
    delta: "+5.1% vs prior 14 days",
    deltaShort: "+5.1%",
    dir: "up",
    peak: "Peak Tue 14:00 · 208 sign-ins · 26 failed",
    bars: [38, 50, 44, 60, 52, 68, 58, 78, 64, 84, 72, 92],
    axis: ["14d ago", "now"],
  },
}

export function LoginCountWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]

  if (compact) {
    return (
      <WidgetShell title="Sign-ins" icon={LogIn} compact>
        <StatRow
          value={d.value}
          right={<StatDelta direction={d.dir}>{d.deltaShort}</StatDelta>}
        />
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Sign-ins" icon={LogIn} accessory={d.accessory}>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <StatBlock
          label={d.label}
          value={d.value}
          delta={d.delta}
          direction={d.dir}
          detail={d.peak}
        />
        <div className="shrink-0 space-y-1">
          <div aria-hidden className="flex h-10 items-end gap-0.5">
            {d.bars.map((height, i) => (
              <div
                key={i}
                className={
                  i === d.bars.length - 1
                    ? "flex-1 rounded-t-[3px] bg-primary"
                    : "flex-1 rounded-t-[3px] bg-primary/15"
                }
                style={{ height: `${height}%` }}
              />
            ))}
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
