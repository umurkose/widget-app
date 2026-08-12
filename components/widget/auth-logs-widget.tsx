"use client"

import { KeyRound, LogIn, ShieldAlert, UserPlus, SearchX } from "lucide-react"

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

const EVENTS: {
  icon: typeof LogIn
  user: string
  detail: string
  time: string
  meta: RowMeta
}[] = [
  {
    icon: LogIn,
    user: "m.yilmaz@acme.co",
    detail: "Signed in via SSO · 192.168.4.20",
    time: "2m",
    meta: { when: "today", status: "success", source: "auth" },
  },
  {
    icon: ShieldAlert,
    user: "j.chen@vertex.dev",
    detail: "2FA failed · 3rd attempt",
    time: "9m",
    meta: { when: "today", status: "failed", source: "auth" },
  },
  {
    icon: UserPlus,
    user: "s.demir@nova.io",
    detail: "Account created · invite link",
    time: "14m",
    meta: { when: "today", status: "success", source: "auth" },
  },
  {
    icon: KeyRound,
    user: "o.brandt@helix.gg",
    detail: "Password reset · awaiting confirmation",
    time: "Yesterday 18:04",
    meta: { when: "yesterday", status: "pending", source: "auth" },
  },
  {
    icon: LogIn,
    user: "r.silva@corelab.io",
    detail: "Signed in via passkey · 10.0.8.113",
    time: "Yesterday 09:26",
    meta: { when: "yesterday", status: "success", source: "auth" },
  },
  {
    icon: ShieldAlert,
    user: "k.novak@arclight.ai",
    detail: "2FA failed · account locked",
    time: "Mon 09:12",
    meta: { when: "week", status: "failed", source: "auth" },
  },
  {
    icon: LogIn,
    user: "t.walsh@quantfold.com",
    detail: "Signed in via SSO · 172.16.2.9",
    time: "Sun 15:47",
    meta: { when: "week", status: "success", source: "auth" },
  },
  {
    icon: KeyRound,
    user: "e.tanaka@kite.jp",
    detail: "Password reset · email link",
    time: "Aug 1",
    meta: { when: "older", status: "success", source: "auth" },
  },
]

export function AuthLogsWidget({ compact }: { compact?: boolean }) {
  const filters = useFilters()
  const visible = EVENTS.filter((r) => matchesFilters(r.meta, filters)).slice(
    0,
    5
  )

  if (compact) {
    const latest = visible[0]
    return (
      <WidgetShell title="Auth activity" icon={KeyRound} compact>
        {latest ? (
          <div className="flex flex-1 items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <latest.icon
                aria-hidden
                className="size-3 text-muted-foreground"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs leading-4 font-semibold text-primary">
                {latest.user}
              </p>
              <p className="truncate text-[10px] leading-4 text-muted-foreground">
                {latest.detail}
              </p>
            </div>
            <span className="shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
              {latest.time}
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
      title="Auth activity"
      icon={KeyRound}
      accessory={`${visible.length} of ${EVENTS.length}`}
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
          {visible.map((event) => (
            <li
              key={event.user}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <event.icon
                  aria-hidden
                  className="size-3 text-muted-foreground"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs leading-4 font-semibold text-primary">
                  {event.user}
                </p>
                <p className="truncate text-[10px] leading-4 text-muted-foreground">
                  {event.detail}
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
