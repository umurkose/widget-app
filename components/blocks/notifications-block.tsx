"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const TOGGLES = [
  {
    id: "weekly-summary",
    title: "Weekly summary",
    description: "A digest of board activity every Monday morning.",
  },
  {
    id: "usage-alerts",
    title: "Usage alerts",
    description: "When a widget gets close to its API quota.",
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "When a teammate mentions you in a board note.",
  },
] as const

const DIGEST_ITEMS = [
  { id: "digest-widgets", label: "New widgets added to shared boards" },
  { id: "digest-members", label: "Member joins and role changes" },
  { id: "digest-billing", label: "Billing receipts and plan changes" },
] as const

export function NotificationsBlock({ className }: { className?: string }) {
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    "weekly-summary": true,
    "usage-alerts": true,
    mentions: false,
  })
  const [digest, setDigest] = React.useState<Record<string, boolean>>({
    "digest-widgets": true,
    "digest-members": true,
    "digest-billing": false,
  })

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what Widget Board emails you about.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col">
          {TOGGLES.map((row, index) => (
            <React.Fragment key={row.id}>
              {index > 0 && <Separator className="my-3" />}
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={row.id}>{row.title}</FieldLabel>
                  <FieldDescription>{row.description}</FieldDescription>
                </FieldContent>
                <Switch
                  id={row.id}
                  checked={toggles[row.id]}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, [row.id]: checked }))
                  }
                />
              </Field>
            </React.Fragment>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Weekly digest includes</p>
          {DIGEST_ITEMS.map((item) => (
            <Field key={item.id} orientation="horizontal">
              <Checkbox
                id={item.id}
                checked={digest[item.id]}
                onCheckedChange={(checked) =>
                  setDigest((prev) => ({ ...prev, [item.id]: checked === true }))
                }
              />
              <FieldLabel
                htmlFor={item.id}
                className="font-normal text-muted-foreground"
              >
                {item.label}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
