"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const STATUS_OPTIONS: { key: string; label: string; icon?: LucideIcon }[] = [
  { key: "all", label: "All statuses", icon: Wallet },
  { key: "Paid", label: "Paid", icon: BadgeCheck },
  { key: "Pending", label: "Pending", icon: RefreshCw },
  { key: "Failed", label: "Failed", icon: X },
  { key: "Refunded", label: "Refunded", icon: RotateCcw },
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
    "flex h-7 shrink-0 items-center gap-1.5 rounded-(--radius-control) px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
      className="flex shrink-0 items-center gap-1"
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
  filtersOpen,
  onFiltersOpenChange,
  activeFilterCount,
  canReset,
  onReset,
  columns,
  onColumnsChange,
}: {
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
  activeFilterCount: number
  canReset: boolean
  onReset: () => void
  columns: ColumnVisibility
  onColumnsChange: (next: ColumnVisibility) => void
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-3">
      <div className="flex items-center gap-0.5">
        <Button
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
                  size="icon"
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
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
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
        <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400">
          <FileSpreadsheet data-icon="inline-start" /> Export
        </Button>
      </div>
    </div>
  )
}

/**
 * Full-bleed search: it sits flush between the filters and the grid, with no
 * radius or margin of its own. The row count slides aside on a critically
 * damped spring to make room for the clear button as soon as you type.
 */
export function GridSearchBar({
  search,
  onSearchChange,
  rowCount,
  variant = "flush",
}: {
  search: string
  onSearchChange: (value: string) => void
  rowCount: number
  /** flush: full-bleed above the grid. boxed: rounded, inside a panel. */
  variant?: "flush" | "boxed"
}) {
  const reducedMotion = useReducedMotion()
  const spring = reducedMotion
    ? { duration: 0 }
    : ({ type: "spring", bounce: 0, duration: 0.3 } as const)

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        variant === "flush"
          ? "h-11 border-b px-4"
          : "h-8 rounded-(--radius-control) border px-3"
      )}
    >
      <Search
        className={cn(
          "shrink-0 text-muted-foreground",
          variant === "flush" ? "size-4" : "size-3.5"
        )}
      />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search rows"
        aria-label="Search transactions"
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
          variant === "flush" ? "text-sm" : "text-xs"
        )}
      />
      <div className="flex shrink-0 items-center gap-1">
        <motion.span
          layout
          transition={spring}
          className={cn(
            "font-accent text-muted-foreground tabular-nums",
            variant === "flush" ? "text-xs" : "text-[11px]"
          )}
        >
          {rowCount} {rowCount === 1 ? "row" : "rows"}
        </motion.span>
        <AnimatePresence initial={false}>
          {search !== "" && (
            <motion.button
              layout
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              initial={{ opacity: 0, scale: 0.6, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: variant === "flush" ? 24 : 20 }}
              exit={{ opacity: 0, scale: 0.6, width: 0 }}
              transition={spring}
              className={cn(
              "flex shrink-0 items-center justify-center overflow-hidden rounded-(--radius-control) text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              variant === "flush" ? "h-6" : "h-5"
            )}
            >
              <X className="size-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function TableFiltersBar({
  open,
  filters,
  onChange,
  status,
  onStatusChange,
}: {
  open: boolean
  filters: TableFilters
  onChange: (next: TableFilters) => void
  status: string
  onStatusChange: (value: string) => void
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
        <div className="flex items-center gap-x-3 overflow-x-auto bg-muted/30 px-4 py-2.5">
          <PillGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onSelect={onStatusChange}
          />
          <span aria-hidden className="h-4 w-px shrink-0 bg-border" />
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
            className="flex shrink-0 items-center gap-1"
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
