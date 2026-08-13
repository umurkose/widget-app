"use client"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FAQ = [
  {
    id: "refresh",
    question: "How do widgets refresh?",
    answer:
      "Each widget polls its source at the workspace auto-refresh interval. You can trigger a manual refresh any time from the widget menu.",
  },
  {
    id: "sharing",
    question: "Can I share a board outside my team?",
    answer:
      "Yes — on the Team plan you can publish a read-only link. Viewers see live data but cannot edit the layout or filters.",
  },
  {
    id: "roles",
    question: "What do the roles mean?",
    answer:
      "Admins manage members and billing, Editors arrange boards and widgets, and Viewers get read-only access to everything shared with them.",
  },
] as const

export function FaqBlock({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Frequently asked</CardTitle>
        <CardDescription>
          Quick answers about boards, widgets and roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Accordion defaultValue={["refresh"]}>
          {FAQ.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Still stuck?{" "}
          <Button variant="link" size="xs" className="h-auto p-0 text-xs">
            Contact support
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
