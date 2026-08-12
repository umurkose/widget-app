"use client"

import { Megaphone } from "lucide-react"

import { useFilters, type RangeKey } from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

type Campaign = {
  name: string
  conversion: string
  spent: number
}

const TODAY: Campaign[] = [
  { name: "Spring cashback", conversion: "4.8%", spent: 72 },
  { name: "Card upgrade push", conversion: "2.3%", spent: 41 },
  { name: "Referral boost", conversion: "6.1%", spent: 88 },
]

const RANGE_DATA: Record<RangeKey, Campaign[]> = {
  all: TODAY,
  today: TODAY,
  yesterday: [
    { name: "Spring cashback", conversion: "4.5%", spent: 70 },
    { name: "Card upgrade push", conversion: "2.1%", spent: 39 },
    { name: "Referral boost", conversion: "5.8%", spent: 85 },
  ],
  "7d": [
    { name: "Spring cashback", conversion: "5.0%", spent: 74 },
    { name: "Card upgrade push", conversion: "2.6%", spent: 44 },
    { name: "Referral boost", conversion: "6.4%", spent: 90 },
  ],
  "14d": [
    { name: "Spring cashback", conversion: "5.2%", spent: 76 },
    { name: "Card upgrade push", conversion: "2.7%", spent: 46 },
    { name: "Referral boost", conversion: "6.6%", spent: 91 },
  ],
}

export function CampaignsWidget({ compact }: { compact?: boolean }) {
  const { range } = useFilters()
  const d = RANGE_DATA[range]

  if (compact) {
    const top = d[0]
    return (
      <WidgetShell title="Campaigns" icon={Megaphone} compact>
        <div className="flex flex-1 items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-medium text-foreground">
            {top.name}
          </span>
          <div
            aria-hidden
            className="h-1.5 w-16 shrink-0 rounded-full bg-primary/15"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${top.spent}%` }}
            />
          </div>
          <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            {top.conversion}
          </span>
        </div>
      </WidgetShell>
    )
  }

  return (
    <WidgetShell title="Campaigns" icon={Megaphone} accessory="3 active">
      <div className="space-y-2.5">
        {d.map((campaign) => (
          <div key={campaign.name}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-xs font-medium text-foreground">
                {campaign.name}
              </span>
              <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {campaign.conversion}
              </span>
            </div>
            <div
              aria-hidden
              className="mt-1.5 h-1.5 w-full rounded-full bg-primary/15"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${campaign.spent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  )
}
