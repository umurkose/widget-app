"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { formatAmount, type Transaction } from "@/components/table/data"
import { StatusBadge } from "@/components/table/cells"
import { PanelGrid, type PanelColumn } from "@/components/table/panel-grid"
import { Sparkline, trendClass } from "@/components/table/sparkline"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export const TAB_KEYS = [
  "Overview",
  "Activity",
  "Payment",
  "Customer",
  "Usage",
  "Tags",
  "Timeline",
  "Notes",
  "Files",
  "Audit",
] as const

export type Tab = (typeof TAB_KEYS)[number]

/** Deterministic 0-99 from any string, so every derived figure is stable
 *  between server and client renders. */
function seed(value: string, salt = 0) {
  let hash = 2166136261 ^ salt
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % 100
}

function KeyValue({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-xs font-medium">{children}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex-1 rounded-md border px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium tabular-nums">{value}</p>
    </div>
  )
}

const ENDPOINTS = ["/v1/widgets", "/v1/boards", "/v1/events", "/v1/exports"]
const NOTE_AUTHORS = ["Aylin Kaya", "Mert Demirtas", "Selin Aydin"]
const num = (value: React.ReactNode) => (
  <span className="tabular-nums">{value}</span>
)

export function TabPanel({
  tab,
  row,
  related,
}: {
  tab: Tab
  row: Transaction
  related: Transaction[]
}) {
  const total = row.activity.reduce((sum, v) => sum + v, 0)

  switch (tab) {
    case "Overview": {
      type Signal = { name: string; value: string; weight: number; kind: string }
      const signals: Signal[] = [
        {
          name: "Risk score",
          value: `${seed(row.id, 3)}/100`,
          weight: seed(row.id, 3),
          kind: "Fraud",
        },
        {
          name: "API calls (8h)",
          value: String(total),
          weight: total,
          kind: "Usage",
        },
        {
          name: "Quota used",
          value: `${row.usage}%`,
          weight: row.usage,
          kind: "Usage",
        },
        {
          name: "Auto-renew",
          value: row.autoRenew ? "On" : "Off",
          weight: row.autoRenew ? 1 : 0,
          kind: "Billing",
        },
        {
          name: "Disputes",
          value: row.status === "Failed" ? "1 open" : "None",
          weight: row.status === "Failed" ? 1 : 0,
          kind: "Fraud",
        },
      ]
      const columns: PanelColumn<Signal>[] = [
        {
          key: "name",
          header: "Signal",
          cell: (s) => s.name,
          sortValue: (s) => s.name,
          searchValue: (s) => s.name,
        },
        {
          key: "kind",
          header: "Kind",
          optional: true,
          className: "text-muted-foreground",
          cell: (s) => s.kind,
          sortValue: (s) => s.kind,
          searchValue: (s) => s.kind,
        },
        {
          key: "value",
          header: "Value",
          align: "right",
          cell: (s) => num(s.value),
          sortValue: (s) => s.weight,
          searchValue: (s) => s.value,
        },
      ]
      return (
        <div>
          <div className="flex gap-2 pb-1">
            <Stat label="Amount" value={formatAmount(row.amount, row.currency)} />
            <Stat label="Usage" value={`${row.usage}%`} />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <KeyValue label="Status">
                <StatusBadge status={row.status} />
              </KeyValue>
              <KeyValue label="Method">
                {row.method.brand} ••{row.method.last4}
              </KeyValue>
              <KeyValue label="Role">{row.role}</KeyValue>
              <KeyValue label="Last active">{row.lastActive}</KeyValue>
            </div>
            <div>
              <PanelGrid
                rows={signals}
                columns={columns}
                filters={[
                  { key: "fraud", label: "Fraud", test: (s) => s.kind === "Fraud" },
                  { key: "usage", label: "Usage", test: (s) => s.kind === "Usage" },
                  {
                    key: "billing",
                    label: "Billing",
                    test: (s) => s.kind === "Billing",
                  },
                ]}
                caption={`Scored at ${row.lastActive}`}
              />
            </div>
          </div>
        </div>
      )
    }

    case "Activity": {
      type Bucket = { window: string; calls: number; delta: number; hour: number }
      const buckets: Bucket[] = row.activity.map((calls, i) => ({
        window: `${8 - i}h ago`,
        calls,
        delta: i === 0 ? 0 : calls - row.activity[i - 1],
        hour: 8 - i,
      }))
      const columns: PanelColumn<Bucket>[] = [
        {
          key: "window",
          header: "Window",
          className: "text-muted-foreground",
          cell: (b) => b.window,
          sortValue: (b) => -b.hour,
          searchValue: (b) => b.window,
        },
        {
          key: "calls",
          header: "Calls",
          cell: (b) => num(b.calls),
          sortValue: (b) => b.calls,
          searchValue: (b) => String(b.calls),
        },
        {
          key: "delta",
          header: "Δ",
          align: "right",
          optional: true,
          cell: (b) => (
            <span
              className={cn(
                "tabular-nums",
                b.delta > 0 && "text-green-600 dark:text-green-500",
                b.delta < 0 && "text-destructive"
              )}
            >
              {b.delta > 0 ? "+" : ""}
              {b.delta}
            </span>
          ),
          sortValue: (b) => b.delta,
          searchValue: (b) => String(b.delta),
        },
      ]
      return (
        <div>
          <Sparkline
            data={row.activity}
            className={cn("h-12 w-full", trendClass(row.activity))}
          />
          <div className="flex gap-2 pt-2 pb-1">
            <Stat label="Peak" value={Math.max(...row.activity)} />
            <Stat label="Total" value={total} />
            <Stat label="Avg" value={Math.round(total / row.activity.length)} />
          </div>
          <PanelGrid
            rows={buckets}
            columns={columns}
            filters={[
              { key: "up", label: "Rising", test: (b) => b.delta > 0 },
              { key: "down", label: "Falling", test: (b) => b.delta < 0 },
            ]}
            caption="Rolling 8-hour window"
          />
        </div>
      )
    }

    case "Payment": {
      type Attempt = {
        step: string
        amount: number
        result: string
        gateway: string
      }
      const settled = row.status === "Paid"
      const attempts: Attempt[] = [
        {
          step: "Authorization",
          amount: row.amount,
          result: row.status,
          gateway: row.method.brand,
        },
        {
          step: "Capture",
          amount: row.amount,
          result: settled ? "Paid" : "Pending",
          gateway: row.method.brand,
        },
        {
          step: "Fee",
          amount: -Math.abs(Math.round(row.amount * 0.029)),
          result: "Applied",
          gateway: "Widget Pay",
        },
        {
          step: "Settlement",
          amount: settled ? row.amount : 0,
          result: settled ? "Paid" : "—",
          gateway: "Payout batch",
        },
      ]
      const columns: PanelColumn<Attempt>[] = [
        {
          key: "step",
          header: "Step",
          cell: (a) => a.step,
          sortValue: (a) => a.step,
          searchValue: (a) => a.step,
        },
        {
          key: "gateway",
          header: "Gateway",
          optional: true,
          className: "text-muted-foreground",
          cell: (a) => a.gateway,
          sortValue: (a) => a.gateway,
          searchValue: (a) => a.gateway,
        },
        {
          key: "amount",
          header: "Amount",
          align: "right",
          cell: (a) => (
            <span
              className={cn("tabular-nums", a.amount < 0 && "text-destructive")}
            >
              {formatAmount(a.amount, row.currency)}
            </span>
          ),
          sortValue: (a) => a.amount,
          searchValue: (a) => String(a.amount),
        },
        {
          key: "result",
          header: "Result",
          align: "right",
          optional: true,
          className: "text-muted-foreground",
          cell: (a) => a.result,
          sortValue: (a) => a.result,
          searchValue: (a) => a.result,
        },
      ]
      return (
        <div className="flex flex-col gap-3">
          <div>
            <KeyValue label="Brand">{row.method.brand}</KeyValue>
            <KeyValue label="Card">•••• {row.method.last4}</KeyValue>
            <KeyValue label="Currency">{row.currency}</KeyValue>
            <KeyValue label="Auto-renew">{row.autoRenew ? "On" : "Off"}</KeyValue>
          </div>
          <div>
            <PanelGrid
              rows={attempts}
              columns={columns}
              filters={[
                { key: "open", label: "Unsettled", test: (a) => a.result !== "Paid" },
                { key: "money", label: "Money moved", test: (a) => a.amount !== 0 },
              ]}
              caption={`Processor: ${row.method.brand}`}
            />
            <div className="flex gap-2 pt-3">
              <Button size="sm" variant="outline" className="flex-1">
                Refund
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Receipt
              </Button>
            </div>
          </div>
        </div>
      )
    }

    case "Customer": {
      const columns: PanelColumn<Transaction>[] = [
        {
          key: "id",
          header: "ID",
          className: "font-mono text-[11px]",
          cell: (r) => r.id,
          sortValue: (r) => r.id,
          searchValue: (r) => r.id,
        },
        {
          key: "status",
          header: "Status",
          cell: (r) => <StatusBadge status={r.status} />,
          sortValue: (r) => r.status,
          searchValue: (r) => r.status,
        },
        {
          key: "method",
          header: "Method",
          optional: true,
          className: "text-muted-foreground",
          cell: (r) => `${r.method.brand} ••${r.method.last4}`,
          sortValue: (r) => r.method.brand,
          searchValue: (r) => `${r.method.brand} ${r.method.last4}`,
        },
        {
          key: "amount",
          header: "Amount",
          align: "right",
          cell: (r) => (
            <span
              className={cn("tabular-nums", r.amount < 0 && "text-destructive")}
            >
              {formatAmount(r.amount, r.currency)}
            </span>
          ),
          sortValue: (r) => r.amount,
          searchValue: (r) => String(r.amount),
        },
      ]
      return (
        <div className="flex flex-col gap-3">
          <div>
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
            <KeyValue label="Role">{row.role}</KeyValue>
            <KeyValue label="Verified">{row.verified ? "Yes" : "No"}</KeyValue>
            <KeyValue label="Lifetime value">
              {num(
                formatAmount(
                  related.reduce((sum, r) => sum + r.amount, row.amount),
                  row.currency
                )
              )}
            </KeyValue>
          </div>
          <div>
            <PanelGrid
              rows={related}
              columns={columns}
              filters={[
                { key: "paid", label: "Paid", test: (r) => r.status === "Paid" },
                {
                  key: "problem",
                  label: "Needs attention",
                  test: (r) => r.status === "Failed" || r.status === "Pending",
                },
                { key: "out", label: "Outgoing", test: (r) => r.amount < 0 },
              ]}
              empty="This is the only transaction on file."
              caption={`${related.length} more from ${row.user.email}`}
            />
          </div>
        </div>
      )
    }

    case "Usage": {
      type Endpoint = { endpoint: string; calls: number; share: number; p95: number }
      const weights = ENDPOINTS.map((endpoint, i) => 10 + seed(row.id + endpoint, i))
      const weightTotal = weights.reduce((sum, w) => sum + w, 0)
      const endpoints: Endpoint[] = ENDPOINTS.map((endpoint, i) => ({
        endpoint,
        calls: weights[i] * 37,
        share: Math.round((weights[i] / weightTotal) * 100),
        p95: 40 + seed(endpoint + row.id, i + 9),
      }))
      const columns: PanelColumn<Endpoint>[] = [
        {
          key: "endpoint",
          header: "Endpoint",
          className: "font-mono text-[11px]",
          cell: (e) => e.endpoint,
          sortValue: (e) => e.endpoint,
          searchValue: (e) => e.endpoint,
        },
        {
          key: "calls",
          header: "Calls",
          cell: (e) => num(e.calls),
          sortValue: (e) => e.calls,
          searchValue: (e) => String(e.calls),
        },
        {
          key: "p95",
          header: "p95",
          optional: true,
          className: "text-muted-foreground",
          cell: (e) => num(`${e.p95}ms`),
          sortValue: (e) => e.p95,
          searchValue: (e) => String(e.p95),
        },
        {
          key: "share",
          header: "Share",
          align: "right",
          cell: (e) => num(`${e.share}%`),
          sortValue: (e) => e.share,
          searchValue: (e) => String(e.share),
        },
      ]
      return (
        <div className="flex flex-col gap-3">
          <div className="pb-2">
            <div className="flex items-center justify-between gap-2 py-1.5">
              <span className="text-xs text-muted-foreground">Quota</span>
              <span className="text-xs font-medium tabular-nums">
                {row.usage}% of 100k
              </span>
            </div>
            <Progress value={row.usage} />
          </div>
          <div>
            <PanelGrid
              rows={endpoints}
              columns={columns}
              filters={[
                { key: "hot", label: "Top share", test: (e) => e.share >= 25 },
                { key: "slow", label: "Slow p95", test: (e) => e.p95 > 90 },
              ]}
              caption="Last 24 hours"
            />
          </div>
        </div>
      )
    }

    case "Tags": {
      type TagRow = { tag: string; source: string; when: string }
      const tagRows: TagRow[] = row.tags.map((tag, i) => ({
        tag,
        source: i % 2 === 0 ? "Automation" : "Manual",
        when: row.lastActive,
      }))
      const columns: PanelColumn<TagRow>[] = [
        {
          key: "tag",
          header: "Tag",
          cell: (t) => <Badge variant="secondary">{t.tag}</Badge>,
          sortValue: (t) => t.tag,
          searchValue: (t) => t.tag,
        },
        {
          key: "source",
          header: "Source",
          className: "text-muted-foreground",
          cell: (t) => t.source,
          sortValue: (t) => t.source,
          searchValue: (t) => t.source,
        },
        {
          key: "when",
          header: "When",
          align: "right",
          optional: true,
          className: "text-muted-foreground",
          cell: (t) => t.when,
          sortValue: (t) => t.when,
          searchValue: (t) => t.when,
        },
      ]
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1 py-1.5">
            {row.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div>
            <PanelGrid
              rows={tagRows}
              columns={columns}
              filters={[
                {
                  key: "auto",
                  label: "Automation",
                  test: (t) => t.source === "Automation",
                },
                { key: "manual", label: "Manual", test: (t) => t.source === "Manual" },
              ]}
            />
          </div>
        </div>
      )
    }

    case "Timeline": {
      const settled = row.status === "Paid"
      const events = [
        { label: "Created", detail: "via checkout", when: row.lastActive },
        { label: "Authorized", detail: row.method.brand, when: row.lastActive },
        {
          label: "Captured",
          detail: settled ? "full amount" : "pending",
          when: settled ? row.lastActive : "—",
        },
        {
          label: "Settled",
          detail: settled ? "payout batch" : "not settled",
          when: settled ? row.lastActive : "—",
        },
      ]
      return (
        <ol className="relative border-l pt-1 pl-4">
          {events.map((event) => (
            <li key={event.label} className="pb-4 last:pb-1">
              <span
                aria-hidden
                className="absolute -left-[3px] mt-1.5 size-1.5 rounded-full bg-muted-foreground"
              />
              <p className="text-xs font-medium">{event.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {event.detail} · {event.when}
              </p>
            </li>
          ))}
        </ol>
      )
    }

    case "Notes": {
      const notes = [
        {
          author: NOTE_AUTHORS[seed(row.id, 1) % NOTE_AUTHORS.length],
          body: `Checked ${row.id} against the ledger — amounts match the processor report.`,
          when: row.lastActive,
        },
        {
          author: NOTE_AUTHORS[seed(row.id, 2) % NOTE_AUTHORS.length],
          body:
            row.status === "Failed"
              ? "Card issuer declined; asked the customer for another method."
              : "Customer confirmed the charge over email.",
          when: "Yesterday 09:12",
        },
      ]
      return (
        <div className="flex flex-col gap-3">
          {notes.map((note, i) => (
            <div key={i} className="rounded-md border p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{note.author}</span>
                <span className="text-[10px] text-muted-foreground">
                  {note.when}
                </span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">{note.body}</p>
            </div>
          ))}
          <Button size="sm" variant="outline">
            Add note
          </Button>
        </div>
      )
    }

    case "Files": {
      type FileRow = { name: string; kind: string; kb: number; by: string }
      const files: FileRow[] = [
        {
          name: `${row.id}-receipt.pdf`,
          kind: "Receipt",
          kb: 40 + seed(row.id, 5),
          by: "System",
        },
        {
          name: `INV-${row.id.slice(3)}.pdf`,
          kind: "Invoice",
          kb: 60 + seed(row.id, 6),
          by: "Billing",
        },
        {
          name: `${row.id}-export.csv`,
          kind: "Export",
          kb: 8 + seed(row.id, 7),
          by: row.user.name,
        },
      ]
      const columns: PanelColumn<FileRow>[] = [
        {
          key: "name",
          header: "File",
          className: "font-mono text-[11px]",
          cell: (f) => f.name,
          sortValue: (f) => f.name,
          searchValue: (f) => f.name,
        },
        {
          key: "kind",
          header: "Kind",
          className: "text-muted-foreground",
          cell: (f) => f.kind,
          sortValue: (f) => f.kind,
          searchValue: (f) => f.kind,
        },
        {
          key: "by",
          header: "By",
          optional: true,
          className: "text-muted-foreground",
          cell: (f) => f.by,
          sortValue: (f) => f.by,
          searchValue: (f) => f.by,
        },
        {
          key: "kb",
          header: "Size",
          align: "right",
          cell: (f) => num(`${f.kb} KB`),
          sortValue: (f) => f.kb,
          searchValue: (f) => String(f.kb),
        },
      ]
      return (
        <div>
          <PanelGrid
            rows={files}
            columns={columns}
            filters={[
              { key: "pdf", label: "PDF", test: (f) => f.name.endsWith(".pdf") },
              { key: "csv", label: "CSV", test: (f) => f.name.endsWith(".csv") },
            ]}
            caption={`${files.length} attachments`}
          />
          <Separator className="my-3" />
          <Button size="sm" variant="outline" className="w-full">
            Upload file
          </Button>
        </div>
      )
    }

    case "Audit": {
      type Entry = { actor: string; action: string; when: string; kind: string }
      const entries: Entry[] = [
        {
          actor: row.user.name,
          action: "Opened transaction",
          when: row.lastActive,
          kind: "User",
        },
        {
          actor: "Automation",
          action: `Tagged ${row.tags[0] ?? "manual"}`,
          when: row.lastActive,
          kind: "System",
        },
        {
          actor: NOTE_AUTHORS[seed(row.id, 4) % NOTE_AUTHORS.length],
          action: row.autoRenew ? "Enabled auto-renew" : "Disabled auto-renew",
          when: "Mon 11:32",
          kind: "User",
        },
        {
          actor: "System",
          action: `Status set to ${row.status}`,
          when: "Aug 9",
          kind: "System",
        },
      ]
      const columns: PanelColumn<Entry>[] = [
        {
          key: "actor",
          header: "Actor",
          cell: (e) => e.actor,
          sortValue: (e) => e.actor,
          searchValue: (e) => e.actor,
        },
        {
          key: "action",
          header: "Action",
          className: "text-muted-foreground",
          cell: (e) => e.action,
          sortValue: (e) => e.action,
          searchValue: (e) => e.action,
        },
        {
          key: "when",
          header: "When",
          align: "right",
          optional: true,
          className: "text-muted-foreground",
          cell: (e) => e.when,
          sortValue: (e) => e.when,
          searchValue: (e) => e.when,
        },
      ]
      return (
        <PanelGrid
          rows={entries}
          columns={columns}
          filters={[
            { key: "user", label: "By people", test: (e) => e.kind === "User" },
            { key: "system", label: "By system", test: (e) => e.kind === "System" },
          ]}
          caption={`Audit trail for ${row.id}`}
        />
      )
    }
  }
}
