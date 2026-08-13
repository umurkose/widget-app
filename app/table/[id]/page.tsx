import type { Metadata } from "next"

import { TRANSACTIONS } from "@/components/table/data"
import { DataGrid } from "@/components/table/data-grid"

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

  return <DataGrid initialSlug={id} />
}
