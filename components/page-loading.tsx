import { Spinner } from "@/components/ui/spinner"

/** Route-level fallback: the page card with a centered spinner, so a
 *  navigation lands on the same frame the real page will fill. */
export function PageLoading() {
  return (
    <div className="h-full bg-muted p-6">
      <main className="flex h-full items-center justify-center overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Spinner className="size-6 text-muted-foreground" />
      </main>
    </div>
  )
}
