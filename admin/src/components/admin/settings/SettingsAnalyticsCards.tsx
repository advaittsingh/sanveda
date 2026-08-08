import AdminCard from '../ui/AdminCard'
import type { SettingsDashboardData } from '../../../lib/settingsOperationsService'

interface Props {
  analytics: SettingsDashboardData['analytics']
}

export default function SettingsAnalyticsCards({ analytics }: Props) {
  void analytics
  return (
    <AdminCard>
      <h3 className="mb-2 text-base font-semibold text-[#0B2C6B]">Platform Analytics</h3>
      <p className="text-sm text-slate-500">
        Coming soon — usage metrics (storage, API calls, emails, transactions) are not wired to live data yet.
      </p>
    </AdminCard>
  )
}
