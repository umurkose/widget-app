"use client"

import { Bug, SearchX } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  matchesFilters,
  useFilters,
  type RowMeta,
} from "@/components/widget/filters"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { WidgetShell } from "@/components/widget/widget-shell"

const LOGS: {
  level: "ERR" | "WARN"
  code: string
  message: string
  service: string
  time: string
  meta: RowMeta
}[] = [
  {
    level: "ERR",
    code: "E5021",
    message: "TypeError: cannot read prop",
    service: "api",
    time: "4m",
    meta: { when: "today", status: "failed", source: "api" },
  },
  {
    level: "ERR",
    code: "E5107",
    message: "Timeout: payments-svc 5000ms",
    service: "payments",
    time: "12m",
    meta: { when: "today", status: "failed", source: "api" },
  },
  {
    level: "WARN",
    code: "W2210",
    message: "Deprecated: /v1/auth login",
    service: "auth",
    time: "26m",
    meta: { when: "today", status: "success", source: "api" },
  },
  {
    level: "WARN",
    code: "W1183",
    message: "Retry queue depth > 500",
    service: "jobs",
    time: "48m",
    meta: { when: "today", status: "pending", source: "api" },
  },
  {
    level: "ERR",
    code: "E4419",
    message: "ECONNRESET pool exhausted",
    service: "db",
    time: "Yesterday 18:04",
    meta: { when: "yesterday", status: "failed", source: "api" },
  },
  {
    level: "WARN",
    code: "W2045",
    message: "Cache hit rate < 60%",
    service: "cache",
    time: "Yesterday 07:31",
    meta: { when: "yesterday", status: "success", source: "api" },
  },
  {
    level: "ERR",
    code: "E5310",
    message: "OOM: worker restarted",
    service: "jobs",
    time: "Mon 09:12",
    meta: { when: "week", status: "failed", source: "api" },
  },
  {
    level: "WARN",
    code: "W1920",
    message: "Slow query 1.4s on orders",
    service: "db",
    time: "Aug 1",
    meta: { when: "older", status: "success", source: "api" },
  },
]

export function ErrorLogsWidget({ compact }: { compact?: boolean }) {
  const filters = useFilters()
  const visible = LOGS.filter((r) => matchesFilters(r.meta, filters)).slice(
    0,
    5
  )

  if (compact) {
    const latest = visible[0]
    return (
      <WidgetShell title="Error log" icon={Bug} compact>
        {latest ? (
          <div className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "w-10 shrink-0 text-[10px] font-semibold",
                latest.level === "ERR"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {latest.level}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs">
              <span className="font-semibold text-primary">{latest.code}</span>{" "}
              {latest.message}
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {latest.service} · {latest.time}
            </span>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-1.5 text-muted-foreground">
            <SearchX aria-hidden className="size-3.5" />
            <span className="text-xs">No results</span>
          </div>
        )}
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      title="Error log"
      icon={Bug}
      accessory={`${visible.length} of ${LOGS.length}`}
    >
      {visible.length === 0 ? (
        <Empty className="flex-1 gap-1 p-4">
          <EmptyHeader className="gap-1">
            <EmptyMedia variant="icon" className="mb-0">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle className="text-xs">No results</EmptyTitle>
            <EmptyDescription className="text-xs">
              Nothing matches the current filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-border/40">
          {visible.map((log) => (
            <li
              key={log.code}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <span
                className={cn(
                  "w-10 shrink-0 text-[10px] font-semibold",
                  log.level === "ERR"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {log.level}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs">
                <span className="font-semibold text-primary">{log.code}</span>{" "}
                {log.message}
              </span>
              <span className="shrink-0 text-right text-[10px] leading-4 text-muted-foreground">
                {log.service}
                <br />
                {log.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}
