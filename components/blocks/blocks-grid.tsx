import { ApiKeysBlock } from "@/components/blocks/api-keys-block"
import { BillingBlock } from "@/components/blocks/billing-block"
import { DangerBlock } from "@/components/blocks/danger-block"
import { FaqBlock } from "@/components/blocks/faq-block"
import { NotificationsBlock } from "@/components/blocks/notifications-block"
import { PreferencesBlock } from "@/components/blocks/preferences-block"
import { TeamBlock } from "@/components/blocks/team-block"
import { UsageBlock } from "@/components/blocks/usage-block"
import { WorkspaceBlock } from "@/components/blocks/workspace-block"

export function BlocksGrid() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-24">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <WorkspaceBlock className="lg:col-span-5" />
        <NotificationsBlock className="lg:col-span-4" />
        <UsageBlock className="lg:col-span-3" />
        <TeamBlock className="lg:col-span-8" />
        <BillingBlock className="lg:col-span-4" />
        <ApiKeysBlock className="lg:col-span-4" />
        <PreferencesBlock className="lg:col-span-4" />
        <FaqBlock className="lg:col-span-4" />
        <DangerBlock className="lg:col-span-12" />
      </div>
    </div>
  )
}
