"use client"

import * as React from "react"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
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
  })
  const [digest, setDigest] = React.useState<Record<string, boolean>>({
    "digest-widgets": true,
    "digest-members": true,
    "digest-billing": false,
  })
  const [frequency, setFrequency] = React.useState("weekly")
  const [open, setOpen] = React.useState(false)

  const includedCount = Object.values(digest).filter(Boolean).length

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what Widget Board emails you about.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" />}>
            <Mail data-icon="inline-start" /> Email preferences
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Email preferences</DialogTitle>
              <DialogDescription>
                Pick how often the digest arrives and what it carries.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="digest-frequency">Frequency</FieldLabel>
              <NativeSelect
                id="digest-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <NativeSelectOption value="daily">Daily</NativeSelectOption>
                <NativeSelectOption value="weekly">Weekly</NativeSelectOption>
                <NativeSelectOption value="monthly">Monthly</NativeSelectOption>
              </NativeSelect>
            </Field>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">The digest includes</p>
              {DIGEST_ITEMS.map((item) => (
                <Field key={item.id} orientation="horizontal">
                  <Checkbox
                    id={item.id}
                    checked={digest[item.id]}
                    onCheckedChange={(checked) =>
                      setDigest((prev) => ({
                        ...prev,
                        [item.id]: checked === true,
                      }))
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
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={() => setOpen(false)}>Save preferences</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="-mt-1 text-xs text-muted-foreground">
          {frequency.charAt(0).toUpperCase() + frequency.slice(1)} digest ·{" "}
          {includedCount} of {DIGEST_ITEMS.length} sections included.
        </p>
        <Separator />
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
      </CardContent>
    </Card>
  )
}
