"use client"

import { CreditCard } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  matchesFilters,
  useFilters,
  type RowMeta,
} from "@/components/widget/filters"
import { WidgetShell } from "@/components/widget/widget-shell"

const PAYMENTS: {
  merchant: string
  method: string
  ref: string
  amount: string
  direction: "in" | "out"
  time: string
  meta: RowMeta
}[] = [
  {
    merchant: "Stripe Payout",
    method: "SEPA ••9034",
    ref: "#TX-90412",
    amount: "+$3,500.00",
    direction: "in",
    time: "14:32",
    meta: { when: "today", status: "success", source: "payments" },
  },
  {
    merchant: "AWS Marketplace",
    method: "Visa ••4242",
    ref: "#TX-90398",
    amount: "-$1,240.00",
    direction: "out",
    time: "12:08",
    meta: { when: "today", status: "success", source: "payments" },
  },
  {
    merchant: "Orbit Hosting",
    method: "Visa ••4242 · Declined",
    ref: "#TX-90390",
    amount: "-$96.00",
    direction: "out",
    time: "09:51",
    meta: { when: "today", status: "failed", source: "payments" },
  },
  {
    merchant: "Acme Consulting LLC",
    method: "SEPA ••9034",
    ref: "#TX-90355",
    amount: "+$820.50",
    direction: "in",
    time: "Yesterday 18:04",
    meta: { when: "yesterday", status: "success", source: "payments" },
  },
  {
    merchant: "Figma Annual Plan",
    method: "Visa ••4242",
    ref: "#TX-90371",
    amount: "-$864.00",
    direction: "out",
    time: "Yesterday 10:44",
    meta: { when: "yesterday", status: "success", source: "payments" },
  },
  {
    merchant: "Wise Settlement",
    method: "SEPA ••9034 · Processing",
    ref: "#TX-90322",
    amount: "+$2,120.00",
    direction: "in",
    time: "Mon 09:12",
    meta: { when: "week", status: "pending", source: "payments" },
  },
  {
    merchant: "Datadog Cloud",
    method: "Amex ••8801",
    ref: "#TX-90340",
    amount: "-$412.75",
    direction: "out",
    time: "Sun 16:40",
    meta: { when: "week", status: "success", source: "payments" },
  },
  {
    merchant: "Notion Team Plan",
    method: "Visa ••4242",
    ref: "#TX-90287",
    amount: "-$240.00",
    direction: "out",
    time: "Aug 1",
    meta: { when: "older", status: "success", source: "payments" },
  },
]

export function PaymentLogsWidget({ compact }: { compact?: boolean }) {
  const filters = useFilters()
  const visible = PAYMENTS.filter((r) => matchesFilters(r.meta, filters)).slice(
    0,
    5
  )

  if (compact) {
    const latest = visible[0]
    return (
      <WidgetShell title="Payments" icon={CreditCard} compact>
        {latest ? (
          <div className="flex flex-1 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs leading-4 font-medium text-foreground">
                {latest.merchant}
              </p>
              <p className="truncate text-[10px] leading-4 text-muted-foreground">
                {latest.method} ·{" "}
                <span className="font-semibold text-primary">{latest.ref}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "text-xs leading-4 font-semibold tabular-nums",
                  latest.direction === "in"
                    ? "text-primary"
                    : "text-destructive"
                )}
              >
                {latest.amount}
              </p>
              <p className="text-[10px] leading-4 text-muted-foreground tabular-nums">
                {latest.time}
              </p>
            </div>
          </div>
        ) : (
          <p className="flex-1 text-xs text-muted-foreground">No matches</p>
        )}
      </WidgetShell>
    )
  }

  return (
    <WidgetShell
      title="Payments"
      icon={CreditCard}
      accessory={`${visible.length} of ${PAYMENTS.length}`}
    >
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
          No entries match the filters.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border/40">
          {visible.map((payment) => (
            <li
              key={payment.ref}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs leading-4 font-medium text-foreground">
                  {payment.merchant}
                </p>
                <p className="truncate text-[10px] leading-4 text-muted-foreground">
                  {payment.method} ·{" "}
                  <span className="font-semibold text-primary">
                    {payment.ref}
                  </span>
                </p>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <p
                  className={cn(
                    "text-xs leading-4 font-semibold",
                    payment.direction === "in"
                      ? "text-primary"
                      : "text-destructive"
                  )}
                >
                  {payment.amount}
                </p>
                <p className="text-[10px] leading-4 text-muted-foreground">
                  {payment.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}
