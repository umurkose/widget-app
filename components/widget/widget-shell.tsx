import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function WidgetShell({
  title,
  icon: Icon,
  accessory,
  compact = false,
  className,
  children,
}: {
  title: string
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
        "flex h-full min-h-0 flex-col gap-2.5 overflow-hidden rounded-2xl border bg-card p-4 text-card-foreground shadow-xs",
        compact && "gap-1.5 p-3"
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon aria-hidden className="size-3.5" />}
        <span className="text-[11px] font-medium tracking-wider uppercase">
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
