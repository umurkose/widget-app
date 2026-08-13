"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

export function PreferencesBlock({ className }: { className?: string }) {
  const [refreshEvery, setRefreshEvery] = React.useState(30)
  const [opacity, setOpacity] = React.useState(85)

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Board preferences</CardTitle>
        <CardDescription>
          Defaults applied to every board in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <Field>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <FieldLabel>Auto-refresh interval</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="About auto-refresh"
                    />
                  }
                >
                  <CircleHelp />
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <PopoverHeader>
                    <PopoverTitle>About auto-refresh</PopoverTitle>
                    <PopoverDescription>
                      Widgets poll their data source at this interval. Shorter
                      intervals feel more live but use more of your API quota.
                    </PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>
            </span>
            <span className="text-sm font-medium tabular-nums">
              {refreshEvery}s
            </span>
          </div>
          <Slider
            aria-label="Auto-refresh interval"
            min={5}
            max={120}
            step={5}
            value={[refreshEvery]}
            onValueChange={(value) => setRefreshEvery((value as number[])[0])}
          />
          <FieldDescription>
            How often widgets pull fresh data.
          </FieldDescription>
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Widget opacity</FieldLabel>
            <span className="text-sm font-medium tabular-nums">{opacity}%</span>
          </div>
          <Slider
            aria-label="Widget opacity"
            min={40}
            max={100}
            step={5}
            value={[opacity]}
            onValueChange={(value) => setOpacity((value as number[])[0])}
          />
          <FieldDescription>
            Lower it to let the board background show through.
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Members can still override these per board.
        </p>
      </CardFooter>
    </Card>
  )
}
