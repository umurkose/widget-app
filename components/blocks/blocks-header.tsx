"use client"

import Link from "next/link"
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

export function BlocksHeader() {
  return (
    <header className="relative flex shrink-0 items-center justify-between gap-2 border-b bg-background px-4 py-3">
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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-accent">Blocks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <code className="absolute top-1/2 left-1/2 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center rounded-(--radius-control) border bg-transparent px-2.5 font-mono text-xs text-muted-foreground select-all max-md:hidden">
        npx @sirketismi/ui
      </code>
      <div className="flex items-center gap-2">
        <ThemePreferences />
        <ModeToggle />
      </div>
    </header>
  )
}
