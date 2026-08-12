"use client"

import * as React from "react"
import { MotionConfig } from "motion/react"
import { Check, LayoutGrid, ListFilter, PanelLeft, Plus, X } from "lucide-react"

import { AddWidgetDialog } from "@/components/add-widget-dialog"
import { FiltersBar } from "@/components/filters-bar"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemePreferences } from "@/components/theme-preferences"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  FiltersProvider,
  type Filters,
} from "@/components/widget/filters"
import { WidgetGrid } from "@/components/widget/widget-grid"
import {
  DEFAULT_LAYOUTS,
  GRID_COLS,
  ROLES,
  SLOT_COUNT,
  slotsOf,
  type PlacedWidget,
  type Role,
} from "@/components/widget/registry"

export function Dashboard() {
  const [role, setRole] = React.useState<Role>("Admin")
  const [layouts, setLayouts] = React.useState(DEFAULT_LAYOUTS)
  const [editing, setEditing] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS)
  const snapshotRef = React.useRef<PlacedWidget[] | null>(null)

  const placement = layouts[role]
  const setPlacement = React.useCallback(
    (next: PlacedWidget[]) =>
      setLayouts((prev) => ({ ...prev, [role]: next })),
    [role]
  )

  const isDirty = () =>
    snapshotRef.current != null &&
    JSON.stringify(snapshotRef.current) !== JSON.stringify(placement)

  const enterEdit = () => {
    snapshotRef.current = placement
    setEditing(true)
  }

  const saveEdit = React.useCallback(() => {
    snapshotRef.current = null
    setEditing(false)
    setPickerOpen(false)
    setConfirmOpen(false)
  }, [])

  const discardEdit = React.useCallback(() => {
    if (snapshotRef.current) setPlacement(snapshotRef.current)
    snapshotRef.current = null
    setEditing(false)
    setPickerOpen(false)
    setConfirmOpen(false)
  }, [setPlacement])

  // Close / Esc: ask before throwing away unsaved changes.
  const requestClose = React.useCallback(() => {
    if (isDirty()) setConfirmOpen(true)
    else discardEdit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discardEdit, placement])

  // Esc leaves edit mode — unless a dialog is open (its own Esc wins).
  React.useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pickerOpen && !confirmOpen) requestClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editing, pickerOpen, confirmOpen, requestClose])

  const changeRole = (next: Role) => {
    if (editing) saveEdit()
    setRole(next)
  }

  // First spot that fits: a fully free cell for a full widget, else any free half.
  const addWidget = (id: string) => {
    const occupied = new Set(placement.flatMap(slotsOf))
    for (let cellRow = 0; cellRow < 2; cellRow++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const top = cellRow * 2 * GRID_COLS + col
        if (!occupied.has(top) && !occupied.has(top + GRID_COLS)) {
          setPlacement([...placement, { id, slot: top, size: "full" }])
          return
        }
      }
    }
    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      if (!occupied.has(slot)) {
        setPlacement([...placement, { id, slot, size: "half" }])
        return
      }
    }
  }

  const boardFull = placement.flatMap(slotsOf).length >= SLOT_COUNT

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-2 rounded-t-2xl border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Toggle sidebar" />
              }
            >
              <PanelLeft />
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
          <NativeSelect
            aria-label="Role"
            value={role}
            onChange={(e) => changeRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <NativeSelectOption key={r} value={r}>
                {r}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            variant={filtersOpen ? "secondary" : "ghost"}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <ListFilter data-icon="inline-start" /> Filters
            {countActiveFilters(filters) > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                {countActiveFilters(filters)}
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div
              key="editing"
              className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-2"
            >
              <span className="mr-1 hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
                <Kbd>Esc</Kbd> to close
              </span>
              <Button variant="outline" onClick={() => setPickerOpen(true)}>
                <LayoutGrid data-icon="inline-start" /> Widgets
              </Button>
              <Button variant="outline" onClick={requestClose}>
                <X data-icon="inline-start" /> Close
              </Button>
              <Button onClick={saveEdit}>
                <Check data-icon="inline-start" /> Save
              </Button>
            </div>
          ) : (
            <div
              key="viewing"
              className="flex items-center animate-in fade-in-0 slide-in-from-right-2"
            >
              <Button onClick={enterEdit}>
                <Plus data-icon="inline-start" /> Widget
              </Button>
            </div>
          )}
          <ThemePreferences />
          <ModeToggle />
        </div>
      </header>
      <FiltersBar open={filtersOpen} filters={filters} onChange={setFilters} />
      <FiltersProvider value={filters}>
        <WidgetGrid
          items={placement}
          onChange={setPlacement}
          editing={editing}
          onRemove={(id) => setPlacement(placement.filter((w) => w.id !== id))}
          onAddRequest={() => {
            if (!editing) enterEdit()
            setPickerOpen(true)
          }}
        />
      </FiltersProvider>
      <AddWidgetDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        role={role}
        added={placement.map((w) => w.id)}
        isFull={boardFull}
        onAdd={addWidget}
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this board. If you close now, the
              layout will go back to how it was.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={discardEdit}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MotionConfig>
  )
}
