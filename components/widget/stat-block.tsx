import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatDelta({
  children,
  direction = "up",
}: {
  children: React.ReactNode
  direction?: "up" | "down"
}) {
  const Arrow = direction === "down" ? ArrowDownRight : ArrowUpRight
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Arrow aria-hidden className="size-3 shrink-0" />
      {children}
    </span>
  )
}

// Full-size stat header: label / value / delta / optional detail line with a
// single vertical rhythm so every widget aligns identically.
export function StatBlock({
  label,
  value,
  delta,
  direction = "up",
  detail,
  className,
}: {
  label: string
  value: string
  delta?: string
  direction?: "up" | "down"
  detail?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading mt-1.5 text-2xl leading-none font-semibold tracking-tight">
        {value}
      </span>
      {delta && (
        <span className="mt-2">
          <StatDelta direction={direction}>{delta}</StatDelta>
        </span>
      )}
      {detail && (
        <span className="mt-1 text-[11px] text-muted-foreground">{detail}</span>
      )}
    </div>
  )
}

// Compact (half-size) stat: value left, secondary content right, on one
// vertically centered row.
export function StatRow({
  value,
  right,
  className,
}: {
  value: string
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 items-center justify-between gap-3",
        className
      )}
    >
      <span className="font-heading text-xl leading-none font-semibold tracking-tight">
        {value}
      </span>
      {right}
    </div>
  )
}
