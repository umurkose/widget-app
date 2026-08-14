"use client"

import * as React from "react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { Plus, RectangleHorizontal, Square, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getWidget,
  GRID_COLS as COLS,
  HALF_ROWS,
  SLOT_COUNT,
  slotsOf,
  type PlacedWidget,
} from "@/components/widget/registry"

// Apple "move/reposition": critically damped, response 0.4s — the reflow must
// never bounce; only the thrown widget itself may (dragTransition below).
const reflowSpring = { type: "spring", bounce: 0, duration: 0.4 } as const

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

type Resolution =
  | { kind: "empty" }
  | { kind: "swap"; other: PlacedWidget }
  | { kind: "blocked" }

// Deterministic per-widget jiggle: same widget always wobbles the same way,
// but no two widgets share a period, so the grid never pulses in unison.
function jiggleOf(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const n = Math.abs(h)
  return {
    tilt: 0.4 + ((n >>> 3) % 5) * 0.06,
    lift: 0.5 + ((n >>> 7) % 4) * 0.15,
    period: 0.19 + ((n >>> 11) % 6) * 0.011,
    delay: (((n >>> 17) % 12) * 0.018),
  }
}

export function WidgetGrid({
  items,
  onChange,
  editing,
  onRemove,
  onAddRequest,
}: {
  items: PlacedWidget[]
  onChange: (next: PlacedWidget[]) => void
  editing: boolean
  onRemove: (id: string) => void
  onAddRequest: () => void
}) {
  const gridRef = React.useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [hoverSlot, setHoverSlot] = React.useState<number | null>(null)
  const [settling, setSettling] = React.useState<Set<string>>(new Set())
  const [announcement, setAnnouncement] = React.useState("")

  const occupancy = React.useMemo(() => {
    const map = new Map<number, PlacedWidget>()
    for (const w of items) for (const s of slotsOf(w)) map.set(s, w)
    return map
  }, [items])

  const placeStyle = (slot: number, span: number): React.CSSProperties => ({
    gridColumnStart: (slot % COLS) + 1,
    gridRowStart: Math.floor(slot / COLS) + 1,
    gridRowEnd: `span ${span}`,
  })

  // info.point is page-based; the grid rect is viewport-based — align them.
  const slotFromPointer = (w: PlacedWidget, info: PanInfo): number | null => {
    const grid = gridRef.current
    if (!grid) return null
    const rect = grid.getBoundingClientRect()
    const x = info.point.x - (rect.left + window.scrollX)
    const y = info.point.y - (rect.top + window.scrollY)
    const col = clamp(Math.floor((x / rect.width) * COLS), 0, COLS - 1)
    if (w.size === "full") {
      const cellRow = clamp(Math.floor((y / rect.height) * 2), 0, 1)
      return cellRow * 2 * COLS + col
    }
    const halfRow = clamp(
      Math.floor((y / rect.height) * HALF_ROWS),
      0,
      HALF_ROWS - 1
    )
    return halfRow * COLS + col
  }

  const resolveTarget = (w: PlacedWidget, target: number): Resolution => {
    const targetSlots = w.size === "full" ? [target, target + COLS] : [target]
    const others = new Set<PlacedWidget>()
    for (const s of targetSlots) {
      const o = occupancy.get(s)
      if (o && o.id !== w.id) others.add(o)
    }
    if (others.size === 0) return { kind: "empty" }
    if (others.size === 1) {
      const other = [...others][0]
      if (other.size === w.size) return { kind: "swap", other }
    }
    return { kind: "blocked" }
  }

  const applyMove = (w: PlacedWidget, target: number) =>
    onChange(
      items.map((it) => (it.id === w.id ? { ...it, slot: target } : it))
    )

  const applySwap = (w: PlacedWidget, other: PlacedWidget) =>
    onChange(
      items.map((it) =>
        it.id === w.id
          ? { ...it, slot: other.slot }
          : it.id === other.id
            ? { ...it, slot: w.slot }
            : it
      )
    )

  const handleDrag = (w: PlacedWidget) => (_: unknown, info: PanInfo) => {
    const target = slotFromPointer(w, info)
    if (target == null || target === w.slot) {
      setHoverSlot(null)
      return
    }
    const res = resolveTarget(w, target)
    if (res.kind === "empty") {
      // Don't commit yet — highlight the empty cell; the drop commits it.
      setHoverSlot(target)
    } else {
      setHoverSlot(null)
      // iOS displacement: the occupant slides into the dragged widget's cell.
      if (res.kind === "swap") applySwap(w, res.other)
    }
  }

  const handleDragEnd = (w: PlacedWidget) => () => {
    setDraggingId(null)
    if (hoverSlot != null) applyMove(w, hoverSlot)
    setHoverSlot(null)
    setSettling((s) => new Set(s).add(w.id))
  }

  const handleKeyDown = (w: PlacedWidget) => (e: React.KeyboardEvent) => {
    if (!editing) return
    const col = w.slot % COLS
    const rowStep = w.size === "full" ? 2 * COLS : COLS
    let target: number | null = null
    if (e.key === "ArrowLeft" && col > 0) target = w.slot - 1
    else if (e.key === "ArrowRight" && col < COLS - 1) target = w.slot + 1
    else if (e.key === "ArrowUp") target = w.slot - rowStep
    else if (e.key === "ArrowDown") target = w.slot + rowStep
    if (target == null) return
    e.preventDefault()
    const lastSlot = w.size === "full" ? SLOT_COUNT - COLS : SLOT_COUNT
    if (target < 0 || target >= lastSlot) return
    const def = getWidget(w.id)
    const res = resolveTarget(w, target)
    if (res.kind === "empty") {
      applyMove(w, target)
      setAnnouncement(`${def?.title ?? "Widget"} moved`)
    } else if (res.kind === "swap") {
      applySwap(w, res.other)
      setAnnouncement(
        `${def?.title ?? "Widget"} swapped with ${getWidget(res.other.id)?.title ?? "widget"}`
      )
    }
  }

  const canGrow = (w: PlacedWidget) => {
    if (w.size === "full") return true
    const isTop = Math.floor(w.slot / COLS) % 2 === 0
    const partner = isTop ? w.slot + COLS : w.slot - COLS
    const occupant = occupancy.get(partner)
    return !occupant || occupant.id === w.id
  }

  const toggleSize = (w: PlacedWidget) => {
    if (w.size === "full") {
      onChange(
        items.map((it) => (it.id === w.id ? { ...it, size: "half" } : it))
      )
      return
    }
    if (!canGrow(w)) return
    const isTop = Math.floor(w.slot / COLS) % 2 === 0
    const top = isTop ? w.slot : w.slot - COLS
    onChange(
      items.map((it) =>
        it.id === w.id ? { ...it, slot: top, size: "full" } : it
      )
    )
  }

  // Vacant half-slots, with vertical pairs merged into one full dotted cell.
  const occupiedSet = new Set(items.flatMap(slotsOf))
  const emptyCells: { slot: number; span: 1 | 2 }[] = []
  for (let cellRow = 0; cellRow < 2; cellRow++) {
    for (let col = 0; col < COLS; col++) {
      const top = cellRow * 2 * COLS + col
      const bottom = top + COLS
      const topFree = !occupiedSet.has(top)
      const bottomFree = !occupiedSet.has(bottom)
      if (topFree && bottomFree) emptyCells.push({ slot: top, span: 2 })
      else if (topFree) emptyCells.push({ slot: top, span: 1 })
      else if (bottomFree) emptyCells.push({ slot: bottom, span: 1 })
    }
  }

  return (
    <div
      ref={gridRef}
      role="list"
      aria-label="Dashboard widgets"
      className="flex min-h-full flex-col gap-4 p-4 select-none md:grid md:grid-cols-4 md:grid-rows-[repeat(4,minmax(5.25rem,8.5rem))] md:content-center"
    >
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((w) => {
          const def = getWidget(w.id)
          if (!def) return null
          const Widget = def.component
          const jiggling = editing && draggingId !== w.id
          // iOS-style jiggle: every widget gets its own amplitude, period and
          // phase from its id, so they drift apart instead of swinging as one.
          const wobble = jiggleOf(w.id)
          return (
            <motion.div
              key={w.id}
              role="listitem"
              tabIndex={0}
              aria-roledescription={editing ? "Draggable widget" : undefined}
              aria-label={def.title}
              onKeyDown={handleKeyDown(w)}
              style={placeStyle(w.slot, w.size === "full" ? 2 : 1)}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: jiggling ? [-wobble.tilt, wobble.tilt] : 0,
                y: jiggling ? [-wobble.lift, wobble.lift] : 0,
              }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
              transition={{
                ...reflowSpring,
                rotate: jiggling
                  ? {
                      duration: wobble.period,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                      delay: wobble.delay,
                    }
                  : { duration: 0.18, ease: "easeOut" },
                y: jiggling
                  ? {
                      duration: wobble.period * 1.35,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                      delay: wobble.delay / 2,
                    }
                  : { duration: 0.18, ease: "easeOut" },
              }}
              drag={editing}
              dragConstraints={gridRef}
              dragElastic={0.12}
              dragMomentum={false}
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 320, bounceDamping: 28 }}
              whileDrag={{
                scale: 1.04,
                boxShadow: "0 16px 32px -12px rgb(0 0 0 / 0.25)",
              }}
              onDragStart={() => setDraggingId(w.id)}
              onDrag={handleDrag(w)}
              onDragEnd={handleDragEnd(w)}
              onDragTransitionEnd={() =>
                setSettling((s) => {
                  if (!s.has(w.id)) return s
                  const next = new Set(s)
                  next.delete(w.id)
                  return next
                })
              }
              className={cn(
                "relative min-h-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-md:min-h-44",
                editing && "cursor-grab",
                draggingId === w.id && "z-20 cursor-grabbing",
                settling.has(w.id) && "z-10"
              )}
            >
              <Widget compact={w.size === "half"} />
              {editing && (
                <>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label={`Remove ${def.title}`}
                          onClick={() => onRemove(w.id)}
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          className="absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md transition-colors outline-none animate-in fade-in-0 zoom-in-50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                      }
                    >
                      <X className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label={
                            w.size === "full"
                              ? `Shrink ${def.title}`
                              : `Expand ${def.title}`
                          }
                          disabled={!canGrow(w)}
                          onClick={() => toggleSize(w)}
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          className="absolute -top-2 -left-2 z-10 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md transition-colors outline-none animate-in fade-in-0 zoom-in-50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:text-muted-foreground"
                        />
                      }
                    >
                      {w.size === "full" ? (
                        <RectangleHorizontal className="size-3.5" />
                      ) : (
                        <Square className="size-3" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {w.size === "full" ? "Shrink" : "Expand"}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {emptyCells.map(({ slot, span }) => {
        const active =
          draggingId != null &&
          hoverSlot != null &&
          (hoverSlot === slot || (span === 2 && hoverSlot === slot + COLS))
        return (
          <button
            key={`empty-${slot}`}
            type="button"
            onClick={onAddRequest}
            aria-label="Add widget"
            style={placeStyle(slot, span)}
            className={cn(
              "flex min-h-0 items-center justify-center rounded-2xl border-2 border-dotted text-muted-foreground/40 max-md:min-h-24 max-md:not-first:hidden transition-colors outline-none hover:border-muted-foreground/40 hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              active && "border-primary/70 bg-primary/5 text-primary"
            )}
          >
            <Plus className="size-5" />
          </button>
        )
      })}
    </div>
  )
}
