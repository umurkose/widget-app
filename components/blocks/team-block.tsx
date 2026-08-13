"use client"

import * as React from "react"
import { RefreshCw, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Member = {
  name: string
  email: string
  role: string
  status: "Active" | "Invited"
}

const INITIAL_MEMBERS: Member[] = [
  { name: "Aylin Kaya", email: "aylin@acme.co", role: "Admin", status: "Active" },
  { name: "Mert Demirtas", email: "mert@acme.co", role: "Editor", status: "Active" },
  { name: "Selin Aydin", email: "selin@acme.co", role: "Editor", status: "Active" },
  { name: "Jonas Weber", email: "jonas@acme.co", role: "Viewer", status: "Active" },
  { name: "Priya Nair", email: "priya@acme.co", role: "Editor", status: "Invited" },
  { name: "Tom Hardy", email: "tom@acme.co", role: "Viewer", status: "Active" },
  { name: "Elif Sonmez", email: "elif@acme.co", role: "Admin", status: "Active" },
  { name: "Marco Rossi", email: "marco@acme.co", role: "Viewer", status: "Invited" },
]

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TeamBlock({ className }: { className?: string }) {
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS)
  const [perPage, setPerPage] = React.useState(4)
  const [page, setPage] = React.useState(1)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [inviteName, setInviteName] = React.useState("")
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState("Viewer")

  const pageCount = Math.max(1, Math.ceil(members.length / perPage))
  const currentPage = Math.min(page, pageCount)
  const visible = members.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const goTo = (event: React.MouseEvent, next: number) => {
    event.preventDefault()
    setPage(Math.min(Math.max(next, 1), pageCount))
  }

  const sendInvite = () => {
    const name = inviteName.trim() || "New member"
    const email =
      inviteEmail.trim() ||
      `${name.toLowerCase().replace(/\s+/g, ".")}@acme.co`
    const next = [
      ...members,
      { name, email, role: inviteRole, status: "Invited" as const },
    ]
    setMembers(next)
    setPage(Math.ceil(next.length / perPage))
    setInviteName("")
    setInviteEmail("")
    setInviteRole("Viewer")
    setInviteOpen(false)
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>
          People with access to the boards in this workspace.
        </CardDescription>
        <CardAction className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Refresh member list"
                />
              }
            >
              <RefreshCw />
            </TooltipTrigger>
            <TooltipContent>Refresh list</TooltipContent>
          </Tooltip>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <UserPlus data-icon="inline-start" /> Invite
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Invite a member</DialogTitle>
                <DialogDescription>
                  They get an email with a link to join Acme Insights.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-name">Full name</FieldLabel>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Deniz Arslan"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="deniz@acme.co"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) => setInviteRole(value as string)}
                  >
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue placeholder="Pick a role" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button onClick={sendInvite}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((member) => (
              <TableRow key={member.email}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>{initialsOf(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.role}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={member.status === "Active" ? "secondary" : "outline"}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <div className="flex items-center gap-2">
          <NativeSelect
            size="sm"
            aria-label="Members per page"
            value={String(perPage)}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
          >
            <NativeSelectOption value="4">4 / page</NativeSelectOption>
            <NativeSelectOption value="6">6 / page</NativeSelectOption>
            <NativeSelectOption value="8">8 / page</NativeSelectOption>
          </NativeSelect>
          <span className="text-xs text-muted-foreground">
            {members.length} members
          </span>
        </div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={currentPage === 1}
                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                onClick={(e) => goTo(e, currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === currentPage}
                    onClick={(e) => goTo(e, n)}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={currentPage === pageCount}
                className={cn(
                  currentPage === pageCount && "pointer-events-none opacity-50"
                )}
                onClick={(e) => goTo(e, currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
