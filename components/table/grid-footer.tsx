"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function GridFooter({
  total,
  start,
  end,
  selectedCount,
  page,
  pageCount,
  onPageChange,
  perPage,
  onPerPageChange,
}: {
  total: number
  start: number
  end: number
  selectedCount: number
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  perPage: number
  onPerPageChange: (perPage: number) => void
}) {
  const goTo = (event: React.MouseEvent, next: number) => {
    event.preventDefault()
    onPageChange(Math.min(Math.max(next, 1), pageCount))
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
      <span className="text-xs text-muted-foreground tabular-nums">
        Showing {start}–{end} of {total} {total === 1 ? "row" : "rows"} ·{" "}
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2">
        <NativeSelect
          size="sm"
          aria-label="Rows per page"
          value={String(perPage)}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
        >
          <NativeSelectOption value="10">10 / page</NativeSelectOption>
          <NativeSelectOption value="25">25 / page</NativeSelectOption>
          <NativeSelectOption value="50">50 / page</NativeSelectOption>
        </NativeSelect>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={cn(page === 1 && "pointer-events-none opacity-50")}
                onClick={(e) => goTo(e, page - 1)}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (n) => (
                <PaginationItem key={n} className="max-sm:hidden">
                  <PaginationLink
                    href="#"
                    isActive={n === page}
                    onClick={(e) => goTo(e, n)}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === pageCount}
                className={cn(
                  page === pageCount && "pointer-events-none opacity-50"
                )}
                onClick={(e) => goTo(e, page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
