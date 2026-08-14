"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Blocks, House, Table } from "lucide-react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { Dock, DockIcon } from "@/components/ui/dock"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Each destination keeps its own accent while active — the same green the
// table's Export button uses, so the dock reads as part of the page.
const items = [
  {
    href: "/",
    label: "Home",
    icon: House,
    activeClass: "text-blue-600 dark:text-blue-400",
  },
  {
    href: "/blocks",
    label: "Blocks",
    icon: Blocks,
    activeClass: "text-violet-600 dark:text-violet-400",
  },
  {
    href: "/table",
    label: "Table",
    icon: Table,
    activeClass: "text-green-600 dark:text-green-500",
  },
]

/** "/table" stays active on "/table/<slug>"; "/" only matches itself. */
function isActiveHref(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function AppDock() {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const dockRef = React.useRef<HTMLDivElement>(null)
  const iconRefs = React.useRef(new Map<string, HTMLSpanElement | null>())
  const settledRef = React.useRef(false)

  // Liquid indicator: a round bg-muted disc behind the active icon. A spring
  // chases the icon's center, re-measured every frame so it stays glued
  // through magnification and resizes; its diameter follows the icon's
  // current size. Stretch comes from the spring's own velocity — it
  // elongates mid-flight and relaxes back into a circle as it settles.
  const targetX = useMotionValue(0)
  const centerY = useMotionValue(0)
  const targetSize = useMotionValue(40)
  const springX = useSpring(targetX, { stiffness: 520, damping: 30 })
  const springSize = useSpring(targetSize, { stiffness: 600, damping: 40 })
  // True only while the indicator is travelling to a newly active icon.
  const sliding = React.useRef(false)
  const lastPath = React.useRef(pathname)
  const velocity = useVelocity(springX)
  const stretch = useTransform(velocity, (v) =>
    Math.min(Math.abs(v) / 1600, 0.5)
  )
  const scaleX = useTransform(stretch, (s) => 1 + s)
  const scaleY = useTransform(stretch, (s) => 1 / (1 + s * 0.55))
  const x = useTransform(
    [springX, springSize] as const,
    ([cx, size]: number[]) => cx - size / 2
  )
  const y = useTransform(
    [centerY, springSize] as const,
    ([cy, size]: number[]) => cy - size / 2
  )
  const opacity = useMotionValue(0)

  useAnimationFrame(() => {
    const dock = dockRef.current
    const active = items.find((item) => isActiveHref(pathname, item.href))
    const icon = active ? iconRefs.current.get(active.href) : null
    if (!dock || !icon) return

    const dockBounds = dock.getBoundingClientRect()
    // The span fills the DockIcon box, so its rect is the icon's frame. Its
    // wrapper holds only an absolutely-positioned link and measures 0x0.
    const iconBounds = icon.getBoundingClientRect()
    // Absolute children sit inside the dock's border, so discount it.
    const cx =
      iconBounds.left + iconBounds.width / 2 - dockBounds.left - dock.clientLeft
    const cy =
      iconBounds.top + iconBounds.height / 2 - dockBounds.top - dock.clientTop

    centerY.set(cy)
    // Size tracks the icon exactly — springing it too would make the
    // indicator breathe a frame behind every magnification.
    targetSize.jump(iconBounds.width)
    springSize.jump(iconBounds.width)

    if (pathname !== lastPath.current) {
      lastPath.current = pathname
      sliding.current = settledRef.current && !reducedMotion
    }

    if (sliding.current) {
      targetX.set(cx)
      if (Math.abs(springX.get() - cx) < 0.5) sliding.current = false
    } else {
      // Not travelling: sit exactly on the icon, so hover magnification can
      // never leave the indicator lagging or jittering behind it.
      targetX.jump(cx)
      springX.jump(cx)
    }

    settledRef.current = true
    opacity.set(1)
  })

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
      <Dock
        ref={dockRef}
        iconMagnification={50}
        iconDistance={110}
        className="pointer-events-auto relative"
      >
        <motion.span
          aria-hidden
          className="absolute top-0 left-0 rounded-(--radius-control) bg-muted"
          style={{ x, y, width: springSize, height: springSize, scaleX, scaleY, opacity }}
        />
        {items.map((item) => {
          const isActive = isActiveHref(pathname, item.href)
          const Icon = item.icon

          return (
            <DockIcon
              key={item.href}
              className="rounded-(--radius-control)"
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "absolute inset-0 rounded-(--radius-control) transition-colors",
                        isActive
                          ? item.activeClass
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    />
                  }
                >
                  <span
                    ref={(el) => {
                      iconRefs.current.set(item.href, el)
                    }}
                    className="flex size-full items-center justify-center"
                  >
                    <Icon className="size-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            </DockIcon>
          )
        })}
      </Dock>
    </div>
  )
}
