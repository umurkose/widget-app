"use client"

import * as React from "react"
import { Check } from "lucide-react"

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TIMEZONES = [
  { value: "europe/istanbul", label: "Istanbul (GMT+3)" },
  { value: "europe/london", label: "London (GMT+1)" },
  { value: "europe/berlin", label: "Berlin (GMT+2)" },
  { value: "america/new_york", label: "New York (GMT-4)" },
  { value: "asia/tokyo", label: "Tokyo (GMT+9)" },
]

export function WorkspaceBlock({ className }: { className?: string }) {
  const [name, setName] = React.useState("Acme Insights")
  const [description, setDescription] = React.useState(
    "Live revenue, traffic and ops boards for the Acme growth team."
  )
  const [timezone, setTimezone] = React.useState("europe/istanbul")
  const [saved, setSaved] = React.useState(false)

  const save = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>
          The name and details your team sees across every board.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Insights"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="workspace-description">Description</FieldLabel>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
            />
            <FieldDescription>
              Shown on invites and in the workspace switcher.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="workspace-timezone">Timezone</FieldLabel>
            <Select
              items={TIMEZONES}
              value={timezone}
              onValueChange={(value) => setTimezone(value as string)}
            >
              <SelectTrigger id="workspace-timezone" className="w-full">
                <SelectValue placeholder="Pick a timezone" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  <SelectLabel>Timezone</SelectLabel>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              Clocks and daily rollups follow this timezone.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
          to save
        </span>
        <Button onClick={save}>
          {saved ? (
            <>
              <Check data-icon="inline-start" /> Saved
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
