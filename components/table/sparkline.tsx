import { cn } from "@/lib/utils"

const WIDTH = 64
const HEIGHT = 20
const PAD = 2

export function Sparkline({
  data,
  className,
}: {
  data: number[]
  className?: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (WIDTH - PAD * 2) / (data.length - 1)
  const points = data
    .map((value, i) => {
      const x = PAD + i * step
      const y = HEIGHT - PAD - ((value - min) / range) * (HEIGHT - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
