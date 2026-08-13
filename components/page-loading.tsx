import { Spinner } from "@/components/ui/spinner"

/**
 * Route-level fallback. The shell already draws the card and the top bar, so
 * this fills the content area beneath them instead of nesting a second card.
 */
export function PageLoading() {
  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
