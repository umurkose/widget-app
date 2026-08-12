"use client"

import { ScrollText } from "lucide-react"

import {
  matchesFilters,
  useFilters,
  type RowMeta,
} from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

const EVENTS: {
  actor: string
  action: string
  target: string
  time: string
  meta: RowMeta
}[] = [
  {
    actor: "a.kaya",
    action: "raised transfer limit",
    target: "limit $25K → $50K · via admin panel",
    time: "12m",
    meta: { when: "today", status: "success", source: "admin" },
  },
  {
    actor: "root",
    action: "suspended user",
    target: "user #8123 · via admin panel",
    time: "26m",
    meta: { when: "today", status: "success", source: "admin" },
  },
  {
    actor: "m.arslan",
    action: "requested role change",
    target: "role admin → owner · pending approval",
    time: "1h",
    meta: { when: "today", status: "pending", source: "admin" },
  },
  {
    actor: "d.eren",
    action: "exported KYC report",
    target: "report #KYC-1187 · 2,340 records",
    time: "Yesterday 16:20",
    meta: { when: "yesterday", status: "success", source: "admin" },
  },
  {
    actor: "s.acar",
    action: "updated webhook",
    target: "endpoint #WH-204 · payouts.events",
    time: "Yesterday 11:05",
    meta: { when: "yesterday", status: "success", source: "admin" },
  },
  {
    actor: "root",
    action: "rotated API key",
    target: "key #AK-5590 · production env",
    time: "Mon 09:12",
    meta: { when: "week", status: "success", source: "admin" },
  },
  {
    actor: "b.ozan",
    action: "pushed config rollout",
    target: "config #CF-311 · rollout failed",
    time: "Sun 15:47",
    meta: { when: "week", status: "failed", source: "admin" },
  },
  {
    actor: "a.kaya",
    action: "archived project",
    target: "project #PR-77 · sandbox env",
    time: "Aug 1",
    meta: { when: "older", status: "success", source: "admin" },
  },
]

export function AuditLogWidget({ compact }: { compact?: boolean }) {
  const filters = useFilters()
  const visible = EVENTS.filter((r) => matchesFilters(r.meta, filters)).slice(
    0,
    5
  )

  if (compact) {
    const latest = visible[0]
    return (
      <WidgetShell title="Audit log" icon={ScrollText} compact>
        {latest ? (
          <div className="flex flex-1 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs leading-4 text-foreground">
                <span className="font-semibold text-primary">
                  {latest.actor}
                </span>{" "}
                {latest.action}
              </p>
              <p className="truncate text-[10px] leading-4 text-muted-foreground">
                {latest.target}
              </p>
            </div>
            <span className="shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
              {latest.time}
            </span>
          </div>
        ) : (
          <p className="flex-1 text-xs text-muted-foreground">No matches</p>
        )}
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      title="Audit log"
      icon={ScrollText}
      accessory={`${visible.length} of ${EVENTS.length}`}
    >
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
          No entries match the filters.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border/40">
          {visible.map((event) => (
            <li
              key={event.target}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs leading-4 text-foreground">
                  <span className="font-semibold text-primary">
                    {event.actor}
                  </span>{" "}
                  {event.action}
                </p>
                <p className="truncate text-[10px] leading-4 text-muted-foreground">
                  {event.target}
                </p>
              </div>
              <span className="shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
                {event.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}
