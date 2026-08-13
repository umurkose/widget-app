import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function WidgetShell({
  title,
  accessory,
  compact = false,
  className,
  children,
}: {
  title: string
  // Accepted for compatibility; the header intentionally renders no icon.
  icon?: LucideIcon
  accessory?: React.ReactNode
  compact?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="widget"
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 text-card-foreground shadow-xs",
        compact && "gap-2 p-3"
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        <span className="font-accent text-[11px] font-medium tracking-wider uppercase">
          {title}
        </span>
        {accessory && (
          <span className="ml-auto text-[11px] normal-case">{accessory}</span>
        )}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        {children}
      </div>
    </div>
  )
}
