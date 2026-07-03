import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import SettingsAiInsights from '../../components/admin/settings/SettingsAiInsights'
import SettingsAnalyticsCards from '../../components/admin/settings/SettingsAnalyticsCards'
import SettingsNav from '../../components/admin/settings/SettingsNav'
import {
  SettingsAiPanel,
  SettingsAuditConfigPanel,
  SettingsBackupPanel,
  SettingsBrandingPanel,
  SettingsCertificatesPanel,
  SettingsCommunicationsPanel,
  SettingsDashboardOverview,
  SettingsDonationsPanel,
  SettingsFinancePanel,
  SettingsIntegrationsPanel,
  SettingsNotificationsPanel,
  SettingsOrganizationPanel,
  SettingsSecurityPanel,
  SettingsSystemPanel,
  SettingsTaxPanel,
  SettingsWorkflowsPanel,
} from '../../components/admin/settings/SettingsSupportPanels'
import AdminCard from '../../components/admin/ui/AdminCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  getSettingsDashboardData,
  parseSettingsTab,
  saveDonationSettings,
  saveOrganizationSettings,
  saveTaxSettings,
  type DonationSettings,
  type OrganizationSettings,
  type SettingsDashboardData,
  type SettingsTab,
  type TaxComplianceSettings,
} from '../../lib/settingsOperationsService'

export default function SettingsAdminPage() {
  const { authed } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dashboard, setDashboard] = useState<SettingsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<SettingsTab>(() => parseSettingsTab(searchParams.get('tab')))
  const [org, setOrg] = useState<OrganizationSettings | null>(null)
  const [donations, setDonations] = useState<DonationSettings | null>(null)
  const [tax, setTax] = useState<TaxComplianceSettings | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSettingsDashboardData()
      setDashboard(data)
      setOrg(data.organization)
      setDonations(data.donations)
      setTax(data.tax)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  useEffect(() => {
    setTab(parseSettingsTab(searchParams.get('tab')))
  }, [searchParams])

  const setTabAndUrl = (t: SettingsTab) => {
    setTab(t)
    setSearchParams(t === 'dashboard' ? {} : { tab: t }, { replace: true })
  }

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Platform Settings"
        subtitle="Configure the entire NGO ecosystem — the control center of Sanveda NGO OS."
      />
    )
  }

  return (
    <AdminShell
      title="Platform Settings"
      subtitle="Control Center of the NGO OS — organization, finance, donations, compliance, integrations, and system configuration"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading platform settings…</p></AdminCard>
      ) : dashboard && org && donations && tax ? (
        <div className="space-y-6">
          <SettingsNav active={tab} onChange={setTabAndUrl} />

          {tab === 'dashboard' ? (
            <>
              <SettingsDashboardOverview data={dashboard} />
              <SettingsAnalyticsCards analytics={dashboard.analytics} />
            </>
          ) : null}

          {tab === 'organization' ? (
            <SettingsOrganizationPanel
              org={org}
              onChange={setOrg}
              onSave={() => { saveOrganizationSettings(org); notify('Organization settings saved.') }}
            />
          ) : null}

          {tab === 'branding' ? <SettingsBrandingPanel branding={dashboard.branding} /> : null}
          {tab === 'finance' ? <SettingsFinancePanel finance={dashboard.finance} /> : null}
          {tab === 'donations' ? (
            <SettingsDonationsPanel
              donations={donations}
              gateways={dashboard.paymentGateways}
              onChange={setDonations}
              onSave={() => { saveDonationSettings(donations); notify('Donation settings saved.') }}
            />
          ) : null}
          {tab === 'tax' ? (
            <SettingsTaxPanel
              tax={tax}
              onChange={setTax}
              onSave={() => { saveTaxSettings(tax); notify('Tax & compliance settings saved.') }}
            />
          ) : null}
          {tab === 'certificates' ? <SettingsCertificatesPanel certificates={dashboard.certificates} /> : null}
          {tab === 'communications' ? <SettingsCommunicationsPanel comms={dashboard.communications} /> : null}
          {tab === 'notifications' ? <SettingsNotificationsPanel notifications={dashboard.notifications} /> : null}
          {tab === 'integrations' ? <SettingsIntegrationsPanel integrations={dashboard.integrations} /> : null}
          {tab === 'security' ? <SettingsSecurityPanel security={dashboard.security} /> : null}
          {tab === 'workflows' ? <SettingsWorkflowsPanel workflows={dashboard.workflows} /> : null}
          {tab === 'ai' ? <SettingsAiPanel ai={dashboard.ai} automation={dashboard.automation} /> : null}
          {tab === 'backup' ? <SettingsBackupPanel backup={dashboard.backup} /> : null}
          {tab === 'audit' ? <SettingsAuditConfigPanel audit={dashboard.auditConfig} /> : null}
          {tab === 'analytics' ? <SettingsAnalyticsCards analytics={dashboard.analytics} /> : null}
          {tab === 'system' ? <SettingsSystemPanel system={dashboard.system} /> : null}

          <SettingsAiInsights insights={dashboard.aiInsights} />
        </div>
      ) : null}
    </AdminShell>
  )
}
