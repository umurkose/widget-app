"use client"

import { RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  RANGES,
  SOURCES,
  STATUSES,
  type Filters,
} from "@/components/widget/filters"

function PillGroup<K extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: readonly { key: K; label: string }[]
  value: K
  onSelect: (key: K) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-1"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          onClick={() => onSelect(o.key)}
          className={cn(
            "h-7 rounded-(--radius-control) px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            value === o.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function FiltersBar({
  open,
  filters,
  onChange,
}: {
  open: boolean
  filters: Filters
  onChange: (next: Filters) => void
}) {
  const activeCount = countActiveFilters(filters)

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
            label="Period"
            options={RANGES}
            value={filters.range}
            onSelect={(range) => onChange({ ...filters, range })}
          />
          <span aria-hidden className="h-4 w-px shrink-0 bg-border" />
          <PillGroup
            label="Status"
            options={STATUSES}
            value={filters.status}
            onSelect={(status) => onChange({ ...filters, status })}
          />
          <span aria-hidden className="h-4 w-px shrink-0 bg-border" />
          <PillGroup
            label="Source"
            options={SOURCES}
            value={filters.source}
            onSelect={(source) => onChange({ ...filters, source })}
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={activeCount === 0}
            className={cn(
              "ml-auto shrink-0 text-muted-foreground",
              activeCount === 0 && "invisible"
            )}
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <RotateCcw data-icon="inline-start" /> Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
