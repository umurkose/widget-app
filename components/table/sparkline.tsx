import { cn } from "@/lib/utils"

const WIDTH = 64
const HEIGHT = 20
const PAD = 2

/** Rising series read green, falling ones read destructive — same language
 *  the amount column already speaks. */
export function trendClass(data: number[]) {
  const delta = data[data.length - 1] - data[0]
  if (delta > 0) return "text-green-600 dark:text-green-500"
  if (delta < 0) return "text-destructive"
  return "text-muted-foreground"
}

export function Sparkline({
  data,
  className,
  stretch = false,
}: {
  data: number[]
  className?: string
  /** Fill the container instead of keeping the 64×20 aspect ratio. */
  stretch?: boolean
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (WIDTH - PAD * 2) / (data.length - 1)
  const points = data.map((value, i) => {
    const x = PAD + i * step
    const y = HEIGHT - PAD - ((value - min) / range) * (HEIGHT - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = points.join(" ")
  const area = `${PAD},${HEIGHT} ${line} ${(WIDTH - PAD).toFixed(1)},${HEIGHT}`

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={stretch ? undefined : WIDTH}
      height={stretch ? undefined : HEIGHT}
      // Stretching distorts the viewBox, so the stroke opts out of scaling
      // and keeps an even weight across the full width.
      preserveAspectRatio={stretch ? "none" : undefined}
      className={cn(!stretch && "shrink-0", className)}
      aria-hidden="true"
    >
      <polygon points={area} fill="currentColor" opacity={0.12} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect={stretch ? "non-scaling-stroke" : undefined}
      />
    </svg>
  )
}
