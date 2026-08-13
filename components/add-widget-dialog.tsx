"use client"

import { LayoutGrid, Plus } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { widgetsForRole, type Role } from "@/components/widget/registry"

export function AddWidgetDialog({
  open,
  onOpenChange,
  role,
  added,
  isFull,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
  added: string[]
  isFull: boolean
  onAdd: (id: string) => void
}) {
  const available = widgetsForRole(role).filter((w) => !added.includes(w.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Widgets</DialogTitle>
          <DialogDescription>
            {isFull
              ? "The board is full — remove or shrink a widget to make room."
              : `Tap a widget to add it to the ${role} board.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-80 gap-2 overflow-y-auto">
          {available.map((w) => (
            <button
              key={w.id}
              type="button"
              disabled={isFull}
              onClick={() => onAdd(w.id)}
              className="group flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="min-w-0">
                <span className="font-heading block text-sm font-medium">{w.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {w.description}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background group-disabled:group-hover:bg-transparent group-disabled:group-hover:text-muted-foreground"
              >
                <Plus className="size-3.5" />
              </span>
            </button>
          ))}
          {available.length === 0 && (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LayoutGrid />
                </EmptyMedia>
                <EmptyTitle>Board is complete</EmptyTitle>
                <EmptyDescription>
                  Every {role} widget is already on the board. Remove one to
                  free a slot.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
