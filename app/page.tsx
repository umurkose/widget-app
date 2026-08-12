import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-muted">
      <main className="m-6 flex flex-1 flex-col rounded-2xl border bg-background shadow-sm">
        <Dashboard />
      </main>
    </div>
  )
}
