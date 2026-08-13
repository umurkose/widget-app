"use client"

import * as React from "react"
import {
  Archive,
  ArrowUpRight,
  BadgeCheck,
  Columns3,
  CreditCard,
  Eye,
  FileSpreadsheet,
  Landmark,
  ListFilter,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SquarePen,
  Trash2,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { type CardBrand, type TransactionRole } from "@/components/table/data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ColumnVisibility = {
  activity: boolean
  usage: boolean
  tags: boolean
}

export type TableFilters = {
  role: "all" | TransactionRole
  method: "all" | CardBrand
  autoRenew: boolean
  verified: boolean
  negative: boolean
}

export const DEFAULT_TABLE_FILTERS: TableFilters = {
  role: "all",
  method: "all",
  autoRenew: false,
  verified: false,
  negative: false,
}

export function countActiveTableFilters(filters: TableFilters): number {
  return (
    (filters.role !== "all" ? 1 : 0) +
    (filters.method !== "all" ? 1 : 0) +
    (filters.autoRenew ? 1 : 0) +
    (filters.verified ? 1 : 0) +
    (filters.negative ? 1 : 0)
  )
}

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
]

const OPTIONAL_COLUMNS: { key: keyof ColumnVisibility; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "usage", label: "Usage" },
  { key: "tags", label: "Tags" },
]

const ROLE_OPTIONS: {
  key: "all" | TransactionRole
  label: string
  icon?: LucideIcon
}[] = [
  { key: "all", label: "All roles", icon: Users },
  { key: "Admin", label: "Admin", icon: ShieldCheck },
  { key: "Editor", label: "Editor", icon: SquarePen },
  { key: "Viewer", label: "Viewer", icon: Eye },
]

const METHOD_OPTIONS: {
  key: "all" | CardBrand
  label: string
  icon?: LucideIcon
}[] = [
  { key: "all", label: "All methods", icon: Wallet },
  { key: "Visa", label: "Visa", icon: CreditCard },
  { key: "Mastercard", label: "Mastercard", icon: CreditCard },
  { key: "Amex", label: "Amex", icon: CreditCard },
  { key: "SEPA", label: "SEPA", icon: Landmark },
]

const ONLY_OPTIONS: {
  key: "autoRenew" | "verified" | "negative"
  label: string
  icon: LucideIcon
}[] = [
  { key: "autoRenew", label: "Auto-renew", icon: RefreshCw },
  { key: "verified", label: "Verified", icon: BadgeCheck },
  { key: "negative", label: "Outgoing", icon: ArrowUpRight },
]

export function pillClass(active: boolean) {
  return cn(
    "flex h-7 items-center gap-1.5 rounded-(--radius-control) px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )
}

function PillGroup<K extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: readonly { key: K; label: string; icon?: LucideIcon }[]
  value: K
  onSelect: (key: K) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-1"
    >
      {options.map((o) => {
        const Icon = o.icon
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={value === o.key}
            onClick={() => onSelect(o.key)}
            className={pillClass(value === o.key)}
          >
            {Icon && <Icon aria-hidden className="size-3.5" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function GridToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  filtersOpen,
  onFiltersOpenChange,
  activeFilterCount,
  canReset,
  onReset,
  rowCount,
  columns,
  onColumnsChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
  activeFilterCount: number
  canReset: boolean
  onReset: () => void
  rowCount: number
  columns: ColumnVisibility
  onColumnsChange: (next: ColumnVisibility) => void
}) {
  return (
    <div className="shrink-0 border-b">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rows"
            className="w-44 pl-8"
            aria-label="Search transactions"
          />
        </div>
        <Button
          className="ml-auto bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
        >
          <FileSpreadsheet data-icon="inline-start" /> Export
        </Button>
      </div>
      <Separator />
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <NativeSelect
          size="sm"
          aria-label="Filter by status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant={filtersOpen ? "secondary" : "ghost"}
            aria-expanded={filtersOpen}
            onClick={() => onFiltersOpenChange(!filtersOpen)}
          >
            <ListFilter data-icon="inline-start" /> Filters
            {activeFilterCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {canReset && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Reset all filters"
                    className="text-muted-foreground animate-in fade-in-0 zoom-in-75"
                    onClick={onReset}
                  />
                }
              >
                <X />
              </TooltipTrigger>
              <TooltipContent>Reset all filters</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {rowCount} {rowCount === 1 ? "row" : "rows"}
          </span>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              <Columns3 data-icon="inline-start" /> Columns
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 gap-0.5 p-1.5">
              <p className="px-1.5 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
                Toggle columns
              </p>
              {OPTIONAL_COLUMNS.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={columns[column.key]}
                    onCheckedChange={(checked) =>
                      onColumnsChange({ ...columns, [column.key]: checked })
                    }
                  />
                  {column.label}
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export function TableFiltersBar({
  open,
  filters,
  onChange,
}: {
  open: boolean
  filters: TableFilters
  onChange: (next: TableFilters) => void
}) {
  const activeCount = countActiveTableFilters(filters)

  return (
    <div
      className={cn(
        "grid shrink-0 transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        open ? "grid-rows-[1fr] border-b" : "grid-rows-[0fr]"
      )}
    >
      <div className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-muted/30 px-4 py-2.5">
          <PillGroup
            label="Role"
            options={ROLE_OPTIONS}
            value={filters.role}
            onSelect={(role) => onChange({ ...filters, role })}
          />
          <span aria-hidden className="h-4 w-px shrink-0 bg-border" />
          <PillGroup
            label="Method"
            options={METHOD_OPTIONS}
            value={filters.method}
            onSelect={(method) => onChange({ ...filters, method })}
          />
          <span aria-hidden className="h-4 w-px shrink-0 bg-border" />
          <div
            role="group"
            aria-label="Only show"
            className="flex flex-wrap items-center gap-1"
          >
            {ONLY_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={filters[option.key]}
                  onClick={() =>
                    onChange({ ...filters, [option.key]: !filters[option.key] })
                  }
                  className={pillClass(filters[option.key])}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {option.label}
                </button>
              )
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={activeCount === 0}
            className={cn(
              "ml-auto shrink-0 text-muted-foreground",
              activeCount === 0 && "invisible"
            )}
            onClick={() => onChange(DEFAULT_TABLE_FILTERS)}
          >
            <RotateCcw data-icon="inline-start" /> Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SelectionBar({
  count,
  onDelete,
  onClear,
}: {
  count: number
  onDelete: () => void
  onClear: () => void
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border bg-background py-1.5 pr-1.5 pl-4">
        <span className="text-sm font-medium tabular-nums">
          {count} selected
        </span>
        <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
        <Button variant="ghost" size="sm">
          <Archive data-icon="inline-start" /> Archive
        </Button>
        <Button variant="ghost" size="sm">
          <RotateCcw data-icon="inline-start" /> Refund
        </Button>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
            <Trash2 data-icon="inline-start" /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                <Trash2 />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Delete {count} {count === 1 ? "transaction" : "transactions"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The selected rows are removed from the ledger. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  onDelete()
                  setConfirmOpen(false)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X />
        </Button>
      </div>
    </div>
  )
}
