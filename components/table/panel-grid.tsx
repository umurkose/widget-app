"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  FileSpreadsheet,
  ListFilter,
  RotateCcw,
  Search,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { pillClass } from "@/components/table/toolbar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type PanelColumn<T> = {
  key: string
  header: string
  align?: "right"
  /** Optional columns can be switched off from the Columns popover. */
  optional?: boolean
  className?: string
  cell: (item: T) => React.ReactNode
  sortValue?: (item: T) => string | number
  searchValue?: (item: T) => string
}

export type PanelFilter<T> = {
  key: string
  label: string
  test: (item: T) => boolean
}

/**
 * The panel's grid wears the page grid's controls: search opposite a green
 * Export, a separator, then Filters / reset / row count / Columns, with the
 * one-click filter pills underneath.
 */
export function PanelGrid<T>({
  rows,
  columns,
  filters = [],
  empty = "Nothing to show.",
  caption,
}: {
  rows: T[]
  columns: PanelColumn<T>[]
  filters?: PanelFilter<T>[]
  empty?: string
  caption?: string
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState<Set<string>>(new Set())
  const [hidden, setHidden] = React.useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = React.useState(true)
  const [sort, setSort] = React.useState<{
    key: string
    dir: "asc" | "desc"
  } | null>(null)

  const visible = columns.filter((c) => !hidden.has(c.key))
  const optional = columns.filter((c) => c.optional)

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    const tests = filters.filter((f) => active.has(f.key))
    return rows.filter((row) => {
      if (!tests.every((f) => f.test(row))) return false
      if (!needle) return true
      return columns.some((column) =>
        column.searchValue?.(row)?.toLowerCase().includes(needle)
      )
    })
  }, [rows, columns, filters, query, active])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const column = columns.find((c) => c.key === sort.key)
    if (!column?.sortValue) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = column.sortValue!(a)
      const right = column.sortValue!(b)
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * dir
      }
      return String(left).localeCompare(String(right)) * dir
    })
  }, [filtered, sort, columns])

  const cycleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" }
      if (prev.dir === "asc") return { key, dir: "desc" }
      return null
    })
  }

  const canReset = query !== "" || active.size > 0

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex flex-wrap items-center gap-2 px-2 py-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rows"
            aria-label="Search rows"
            className="h-7 w-full pl-7 text-xs"
          />
        </div>
        <Button
          size="sm"
          className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
        >
          <FileSpreadsheet data-icon="inline-start" /> Export
        </Button>
      </div>
      <Separator />
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
        {filters.length > 0 && (
          <div className="flex items-center gap-0.5">
            <Button
              size="sm"
              variant={filtersOpen ? "secondary" : "ghost"}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <ListFilter data-icon="inline-start" /> Filters
              {active.size > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                  {active.size}
                </span>
              )}
            </Button>
            {canReset && (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Reset all filters"
                className="text-muted-foreground animate-in fade-in-0 zoom-in-75"
                onClick={() => {
                  setQuery("")
                  setActive(new Set())
                }}
              >
                <X />
              </Button>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {sorted.length} {sorted.length === 1 ? "row" : "rows"}
          </span>
          {optional.length > 0 && (
            <Popover>
              <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                <Columns3 data-icon="inline-start" /> Columns
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 gap-0.5 p-1.5">
                <p className="px-1.5 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
                  Toggle columns
                </p>
                {optional.map((column) => (
                  <label
                    key={column.key}
                    className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={!hidden.has(column.key)}
                      onCheckedChange={(checked) =>
                        setHidden((prev) => {
                          const next = new Set(prev)
                          if (checked) next.delete(column.key)
                          else next.add(column.key)
                          return next
                        })
                      }
                    />
                    {column.header}
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {filters.length > 0 && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 border-t bg-muted/30 px-2 py-1.5">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={active.has(filter.key)}
                  onClick={() =>
                    setActive((prev) => {
                      const next = new Set(prev)
                      if (next.has(filter.key)) next.delete(filter.key)
                      else next.add(filter.key)
                      return next
                    })
                  }
                  className={pillClass(active.has(filter.key))}
                >
                  {filter.label}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={active.size === 0}
                className={cn(
                  "ml-auto shrink-0 text-muted-foreground",
                  active.size === 0 && "invisible"
                )}
                onClick={() => setActive(new Set())}
              >
                <RotateCcw data-icon="inline-start" /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border-t">
        <Table className="text-xs">
          <TableHeader className="[&_tr]:border-b">
            <TableRow className="hover:bg-transparent">
              {visible.map((column) => {
                const isActive = sort?.key === column.key
                const Icon = isActive
                  ? sort.dir === "asc"
                    ? ArrowUp
                    : ArrowDown
                  : ChevronsUpDown
                return (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "h-7 px-1.5 text-[11px] font-medium text-muted-foreground",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(column.key)}
                        aria-label={`Sort by ${column.header}`}
                        className={cn(
                          "flex items-center gap-1 rounded-(--radius-control) transition-colors hover:text-foreground",
                          column.align === "right" && "ml-auto"
                        )}
                      >
                        {column.header}
                        <Icon
                          className={cn("size-2.5", !isActive && "opacity-60")}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={visible.length}
                  className="px-2 py-4 text-center text-[11px] text-muted-foreground"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
            {sorted.map((row, index) => (
              <TableRow
                key={index}
                className={cn(index % 2 === 1 && "bg-muted/40")}
              >
                {visible.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-1.5 py-1.5",
                      column.align === "right" && "text-right",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {caption && (
        <p className="border-t px-2 py-1 text-[10px] text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}
