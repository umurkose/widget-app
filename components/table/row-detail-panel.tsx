"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  Activity,
  CircleUser,
  Clock,
  CreditCard,
  Gauge,
  Info,
  Paperclip,
  PanelBottom,
  PanelRight,
  ShieldCheck,
  StickyNote,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { type Transaction } from "@/components/table/data"
import { TabPanel, type Tab } from "@/components/table/tab-panels"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DEFAULT_WIDTH = 340
const MIN_WIDTH = 280
const RESIZE_STEP = 24

/** Never wider than half the window, never narrower than MIN_WIDTH. */
function clampWidth(width: number) {
  const max = Math.max(
    MIN_WIDTH,
    Math.round((typeof window === "undefined" ? 1440 : window.innerWidth) / 2)
  )
  return Math.min(Math.max(width, MIN_WIDTH), max)
}

const TABS = [
  { key: "Overview", icon: Info },
  { key: "Activity", icon: Activity },
  { key: "Payment", icon: CreditCard },
  { key: "Customer", icon: CircleUser },
  { key: "Usage", icon: Gauge },
  { key: "Tags", icon: Tag },
  { key: "Timeline", icon: Clock },
  { key: "Notes", icon: StickyNote },
  { key: "Files", icon: Paperclip },
  { key: "Audit", icon: ShieldCheck },
] as const satisfies readonly { key: Tab; icon: LucideIcon }[]

export type PanelPlacement = "side" | "bottom"

export function RowDetailPanel({
  row,
  related,
  onClose,
  placement,
  onPlacementChange,
}: {
  row: Transaction | null
  related: Transaction[]
  onClose: () => void
  placement: PanelPlacement
  onPlacementChange: (next: PanelPlacement) => void
}) {
  const reducedMotion = useReducedMotion()
  const [tab, setTab] = React.useState<Tab>("Overview")
  const [shownId, setShownId] = React.useState(row?.id)
  const [width, setWidth] = React.useState(DEFAULT_WIDTH)
  const [resizing, setResizing] = React.useState(false)
  const drag = React.useRef<{ startX: number; startWidth: number } | null>(null)

  // Every row opens on its own terms — start each one at the summary.
  if (row && row.id !== shownId) {
    setShownId(row.id)
    setTab("Overview")
  }

  // Esc closes the panel, unless a dialog or popover owns the key first.
  React.useEffect(() => {
    if (!row) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
      onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [row, onClose])

  // Drag tracking lives on the window, not the handle: pointer capture can be
  // lost mid-drag, and a missed pointerup would leave the panel resizing after
  // the button is already released.
  React.useEffect(() => {
    if (!resizing) return
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return
      setWidth(
        clampWidth(drag.current.startWidth + (drag.current.startX - e.clientX))
      )
    }
    const stop = () => {
      drag.current = null
      setResizing(false)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    window.addEventListener("blur", stop)
    const previousSelect = document.body.style.userSelect
    const previousCursor = document.body.style.cursor
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      window.removeEventListener("blur", stop)
      document.body.style.userSelect = previousSelect
      document.body.style.cursor = previousCursor
    }
  }, [resizing])

  // A shrinking window can leave the panel past the half-width ceiling.
  React.useEffect(() => {
    const onResize = () => setWidth((w) => clampWidth(w))
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (!row) {
    return <AnimatePresence initial={false} />
  }

  const header = (
    /* Same padding and control size as the page header so both bottom
       borders land on one line. */
    <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3">
      <div className="min-w-0">
        <p className="font-mono text-[11px] leading-tight text-muted-foreground">
          {row.id}
        </p>
        <p className="truncate text-sm leading-tight font-medium">
          {row.user.name}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  placement === "side"
                    ? "Open details below the table"
                    : "Open details beside the table"
                }
                onClick={() =>
                  onPlacementChange(placement === "side" ? "bottom" : "side")
                }
              />
            }
          >
            {placement === "side" ? <PanelBottom /> : <PanelRight />}
          </TooltipTrigger>
          <TooltipContent>
            {placement === "side" ? "Dock to bottom" : "Dock to side"}
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close details"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
    </div>
  )

  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="flex flex-wrap content-start items-start gap-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex h-6 shrink-0 items-center gap-1 rounded-(--radius-control) px-1.5 text-[11px] leading-none font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon aria-hidden className="size-3 shrink-0" />
            {key}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <TabPanel tab={tab} row={row} related={related} />
      </div>
    </div>
  )

  const spring = reducedMotion
    ? { duration: 0 }
    : ({ type: "spring", bounce: 0, duration: 0.4 } as const)

  // Docked below the table: the section grows like an accordion and the page
  // scrolls down to it, so a sliver stays in view under the grid.
  if (placement === "bottom") {
    return (
      <motion.aside
        aria-label={`Details for ${row.id}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "100%", opacity: 1 }}
        transition={spring}
        className="w-full shrink-0 overflow-hidden border-t bg-background"
      >
        <div className="flex h-full flex-col">
          {header}
          {body}
        </div>
      </motion.aside>
    )
  }

  return (
    <motion.aside
      aria-label={`Details for ${row.id}`}
      initial={{ width: 0 }}
      animate={{ width }}
      exit={{ width: 0 }}
      transition={resizing ? { duration: 0 } : spring}
      className="relative shrink-0 overflow-hidden border-l bg-background"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize details panel"
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.preventDefault()
          drag.current = { startX: e.clientX, startWidth: width }
          setResizing(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setWidth((w) => clampWidth(w + RESIZE_STEP))
          else if (e.key === "ArrowRight")
            setWidth((w) => clampWidth(w - RESIZE_STEP))
          else return
          e.preventDefault()
        }}
        className={cn(
          "absolute inset-y-0 left-0 z-20 w-1.5 cursor-col-resize touch-none transition-colors outline-none hover:bg-primary/30 focus-visible:bg-primary/40",
          resizing && "bg-primary/40"
        )}
      />
      {/* Explicit width so the content never reflows while the panel moves. */}
      <div className="flex h-full flex-col" style={{ width }}>
        {header}
        {body}
      </div>
    </motion.aside>
  )
}
