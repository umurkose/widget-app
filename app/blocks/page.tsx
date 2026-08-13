import type { Metadata } from "next"

import { BlocksGrid } from "@/components/blocks/blocks-grid"
import { BlocksHeader } from "@/components/blocks/blocks-header"

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Every Widget Board building block on one page — forms, tables, dialogs, and settings surfaces.",
}

export default function BlocksPage() {
  return (
    <div className="h-full bg-muted p-6">
      <main className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
        <BlocksHeader />
        <BlocksGrid />
      </main>
    </div>
  )
}
