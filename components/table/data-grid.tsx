"use client"

import * as React from "react"
import { BadgeCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  formatAmount,
  TRANSACTIONS,
  type Transaction,
} from "@/components/table/data"
import {
  RowActions,
  SortButton,
  StatusBadge,
  TagsCell,
  type SortKey,
  type SortState,
} from "@/components/table/cells"
import { GridFooter } from "@/components/table/grid-footer"
import { RowDetailPanel } from "@/components/table/row-detail-panel"
import { Sparkline, trendClass } from "@/components/table/sparkline"
import {
  countActiveTableFilters,
  DEFAULT_TABLE_FILTERS,
  GridToolbar,
  SelectionBar,
  TableFiltersBar,
  type ColumnVisibility,
  type TableFilters,
} from "@/components/table/toolbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function matchesFilters(
  row: Transaction,
  query: string,
  status: string,
  filters: TableFilters
) {
  if (status !== "all" && row.status !== status) return false
  if (filters.role !== "all" && row.role !== filters.role) return false
  if (filters.method !== "all" && row.method.brand !== filters.method)
    return false
  if (filters.autoRenew && !row.autoRenew) return false
  if (filters.verified && !row.verified) return false
  if (filters.negative && row.amount >= 0) return false
  if (!query) return true
  return (
    row.user.name.toLowerCase().includes(query) ||
    row.user.email.toLowerCase().includes(query) ||
    row.id.toLowerCase().includes(query)
  )
}

function sortValue(row: Transaction, key: SortKey): string | number {
  switch (key) {
    case "id":
      return row.id
    case "user":
      return row.user.name
    case "role":
      return row.role
    case "status":
      return row.status
    case "amount":
      return row.amount
    case "method":
      return `${row.method.brand} ${row.method.last4}`
    case "activity":
      return row.activity.reduce((sum, value) => sum + value, 0)
    case "usage":
      return row.usage
    case "tags":
      return row.tags.join(",")
    case "autoRenew":
      return row.autoRenew ? 1 : 0
    case "lastActive":
      return row.lastActiveMinutes
  }
}

export function DataGrid({ header }: { header?: React.ReactNode }) {
  const [rows, setRows] = React.useState<Transaction[]>(TRANSACTIONS)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [sort, setSort] = React.useState<SortState | null>(null)
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(25)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [columns, setColumns] = React.useState<ColumnVisibility>({
    activity: true,
    usage: true,
    tags: true,
  })
  const [filters, setFilters] = React.useState<TableFilters>(
    DEFAULT_TABLE_FILTERS
  )
  const [filtersOpen, setFiltersOpen] = React.useState(true)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => matchesFilters(row, query, status, filters))
  }, [rows, search, status, filters])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = sortValue(a, sort.key)
      const right = sortValue(b, sort.key)
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * dir
      }
      return String(left).localeCompare(String(right)) * dir
    })
  }, [filtered, sort])

  // Selection follows the filters: rows hidden by a new filter are dropped so
  // bulk actions never touch rows the user can no longer see.
  const pruneSelected = (
    nextSearch: string,
    nextStatus: string,
    nextFilters: TableFilters
  ) => {
    const query = nextSearch.trim().toLowerCase()
    setSelected((prev) => {
      if (prev.size === 0) return prev
      const next = new Set<string>()
      for (const row of rows) {
        if (prev.has(row.id) && matchesFilters(row, query, nextStatus, nextFilters)) {
          next.add(row.id)
        }
      }
      return next
    })
  }

  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage))
  const currentPage = Math.min(page, pageCount)
  const pageRows = sorted.slice((currentPage - 1) * perPage, currentPage * perPage)
  const start = sorted.length === 0 ? 0 : (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, sorted.length)

  const filteredIds = React.useMemo(
    () => filtered.map((row) => row.id),
    [filtered]
  )
  const selectedInFiltered = filteredIds.filter((id) => selected.has(id))
  const allSelected =
    filtered.length > 0 && selectedInFiltered.length === filtered.length
  const someSelected = selectedInFiltered.length > 0 && !allSelected

  const toggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of filteredIds) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleAutoRenew = (id: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, autoRenew: checked } : row))
    )
  }

  // Derived, so deleting the open row closes its panel on its own.
  const activeRow = rows.find((row) => row.id === activeId) ?? null

  // Clicks on a checkbox, action button or link belong to that control.
  const openRow = (event: React.MouseEvent<HTMLTableRowElement>, id: string) => {
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, [role="checkbox"]')) return
    setActiveId(id)
  }

  const deleteSelected = () => {
    setRows((prev) => prev.filter((row) => !selected.has(row.id)))
    if (activeId && selected.has(activeId)) setActiveId(null)
    setSelected(new Set())
    setPage(1)
  }

  const cycleSort = (key: SortKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" }
      if (prev.dir === "asc") return { key, dir: "desc" }
      return null
    })
    setPage(1)
  }

  const visibleOptional = [columns.activity, columns.usage, columns.tags].filter(
    Boolean
  ).length

  return (
    <div className="flex min-h-0 flex-1">
      {/* Everything left of the panel narrows together: the page header,
          toolbar, filter bar, rows and footer all shift when a row opens. */}
      <div className="flex min-w-0 flex-1 flex-col">
      {header}
      <GridToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          pruneSelected(value, status, filters)
          setPage(1)
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value)
          pruneSelected(search, value, filters)
          setPage(1)
        }}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
        activeFilterCount={countActiveTableFilters(filters)}
        canReset={
          search !== "" ||
          status !== "all" ||
          countActiveTableFilters(filters) > 0
        }
        onReset={() => {
          setSearch("")
          setStatus("all")
          setFilters(DEFAULT_TABLE_FILTERS)
          pruneSelected("", "all", DEFAULT_TABLE_FILTERS)
          setPage(1)
        }}
        rowCount={sorted.length}
        columns={columns}
        onColumnsChange={setColumns}
      />
      <TableFiltersBar
        open={filtersOpen}
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          pruneSelected(search, status, next)
          setPage(1)
        }}
      />
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-auto [&_[data-slot=table-container]]:overflow-visible">
        <Table className="min-w-[1100px]">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_0_var(--color-border)] [&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => toggleAll(checked)}
                  aria-label="Select all visible rows"
                />
              </TableHead>
              <TableHead>
                <SortButton label="ID" sortKey="id" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="User" sortKey="user" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="Role" sortKey="role" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="Status" sortKey="status" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  label="Amount"
                  sortKey="amount"
                  sort={sort}
                  onCycle={cycleSort}
                  className="ml-0 -mr-2.5"
                />
              </TableHead>
              <TableHead>
                <SortButton label="Method" sortKey="method" sort={sort} onCycle={cycleSort} />
              </TableHead>
              {columns.activity && (
                <TableHead>
                  <SortButton label="Activity" sortKey="activity" sort={sort} onCycle={cycleSort} />
                </TableHead>
              )}
              {columns.usage && (
                <TableHead>
                  <SortButton label="Usage" sortKey="usage" sort={sort} onCycle={cycleSort} />
                </TableHead>
              )}
              {columns.tags && (
                <TableHead>
                  <SortButton label="Tags" sortKey="tags" sort={sort} onCycle={cycleSort} />
                </TableHead>
              )}
              <TableHead>
                <SortButton label="Auto-renew" sortKey="autoRenew" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="Last active" sortKey="lastActive" sort={sort} onCycle={cycleSort} />
              </TableHead>
              <TableHead className="w-10 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10 + visibleOptional}
                  className="py-10 text-center text-muted-foreground"
                >
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row, index) => {
              const isSelected = selected.has(row.id)
              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={(event) => openRow(event, row.id)}
                  className={cn(
                    "cursor-pointer",
                    !isSelected && index % 2 === 1 && "bg-muted/40",
                    activeId === row.id && "bg-muted"
                  )}
                >
                  <TableCell className="w-10 pl-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleRow(row.id, checked)}
                      aria-label={`Select ${row.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell>
                    <div className="flex w-52 min-w-0 items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback>{row.user.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 text-sm font-medium">
                          <span className="truncate">{row.user.name}</span>
                          {row.verified && (
                            <BadgeCheck
                              className="size-3.5 shrink-0 text-muted-foreground"
                              aria-label="Verified"
                            />
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.role}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      row.amount < 0 && "text-destructive"
                    )}
                  >
                    {formatAmount(row.amount, row.currency)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium">
                      {row.method.brand}
                    </span>{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      ••{row.method.last4}
                    </span>
                  </TableCell>
                  {columns.activity && (
                    <TableCell>
                      <Sparkline
                        data={row.activity}
                        className={trendClass(row.activity)}
                      />
                    </TableCell>
                  )}
                  {columns.usage && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={row.usage} className="w-16 flex-nowrap" />
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {row.usage}%
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {columns.tags && (
                    <TableCell>
                      <TagsCell tags={row.tags} />
                    </TableCell>
                  )}
                  <TableCell>
                    <Checkbox
                      checked={row.autoRenew}
                      onCheckedChange={(checked) =>
                        toggleAutoRenew(row.id, checked)
                      }
                      aria-label={`Toggle auto-renew for ${row.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.lastActive}
                  </TableCell>
                  <TableCell className="w-10 pr-4 text-right">
                    <RowActions row={row} onView={() => setActiveId(row.id)} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
        {selected.size > 0 && (
          <SelectionBar
            count={selected.size}
            onDelete={deleteSelected}
            onClear={() => setSelected(new Set())}
          />
        )}
      </div>
      <GridFooter
        total={sorted.length}
        start={start}
        end={end}
        selectedCount={selected.size}
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
      />
      </div>
      <RowDetailPanel row={activeRow} onClose={() => setActiveId(null)} />
    </div>
  )
}
