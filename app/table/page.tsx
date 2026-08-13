import type { Metadata } from "next"

import { DataGrid } from "@/components/table/data-grid"
import { TablePageHeader } from "@/components/table/page-header"

export const metadata: Metadata = {
  title: "Table",
  description:
    "A dense payments and activity ledger for Widget Board — searchable, sortable, and selectable.",
}

export default function TablePage() {
  return (
    <div className="h-full bg-muted p-6">
      <main className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
        <TablePageHeader />
        <DataGrid />
      </main>
    </div>
  )
}
