import type { Metadata } from "next"

import { DataGrid } from "@/components/table/data-grid"

export const metadata: Metadata = {
  title: "Table",
  description:
    "A dense payments and activity ledger for Widget Board — searchable, sortable, and selectable.",
}

export default function TablePage() {
  return <DataGrid />
}
