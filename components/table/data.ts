export type TransactionStatus = "Paid" | "Pending" | "Failed" | "Refunded"

export type TransactionRole = "Admin" | "Editor" | "Viewer"

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "SEPA"

export type Transaction = {
  id: string
  /** Short, opaque key used in the detail URL (/table/<slug>). */
  slug: string
  user: { name: string; email: string; initials: string }
  role: TransactionRole
  status: TransactionStatus
  amount: number
  currency: "USD" | "EUR"
  method: { brand: CardBrand; last4: string }
  activity: number[]
  usage: number
  tags: string[]
  autoRenew: boolean
  lastActive: string
  lastActiveMinutes: number
  verified: boolean
}

const USERS: { name: string; role: TransactionRole; verified: boolean }[] = [
  { name: "Aylin Kaya", role: "Admin", verified: true },
  { name: "Mert Demirtas", role: "Editor", verified: true },
  { name: "Selin Aydin", role: "Editor", verified: false },
  { name: "Jonas Weber", role: "Viewer", verified: true },
  { name: "Priya Nair", role: "Editor", verified: true },
  { name: "Tom Hardy", role: "Viewer", verified: false },
  { name: "Elif Sonmez", role: "Admin", verified: true },
  { name: "Marco Rossi", role: "Viewer", verified: true },
  { name: "Deniz Arslan", role: "Editor", verified: false },
  { name: "Ingrid Larsen", role: "Viewer", verified: true },
  { name: "Yusuf Acar", role: "Editor", verified: true },
  { name: "Hana Sato", role: "Viewer", verified: true },
]

const STATUSES: TransactionStatus[] = [
  "Paid", "Paid", "Pending", "Paid", "Failed", "Paid", "Refunded",
  "Paid", "Pending", "Paid", "Paid", "Failed", "Paid",
]

const AMOUNTS = [
  3500, -96, 1240, 89.5, -640, 2150, 45, 780.25, -129, 5600, 999,
  -310.75, 84, 1875, -62.4, 4520, 258,
]

const BRANDS: CardBrand[] = [
  "Visa", "Mastercard", "Amex", "Visa", "SEPA", "Mastercard", "Visa",
]

const TAG_POOL = ["recurring", "manual", "api", "invoice", "refund", "risk"]

// minutesAgo keeps the human label sortable without touching Date.now().
const LAST_ACTIVE: { label: string; minutesAgo: number }[] = [
  { label: "2m ago", minutesAgo: 2 },
  { label: "14m ago", minutesAgo: 14 },
  { label: "1h ago", minutesAgo: 60 },
  { label: "3h ago", minutesAgo: 180 },
  { label: "Yesterday 18:04", minutesAgo: 1345 },
  { label: "Yesterday 09:12", minutesAgo: 1877 },
  { label: "Mon 11:32", minutesAgo: 3054 },
  { label: "Aug 9", minutesAgo: 5906 },
  { label: "Aug 7", minutesAgo: 8786 },
  { label: "5h ago", minutesAgo: 300 },
  { label: "Aug 4", minutesAgo: 13106 },
  { label: "Tue 16:45", minutesAgo: 2743 },
  { label: "Jul 30", minutesAgo: 20306 },
  { label: "2d ago", minutesAgo: 2880 },
  { label: "Jul 28", minutesAgo: 23186 },
]

const AUTO_RENEW = [true, false, true, true, false]

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function emailOf(name: string): string {
  return `${name.split(" ")[0].toLowerCase()}@acme.co`
}

// Deterministic integer hash (0-99) so SSR and client render identically.
function hash(n: number): number {
  let x = (n + 1) * 2654435761
  x = ((x ^ (x >>> 13)) * 1274126177) | 0
  x = x ^ (x >>> 16)
  return (x >>> 0) % 100
}

const SLUG_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// Looks random, but is derived from the row index so server and client agree.
function slugOf(i: number): string {
  let out = ""
  for (let k = 0; k < 7; k++) {
    out += SLUG_ALPHABET[hash(i * 17 + k * 31) % SLUG_ALPHABET.length]
  }
  return out
}

function buildRow(i: number): Transaction {
  const seed = USERS[i % USERS.length]
  const brand = BRANDS[i % BRANDS.length]
  const lastActive = LAST_ACTIVE[i % LAST_ACTIVE.length]
  const tagCount = 1 + ((i * 5 + 1) % 3)
  const tagStart = (i * 5) % TAG_POOL.length
  return {
    id: `TX-${90412 + i * 131}`,
    slug: slugOf(i),
    user: {
      name: seed.name,
      email: emailOf(seed.name),
      initials: initialsOf(seed.name),
    },
    role: seed.role,
    status: STATUSES[i % STATUSES.length],
    amount: AMOUNTS[i % AMOUNTS.length],
    currency: brand === "SEPA" ? "EUR" : "USD",
    method: { brand, last4: String(1000 + ((i * 3719 + 211) % 9000)) },
    activity: Array.from({ length: 8 }, (_, j) => 10 + (hash(i * 8 + j) % 80)),
    usage: (i * 37 + 11) % 101,
    tags: Array.from(
      { length: tagCount },
      (_, k) => TAG_POOL[(tagStart + k * 2) % TAG_POOL.length]
    ),
    autoRenew: AUTO_RENEW[i % AUTO_RENEW.length],
    lastActive: lastActive.label,
    lastActiveMinutes: lastActive.minutesAgo,
    verified: seed.verified,
  }
}

export const TRANSACTIONS: Transaction[] = Array.from({ length: 58 }, (_, i) =>
  buildRow(i)
)

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : "$"
  const sign = amount < 0 ? "-" : "+"
  return `${sign}${symbol}${amountFormatter.format(Math.abs(amount))}`
}
