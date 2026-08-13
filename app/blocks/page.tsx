import type { Metadata } from "next"

import { BlocksGrid } from "@/components/blocks/blocks-grid"
import { BlocksHeaderChip } from "@/components/blocks/blocks-header"

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Every Widget Board building block on one page — forms, tables, dialogs, and settings surfaces.",
}

export default function BlocksPage() {
  return (
    <>
      <BlocksHeaderChip />
      <BlocksGrid />
    </>
  )
}
