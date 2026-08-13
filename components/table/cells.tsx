"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Copy,
  Ellipsis,
  RotateCcw,
  UserRound,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { type Transaction, type TransactionStatus } from "@/components/table/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type SortKey =
  | "id"
  | "user"
  | "role"
  | "status"
  | "amount"
  | "method"
  | "activity"
  | "usage"
  | "tags"
  | "autoRenew"
  | "lastActive"

export type SortState = { key: SortKey; dir: "asc" | "desc" }

export function SortButton({
  label,
  sortKey,
  sort,
  onCycle,
  className,
}: {
  label: string
  sortKey: SortKey
  sort: SortState | null
  onCycle: (key: SortKey) => void
  className?: string
}) {
  const active = sort?.key === sortKey
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2.5 gap-1 px-2 font-medium", className)}
      onClick={() => onCycle(sortKey)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className={cn("size-3", !active && "text-muted-foreground")} />
    </Button>
  )
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "Failed") {
    return <Badge variant="destructive">Failed</Badge>
  }
  if (status === "Paid") {
    return <Badge variant="secondary">Paid</Badge>
  }
  return (
    <Badge
      variant="outline"
      className={cn(status === "Refunded" && "text-muted-foreground")}
    >
      {status}
    </Badge>
  )
}

export function TagsCell({ tags }: { tags: string[] }) {
  const visible = tags.slice(0, 2)
  const extra = tags.length - visible.length
  return (
    <div className="flex items-center gap-1">
      {visible.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
      {extra > 0 && (
        <Badge variant="outline" className="text-muted-foreground">
          +{extra}
        </Badge>
      )}
    </div>
  )
}

export function RowActions({ row }: { row: Transaction }) {
  const [copied, setCopied] = React.useState(false)

  const copyId = () => {
    navigator.clipboard?.writeText(row.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${row.id}`}
          />
        }
      >
        <Ellipsis />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 gap-0.5 p-1">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={copyId}
        >
          {copied ? (
            <>
              <Check data-icon="inline-start" /> Copied
            </>
          ) : (
            <>
              <Copy data-icon="inline-start" /> Copy ID
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" className="justify-start">
          <UserRound data-icon="inline-start" /> View user
        </Button>
        <Button variant="ghost" size="sm" className="justify-start">
          <RotateCcw data-icon="inline-start" /> Refund
        </Button>
      </PopoverContent>
    </Popover>
  )
}
