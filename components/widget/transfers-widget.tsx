"use client"

import { ArrowLeftRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  matchesFilters,
  useFilters,
  type RowMeta,
} from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

const TRANSFERS: {
  beneficiary: string
  iban: string
  ref: string
  time: string
  amount: string
  status: string
  meta: RowMeta
}[] = [
  {
    beneficiary: "Aylin Kaya",
    iban: "TR•• 9034",
    ref: "#TR-2210",
    time: "14:32",
    amount: "$12,400.00",
    status: "Awaiting approval",
    meta: { when: "today", status: "pending", source: "payments" },
  },
  {
    beneficiary: "Vertex Supplies Ltd",
    iban: "TR•• 5517",
    ref: "#TR-2211",
    time: "11:20",
    amount: "$2,650.00",
    status: "In review",
    meta: { when: "today", status: "pending", source: "payments" },
  },
  {
    beneficiary: "M. Demirtas",
    iban: "TR•• 2286",
    ref: "#TR-2214",
    time: "09:05",
    amount: "$1,470.50",
    status: "Scheduled",
    meta: { when: "today", status: "pending", source: "payments" },
  },
  {
    beneficiary: "Baltic Freight OÜ",
    iban: "TR•• 6109",
    ref: "#TR-2208",
    time: "Yesterday 18:04",
    amount: "$780.00",
    status: "Declined",
    meta: { when: "yesterday", status: "failed", source: "payments" },
  },
  {
    beneficiary: "Nordwind GmbH",
    iban: "TR•• 7742",
    ref: "#TR-2216",
    time: "Yesterday 10:12",
    amount: "$940.00",
    status: "On hold",
    meta: { when: "yesterday", status: "pending", source: "payments" },
  },
  {
    beneficiary: "Selin Aydin",
    iban: "TR•• 3358",
    ref: "#TR-2201",
    time: "Mon 09:12",
    amount: "$3,300.00",
    status: "Completed",
    meta: { when: "week", status: "success", source: "payments" },
  },
  {
    beneficiary: "Corelab BV",
    iban: "TR•• 8804",
    ref: "#TR-2195",
    time: "Sun 15:47",
    amount: "$5,120.00",
    status: "Completed",
    meta: { when: "week", status: "success", source: "payments" },
  },
  {
    beneficiary: "Helix Studio",
    iban: "TR•• 1290",
    ref: "#TR-2180",
    time: "Aug 1",
    amount: "$610.00",
    status: "Completed",
    meta: { when: "older", status: "success", source: "payments" },
  },
]

function amountValue(amount: string): number {
  return Number(amount.replace(/[$,]/g, ""))
}

export function TransfersWidget({ compact }: { compact?: boolean }) {
  const filters = useFilters()
  const visible = TRANSFERS.filter((r) =>
    matchesFilters(r.meta, filters)
  ).slice(0, 4)
  const pendingCount = visible.filter(
    (r) => r.meta.status === "pending"
  ).length
  const totalQueued = visible
    .filter((r) => r.meta.status === "pending")
    .reduce((sum, r) => sum + amountValue(r.amount), 0)

  if (compact) {
    const latest = visible[0]
    return (
      <WidgetShell
        title="Transfers"
        icon={ArrowLeftRight}
        accessory={`${pendingCount} pending`}
        compact
      >
        {latest ? (
          <div className="flex flex-1 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs leading-4 font-medium text-foreground">
                {latest.beneficiary}
              </p>
              <p className="truncate text-[10px] leading-4 text-muted-foreground">
                {latest.status}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-right text-xs leading-4 font-semibold tabular-nums",
                latest.meta.status === "failed"
                  ? "text-destructive"
                  : "text-primary"
              )}
            >
              {latest.amount}
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
      title="Transfers"
      icon={ArrowLeftRight}
      accessory={`${pendingCount} pending`}
    >
      <div className="flex items-center justify-between pb-1.5 text-xs text-muted-foreground">
        <span>Total queued</span>
        <span className="font-semibold text-primary tabular-nums">
          {totalQueued.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
          No entries match the filters.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border/40">
          {visible.map((transfer) => (
            <li
              key={transfer.ref}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs leading-4 font-medium text-foreground">
                  {transfer.beneficiary}
                </p>
                <p className="truncate text-[10px] leading-4 text-muted-foreground">
                  {transfer.iban} ·{" "}
                  <span className="font-semibold text-primary">
                    {transfer.ref}
                  </span>{" "}
                  · {transfer.time}
                </p>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <p
                  className={cn(
                    "text-xs leading-4 font-semibold",
                    transfer.meta.status === "failed"
                      ? "text-destructive"
                      : "text-primary"
                  )}
                >
                  {transfer.amount}
                </p>
                <p className="text-[10px] leading-4 text-muted-foreground">
                  {transfer.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}
