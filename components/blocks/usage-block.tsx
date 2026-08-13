"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function UsageBlock({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Storage &amp; sync</CardTitle>
        <CardDescription>Data your widgets keep on this plan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Progress value={68}>
            <ProgressLabel>Storage used</ProgressLabel>
            <ProgressValue />
          </Progress>
          <p className="text-xs text-muted-foreground">
            6.8 GB of 10 GB — snapshots, uploads and widget caches.
          </p>
        </div>
        <Separator />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />
          Syncing widget data…
          <span className="ml-auto text-xs tabular-nums">12 of 14 sources</span>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            While a widget loads
          </p>
          <div className="rounded-(--radius) border p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="ml-auto h-3.5 w-10" />
            </div>
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-2 h-3 w-3/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
