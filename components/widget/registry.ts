import type { ComponentType } from "react"

import { ActiveUsersWidget } from "@/components/widget/active-users-widget"
import { ApiUsageWidget } from "@/components/widget/api-usage-widget"
import { AuditLogWidget } from "@/components/widget/audit-log-widget"
import { AuthLogsWidget } from "@/components/widget/auth-logs-widget"
import { CampaignsWidget } from "@/components/widget/campaigns-widget"
import { ClockWidget } from "@/components/widget/clock-widget"
import { ErrorLogsWidget } from "@/components/widget/error-logs-widget"
import { LoginCountWidget } from "@/components/widget/login-count-widget"
import { PaymentLogsWidget } from "@/components/widget/payment-logs-widget"
import { RevenueWidget } from "@/components/widget/revenue-widget"
import { TrafficWidget } from "@/components/widget/traffic-widget"
import { TransfersWidget } from "@/components/widget/transfers-widget"

export const ROLES = [
  "Admin",
  "Finance",
  "Marketing",
  "Developer",
  "Support",
] as const

export type Role = (typeof ROLES)[number]

// The board is 4 columns x 2 cells; every cell splits into a top and bottom
// half-slot, addressed 0-15 as halfRow * 4 + col. A "full" widget occupies a
// cell (its top half-slot s plus s + 4); a "half" widget occupies one half-slot.
export const GRID_COLS = 4
export const HALF_ROWS = 4
export const SLOT_COUNT = GRID_COLS * HALF_ROWS

export type WidgetSize = "full" | "half"

export type PlacedWidget = {
  id: string
  slot: number
  size: WidgetSize
}

export function slotsOf(w: PlacedWidget): number[] {
  return w.size === "full" ? [w.slot, w.slot + GRID_COLS] : [w.slot]
}

export type WidgetDef = {
  id: string
  title: string
  description: string
  roles: readonly Role[] | "all"
  component: ComponentType<{ compact?: boolean }>
}

export const WIDGETS: WidgetDef[] = [
  {
    id: "clock",
    title: "Clock & Date",
    description: "Time, today and this week at a glance.",
    roles: "all",
    component: ClockWidget,
  },
  {
    id: "login-count",
    title: "Sign-ins",
    description: "Successful sign-ins today, hour by hour.",
    roles: ["Admin", "Developer", "Support"],
    component: LoginCountWidget,
  },
  {
    id: "auth-logs",
    title: "Auth activity",
    description: "Latest login and registration events.",
    roles: ["Admin", "Developer", "Support"],
    component: AuthLogsWidget,
  },
  {
    id: "payment-logs",
    title: "Payments",
    description: "Latest card and transfer payments.",
    roles: ["Admin", "Finance"],
    component: PaymentLogsWidget,
  },
  {
    id: "revenue",
    title: "Revenue",
    description: "Today's revenue and the weekly trend.",
    roles: ["Admin", "Finance", "Marketing"],
    component: RevenueWidget,
  },
  {
    id: "error-logs",
    title: "Error log",
    description: "Recent exceptions across services.",
    roles: ["Developer"],
    component: ErrorLogsWidget,
  },
  {
    id: "api-usage",
    title: "API usage",
    description: "Request volume and latency.",
    roles: ["Admin", "Developer"],
    component: ApiUsageWidget,
  },
  {
    id: "active-users",
    title: "Active users",
    description: "Sessions online right now.",
    roles: ["Admin", "Marketing", "Support"],
    component: ActiveUsersWidget,
  },
  {
    id: "campaigns",
    title: "Campaigns",
    description: "Running campaigns and conversion.",
    roles: ["Marketing"],
    component: CampaignsWidget,
  },
  {
    id: "traffic",
    title: "Traffic",
    description: "Visitors today and top referrers.",
    roles: ["Marketing"],
    component: TrafficWidget,
  },
  {
    id: "audit-log",
    title: "Audit log",
    description: "Recent admin actions.",
    roles: ["Admin"],
    component: AuditLogWidget,
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Pending transfers awaiting approval.",
    roles: ["Finance", "Support"],
    component: TransfersWidget,
  },
]

export const DEFAULT_LAYOUTS: Record<Role, PlacedWidget[]> = {
  // Every role opens on full-size widgets: the top row fills slots 0-3, the
  // second row 8-11 (a full widget covers its slot and the one below it).
  Admin: [
    { id: "clock", slot: 0, size: "full" },
    { id: "revenue", slot: 1, size: "full" },
    { id: "login-count", slot: 2, size: "full" },
    { id: "auth-logs", slot: 3, size: "full" },
    { id: "payment-logs", slot: 8, size: "full" },
    { id: "active-users", slot: 9, size: "full" },
    { id: "api-usage", slot: 10, size: "full" },
    { id: "audit-log", slot: 11, size: "full" },
  ],
  Finance: [
    { id: "clock", slot: 0, size: "full" },
    { id: "revenue", slot: 1, size: "full" },
    { id: "payment-logs", slot: 2, size: "full" },
    { id: "transfers", slot: 3, size: "full" },
  ],
  Marketing: [
    { id: "clock", slot: 0, size: "full" },
    { id: "active-users", slot: 1, size: "full" },
    { id: "campaigns", slot: 2, size: "full" },
    { id: "revenue", slot: 3, size: "full" },
    { id: "traffic", slot: 8, size: "full" },
  ],
  Developer: [
    { id: "clock", slot: 0, size: "full" },
    { id: "api-usage", slot: 1, size: "full" },
    { id: "error-logs", slot: 2, size: "full" },
    { id: "login-count", slot: 3, size: "full" },
    { id: "auth-logs", slot: 8, size: "full" },
  ],
  Support: [
    { id: "clock", slot: 0, size: "full" },
    { id: "auth-logs", slot: 1, size: "full" },
    { id: "active-users", slot: 2, size: "full" },
    { id: "transfers", slot: 3, size: "full" },
  ],
}

export function widgetsForRole(role: Role): WidgetDef[] {
  return WIDGETS.filter((w) => w.roles === "all" || w.roles.includes(role))
}

export function getWidget(id: string): WidgetDef | undefined {
  return WIDGETS.find((w) => w.id === id)
}
