"use client"

import Link from "next/link"

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

export function BlocksHeader() {
  return (
    <header className="relative flex shrink-0 items-center justify-between gap-2 border-b bg-background px-4 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Blocks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
