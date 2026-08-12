"use client"

import * as React from "react"

export const RANGES = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "14d", label: "Last 14 days" },
] as const
export type RangeKey = (typeof RANGES)[number]["key"]

export const STATUSES = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
] as const
export type StatusKey = (typeof STATUSES)[number]["key"]

export const SOURCES = [
  { key: "all", label: "All" },
  { key: "payments", label: "Payments" },
  { key: "auth", label: "Auth" },
  { key: "admin", label: "Admin" },
  { key: "api", label: "API" },
] as const
export type SourceKey = (typeof SOURCES)[number]["key"]

export type Filters = {
  range: RangeKey
  status: StatusKey
  source: SourceKey
}

export const DEFAULT_FILTERS: Filters = {
  range: "all",
  status: "all",
  source: "all",
}

export function countActiveFilters(f: Filters): number {
  return [f.range, f.status, f.source].filter((v) => v !== "all").length
}

// Row metadata for filterable feed entries. `when` buckets: today,
// yesterday, week (2-7 days ago), older (8-14 days ago).
export type RowMeta = {
  when: "today" | "yesterday" | "week" | "older"
  status: Exclude<StatusKey, "all">
  source: Exclude<SourceKey, "all">
}

export function matchesFilters(meta: RowMeta, f: Filters): boolean {
  const rangeOk =
    f.range === "all"
      ? true
      : f.range === "today"
        ? meta.when === "today"
        : f.range === "yesterday"
          ? meta.when === "yesterday"
          : f.range === "7d"
            ? meta.when !== "older"
            : true // 14d: every bucket we model
  const statusOk = f.status === "all" || f.status === meta.status
  const sourceOk = f.source === "all" || f.source === meta.source
  return rangeOk && statusOk && sourceOk
}

const FiltersContext = React.createContext<Filters>(DEFAULT_FILTERS)

export function FiltersProvider({
  value,
  children,
}: {
  value: Filters
  children: React.ReactNode
}) {
  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

export function useFilters(): Filters {
  return React.useContext(FiltersContext)
}
