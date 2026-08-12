import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <div className="h-full bg-muted p-6">
      <main className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Dashboard />
      </main>
    </div>
  )
}
