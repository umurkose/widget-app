"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  Activity,
  CircleUser,
  Clock,
  CreditCard,
  Gauge,
  Info,
  Paperclip,
  ShieldCheck,
  StickyNote,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { formatAmount, type Transaction } from "@/components/table/data"
import { StatusBadge } from "@/components/table/cells"
import { Sparkline, trendClass } from "@/components/table/sparkline"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"

const PANEL_WIDTH = 340

const TABS = [
  { key: "Overview", icon: Info },
  { key: "Activity", icon: Activity },
  { key: "Payment", icon: CreditCard },
  { key: "Customer", icon: CircleUser },
  { key: "Usage", icon: Gauge },
  { key: "Tags", icon: Tag },
  { key: "Timeline", icon: Clock },
  { key: "Notes", icon: StickyNote },
  { key: "Files", icon: Paperclip },
  { key: "Audit", icon: ShieldCheck },
] as const satisfies readonly { key: string; icon: LucideIcon }[]

type Tab = (typeof TABS)[number]["key"]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-xs font-medium">{children}</span>
    </div>
  )
}

function TabPanel({ tab, row }: { tab: Tab; row: Transaction }) {
  switch (tab) {
    case "Overview":
      return (
        <>
          <Row label="Status">
            <StatusBadge status={row.status} />
          </Row>
          <Row label="Amount">
            <span
              className={cn("tabular-nums", row.amount < 0 && "text-destructive")}
            >
              {formatAmount(row.amount, row.currency)}
            </span>
          </Row>
          <Row label="Method">
            {row.method.brand} ••{row.method.last4}
          </Row>
          <Row label="Last active">{row.lastActive}</Row>
        </>
      )
    case "Activity":
      return (
        <>
          <Sparkline
            data={row.activity}
            className={cn("h-10 w-full", trendClass(row.activity))}
          />
          <Row label="Peak">{Math.max(...row.activity)} calls</Row>
          <Row label="Average">
            {Math.round(
              row.activity.reduce((sum, v) => sum + v, 0) / row.activity.length
            )}{" "}
            calls
          </Row>
        </>
      )
    case "Payment":
      return (
        <>
          <Row label="Brand">{row.method.brand}</Row>
          <Row label="Card">•••• {row.method.last4}</Row>
          <Row label="Currency">{row.currency}</Row>
          <Row label="Auto-renew">{row.autoRenew ? "On" : "Off"}</Row>
        </>
      )
    case "Customer":
      return (
        <>
          <div className="flex items-center gap-2 py-1.5">
            <Avatar size="sm">
              <AvatarFallback>{row.user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{row.user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {row.user.email}
              </p>
            </div>
          </div>
          <Row label="Role">{row.role}</Row>
          <Row label="Verified">{row.verified ? "Yes" : "No"}</Row>
        </>
      )
    case "Usage":
      return (
        <>
          <div className="py-1.5">
            <Progress value={row.usage} />
          </div>
          <Row label="Quota used">{row.usage}%</Row>
          <Row label="Plan limit">100k calls</Row>
        </>
      )
    case "Tags":
      return (
        <div className="flex flex-wrap gap-1 py-1.5">
          {row.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )
    case "Timeline":
      return (
        <>
          <Row label="Created">{row.lastActive}</Row>
          <Row label="Authorized">{row.lastActive}</Row>
          <Row label="Settled">
            {row.status === "Paid" ? row.lastActive : "—"}
          </Row>
        </>
      )
    case "Notes":
      return (
        <p className="py-1.5 text-xs text-muted-foreground">
          No notes on {row.id} yet. Anyone with editor access can leave one.
        </p>
      )
    case "Files":
      return (
        <>
          <Row label="Receipt">{row.id}.pdf</Row>
          <Row label="Invoice">INV-{row.id.slice(3)}.pdf</Row>
        </>
      )
    case "Audit":
      return (
        <>
          <Row label="Opened by">{row.user.name}</Row>
          <Row label="Source">{row.tags[0] ?? "manual"}</Row>
          <Row label="Reference">{row.id}</Row>
        </>
      )
  }
}

export function RowDetailPanel({
  row,
  onClose,
}: {
  row: Transaction | null
  onClose: () => void
}) {
  const reducedMotion = useReducedMotion()
  const [tab, setTab] = React.useState<Tab>("Overview")
  const [shownId, setShownId] = React.useState(row?.id)

  // Every row opens on its own terms — start each one at the summary.
  if (row && row.id !== shownId) {
    setShownId(row.id)
    setTab("Overview")
  }

  // Esc closes the panel, unless a dialog or popover owns the key first.
  React.useEffect(() => {
    if (!row) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
      onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [row, onClose])

  return (
    <AnimatePresence initial={false}>
      {row && (
        <motion.aside
          key="row-detail"
          aria-label={`Details for ${row.id}`}
          initial={{ width: 0 }}
          animate={{ width: PANEL_WIDTH }}
          exit={{ width: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", bounce: 0, duration: 0.4 }
          }
          className="shrink-0 overflow-hidden border-l bg-background"
        >
          {/* Fixed width so the content never reflows while the panel moves. */}
          <div
            className="flex h-full flex-col"
            style={{ width: PANEL_WIDTH }}
          >
            {/* Same padding and control size as the page header so both
                bottom borders land on one line. */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close details"
                onClick={onClose}
              >
                <X />
              </Button>
              <span className="flex items-center gap-1.5 pr-1 text-xs text-muted-foreground">
                <Kbd>Esc</Kbd> to close
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <p className="font-mono text-xs text-muted-foreground">{row.id}</p>
              <p className="truncate text-sm font-medium">{row.user.name}</p>
              <div className="mt-3 flex flex-wrap content-start items-start gap-1">
                {TABS.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={tab === key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "flex h-6 shrink-0 items-center gap-1 rounded-(--radius-control) px-1.5 text-[11px] leading-none font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      tab === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon aria-hidden className="size-3 shrink-0" />
                    {key}
                  </button>
                ))}
              </div>
              <div className="mt-3 divide-y border-t pt-1">
                <TabPanel tab={tab} row={row} />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
