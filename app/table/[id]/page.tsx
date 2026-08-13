import type { Metadata } from "next"

import { TRANSACTIONS } from "@/components/table/data"
import { DataGrid } from "@/components/table/data-grid"
import { TablePageHeader } from "@/components/table/page-header"

export function generateStaticParams() {
  return TRANSACTIONS.map((row) => ({ id: row.slug }))
}

export async function generateMetadata(
  props: PageProps<"/table/[id]">
): Promise<Metadata> {
  const { id } = await props.params
  const row = TRANSACTIONS.find((item) => item.slug === id)
  return {
    title: row ? `${row.id} · Table` : "Table",
    description: row
      ? `${row.user.name} · ${row.status} · ${row.method.brand}`
      : undefined,
  }
}

export default async function TableRowPage(props: PageProps<"/table/[id]">) {
  const { id } = await props.params

  return (
    <div className="h-full bg-muted p-6">
      <main className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
        <DataGrid header={<TablePageHeader />} initialSlug={id} />
      </main>
    </div>
  )
}
