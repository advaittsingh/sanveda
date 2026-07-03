import { BarChart3, Cloud, HardDrive, Mail, MessageSquare, Receipt } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { SettingsDashboardData } from '../../../lib/settingsOperationsService'

interface Props {
  analytics: SettingsDashboardData['analytics']
}

export default function SettingsAnalyticsCards({ analytics }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      <StatCard label="Storage Used" value={0} sub={analytics.storageUsed} icon={HardDrive} delay={0} />
      <StatCard label="API Calls" value={analytics.apiCalls} icon={Cloud} accent="blue" delay={0.05} />
      <StatCard label="Emails Sent" value={analytics.emailsSent} icon={Mail} delay={0.1} />
      <StatCard label="SMS Sent" value={analytics.smsSent} icon={MessageSquare} accent="secondary" delay={0.15} />
      <StatCard label="Transactions" value={analytics.transactions} icon={Receipt} accent="green" delay={0.2} />
      <StatCard label="Users" value={analytics.users} icon={BarChart3} delay={0.25} />
      <StatCard label="Campaigns" value={analytics.campaigns} icon={BarChart3} accent="blue" delay={0.3} />
      <StatCard label="Donations" value={analytics.donations} icon={Receipt} accent="green" delay={0.35} />
    </div>
  )
}
