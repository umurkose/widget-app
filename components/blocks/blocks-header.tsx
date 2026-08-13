"use client"

import { HeaderCenter } from "@/components/app-shell"

/** The install command, centred in the shell's top bar. */
export function BlocksHeaderChip() {
  return (
    <HeaderCenter>
      <code className="absolute top-1/2 left-1/2 flex h-8 -translate-x-1/2 -translate-y-1/2 items-center rounded-(--radius-control) border bg-transparent px-2.5 font-mono text-xs text-muted-foreground select-all max-md:hidden">
        npx @sirketismi/ui
      </code>
    </HeaderCenter>
  )
}
