"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type Period = "monthly" | "yearly"

const PLANS = [
  {
    id: "free",
    label: "Free",
    description: "1 board, 6 widgets, community support.",
    monthly: "$0",
    yearly: "$0",
  },
  {
    id: "pro",
    label: "Pro",
    description: "Unlimited widgets, hourly refresh, API access.",
    monthly: "$12",
    yearly: "$115",
    current: true,
  },
  {
    id: "team",
    label: "Team",
    description: "Shared boards, roles, audit log, SSO.",
    monthly: "$32",
    yearly: "$307",
  },
] as const

function PlanOptions({
  period,
  plan,
  onPlanChange,
}: {
  period: Period
  plan: string
  onPlanChange: (plan: string) => void
}) {
  return (
    <RadioGroup
      value={plan}
      onValueChange={(value) => onPlanChange(value as string)}
      className="gap-3"
    >
      {PLANS.map((option) => {
        const id = `plan-${option.id}-${period}`
        return (
          <Field key={option.id} orientation="horizontal">
            <RadioGroupItem value={option.id} id={id} />
            <FieldContent>
              <FieldLabel htmlFor={id} className="items-center gap-1.5">
                {option.label}
                {"current" in option && option.current && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </FieldLabel>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
            <span className="text-sm font-medium tabular-nums">
              {period === "monthly" ? option.monthly : option.yearly}
              <span className="font-normal text-muted-foreground">
                {period === "monthly" ? "/mo" : "/yr"}
              </span>
            </span>
          </Field>
        )
      })}
    </RadioGroup>
  )
}

export function BillingBlock({ className }: { className?: string }) {
  const [period, setPeriod] = React.useState<Period>("monthly")
  const [plan, setPlan] = React.useState("pro")

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>
          Billing for this workspace. Yearly saves two months.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
        >
          <TabsList variant="line" className="mb-4 w-full">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <PlanOptions period="monthly" plan={plan} onPlanChange={setPlan} />
          </TabsContent>
          <TabsContent value="yearly">
            <PlanOptions period="yearly" plan={plan} onPlanChange={setPlan} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button className="w-full" disabled={plan === "pro"}>
          {plan === "pro" ? "Current plan" : "Update plan"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Next invoice on Sep 1, 2026.
        </p>
      </CardFooter>
    </Card>
  )
}
