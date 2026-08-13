"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { ThemePreferences } from "@/components/theme-preferences"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Slots are DOM nodes, not state: pages portal into them, so the shell — the
 * page card, the top bar and the dock — mounts once and survives navigation
 * instead of re-rendering on every route change.
 */
type Slots = {
  headerActions: HTMLElement | null
  headerCenter: HTMLElement | null
  detailPanel: HTMLElement | null
}

const SlotsContext = React.createContext<Slots>({
  headerActions: null,
  headerCenter: null,
  detailPanel: null,
})

function useSlot(name: keyof Slots) {
  return React.use(SlotsContext)[name]
}

/** Renders `children` into one of the shell's slots once it exists. */
function SlotPortal({
  name,
  children,
}: {
  name: keyof Slots
  children: React.ReactNode
}) {
  const target = useSlot(name)
  return target ? createPortal(children, target) : null
}

/** Page-specific buttons on the right of the top bar (before Preferences). */
export function HeaderActions({ children }: { children: React.ReactNode }) {
  return <SlotPortal name="headerActions">{children}</SlotPortal>
}

/** Absolutely centered top-bar content, e.g. the Blocks install command. */
export function HeaderCenter({ children }: { children: React.ReactNode }) {
  return <SlotPortal name="headerCenter">{children}</SlotPortal>
}

/** The full-height column beside the page content — the table's row panel. */
export function DetailPanel({ children }: { children: React.ReactNode }) {
  return <SlotPortal name="detailPanel">{children}</SlotPortal>
}

function PageLabel() {
  const pathname = usePathname()

  if (pathname === "/") {
    return <span className="font-accent text-sm font-medium">Home</span>
  }

  const page = pathname.startsWith("/blocks") ? "Blocks" : "Table"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-accent">{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [headerActions, setHeaderActions] = React.useState<HTMLElement | null>(
    null
  )
  const [headerCenter, setHeaderCenter] = React.useState<HTMLElement | null>(
    null
  )
  const [detailPanel, setDetailPanel] = React.useState<HTMLElement | null>(null)

  const slots = React.useMemo(
    () => ({ headerActions, headerCenter, detailPanel }),
    [headerActions, headerCenter, detailPanel]
  )

  return (
    <SlotsContext value={slots}>
      <div className="h-full bg-muted p-6">
        <main className="flex h-full overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="relative flex shrink-0 items-center justify-between gap-2 border-b bg-background px-4 py-3">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle sidebar"
                      />
                    }
                  >
                    <PanelLeft />
                  </TooltipTrigger>
                  <TooltipContent>Toggle sidebar</TooltipContent>
                </Tooltip>
                <PageLabel />
              </div>
              <div ref={setHeaderCenter} className="contents" />
              <div className="flex items-center gap-2">
                <div ref={setHeaderActions} className="contents" />
                <ThemePreferences />
                <ModeToggle />
              </div>
            </header>
            {children}
          </div>
          {/* display:contents keeps the portal wrapper out of the layout, so
              the panel is a real flex sibling of the content column. */}
          <div ref={setDetailPanel} className="contents" />
        </main>
      </div>
    </SlotsContext>
  )
}
