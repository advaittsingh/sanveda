import { Link } from 'react-router-dom'
import AdminCard from '../ui/AdminCard'
import DataTable from '../ui/DataTable'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'
import type {
  BrandingSettings,
  CertificateTemplate,
  DonationSettings,
  IntegrationStatus,
  OrganizationSettings,
  PaymentGateway,
  SettingsDashboardData,
  TaxComplianceSettings,
} from '../../../lib/settingsOperationsService'
import { formatReceiptNumber } from '../../../lib/settingsOperationsService'

function Toggle({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <StatusBadge status={checked ? 'active' : 'draft'} />
    </div>
  )
}

export function SettingsDashboardOverview({ data }: { data: SettingsDashboardData }) {
  const modules = ['Campaigns', 'Donations', 'Volunteers', 'Finance', 'CMS', 'Tax Receipts', 'Reports', 'Certificates']
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">NGO OS Control Center</h3>
        <p className="text-sm text-slate-500">The BIOS of Sanveda — every module derives its configuration from Platform Settings.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {modules.map((m) => (
            <span key={m} className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-slate-600">{m}</span>
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-3 text-base font-semibold text-[#0B2C6B]">Quick Status</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Organization</dt><dd className="font-medium">{data.organization.ngoName}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Financial Year</dt><dd className="font-medium">{data.finance.financialYear}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">80G</dt><dd><StatusBadge status={data.tax.eightyGEnabled ? 'active' : 'draft'} /></dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Integrations</dt><dd className="font-medium">{data.integrations.filter((i) => i.status === 'connected').length} connected</dd></div>
        </dl>
      </AdminCard>
    </div>
  )
}

interface OrgProps {
  org: OrganizationSettings
  onChange: (org: OrganizationSettings) => void
  onSave: () => void
}

export function SettingsOrganizationPanel({ org, onChange, onSave }: OrgProps) {
  const set = (patch: Partial<OrganizationSettings>) => onChange({ ...org, ...patch })
  const fields: { key: keyof OrganizationSettings; label: string; type?: string }[] = [
    { key: 'ngoName', label: 'NGO Name' },
    { key: 'legalName', label: 'Legal Name' },
    { key: 'registrationNumber', label: 'Registration Number' },
    { key: 'pan', label: 'PAN' },
    { key: 'gst', label: 'GST' },
    { key: 'twelveANumber', label: '12A Number' },
    { key: 'eightyGNumber', label: '80G Number' },
    { key: 'csrRegistration', label: 'CSR Registration' },
    { key: 'website', label: 'Website' },
    { key: 'supportEmail', label: 'Support Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
  ]
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Organization Settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className={adminLabelClass}>{f.label}</span>
            <input className={adminInputClass} type={f.type ?? 'text'} value={org[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className={adminLabelClass}>Address</span>
          <textarea className={`${adminInputClass} min-h-[80px]`} value={org.address} onChange={(e) => set({ address: e.target.value })} />
        </label>
      </div>
      <button type="button" className={`${adminBtnPrimary} mt-4`} onClick={onSave}>Save Organization</button>
    </AdminCard>
  )
}

export function SettingsBrandingPanel({ branding }: { branding: BrandingSettings }) {
  const previews = ['Website', 'Admin Panel', 'Receipts', 'Certificates', 'Emails']
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Branding</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['logo', 'favicon', 'emailHeader', 'letterhead'] as const).map((k) => (
          <label key={k} className="block">
            <span className={adminLabelClass}>{k.replace(/([A-Z])/g, ' $1')}</span>
            <input className={adminInputClass} defaultValue={branding[k]} />
          </label>
        ))}
        <label className="block"><span className={adminLabelClass}>Primary Color</span><input className={adminInputClass} type="color" defaultValue={branding.primaryColor} /></label>
        <label className="block"><span className={adminLabelClass}>Secondary Color</span><input className={adminInputClass} type="color" defaultValue={branding.secondaryColor} /></label>
        <label className="block"><span className={adminLabelClass}>Theme</span>
          <select className={adminInputClass} defaultValue={branding.theme}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select>
        </label>
        <label className="block sm:col-span-2">
          <span className={adminLabelClass}>Authorized Signature (URL)</span>
          <input className={adminInputClass} defaultValue={branding.authorizedSignature ?? ''} placeholder="https://…/signature.png" />
        </label>
        <Toggle label="Dark Mode" checked={branding.darkMode} />
      </div>
      <div className="mt-4">
        <p className={adminLabelClass}>Preview</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {previews.map((p) => (
            <span key={p} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold" style={{ color: branding.primaryColor }}>{p}</span>
          ))}
        </div>
      </div>
    </AdminCard>
  )
}

export function SettingsFinancePanel({ finance }: { finance: SettingsDashboardData['finance'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Financial Settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={adminLabelClass}>Financial Year</span><input className={adminInputClass} defaultValue={finance.financialYear} /></label>
        <label className="block"><span className={adminLabelClass}>Default Currency</span><input className={adminInputClass} defaultValue={finance.currency} /></label>
        <label className="block"><span className={adminLabelClass}>Accounting Method</span><input className={adminInputClass} defaultValue={finance.accountingMethod} /></label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><p className={adminLabelClass}>Expense Categories</p><ul className="mt-2 space-y-1 text-sm">{finance.expenseCategories.map((c) => <li key={c}>• {c}</li>)}</ul></div>
        <div><p className={adminLabelClass}>Income Categories</p><ul className="mt-2 space-y-1 text-sm">{finance.incomeCategories.map((c) => <li key={c}>• {c}</li>)}</ul></div>
        <div className="sm:col-span-2"><p className={adminLabelClass}>Bank Accounts</p><ul className="mt-2 space-y-1 text-sm">{finance.bankAccounts.map((b) => <li key={b}>• {b}</li>)}</ul></div>
      </div>
    </AdminCard>
  )
}

interface DonProps {
  donations: DonationSettings
  gateways: PaymentGateway[]
  onChange: (d: DonationSettings) => void
  onSave: () => void
}

export function SettingsDonationsPanel({ donations, gateways, onChange, onSave }: DonProps) {
  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Donation Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={adminLabelClass}>Minimum Donation (₹)</span>
            <input className={adminInputClass} type="number" value={donations.minimumDonation} onChange={(e) => onChange({ ...donations, minimumDonation: Number(e.target.value) })} />
          </label>
          <label className="block"><span className={adminLabelClass}>Platform Charges (%)</span>
            <input className={adminInputClass} type="number" step="0.1" value={donations.platformCharges} onChange={(e) => onChange({ ...donations, platformCharges: Number(e.target.value) })} />
          </label>
          <label className="block sm:col-span-2"><span className={adminLabelClass}>Suggested Amounts (₹)</span>
            <input className={adminInputClass} value={donations.suggestedAmounts.join(', ')} onChange={(e) => onChange({ ...donations, suggestedAmounts: e.target.value.split(',').map((n) => Number(n.trim())).filter(Boolean) })} />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle label="Anonymous Donations" checked={donations.anonymousDonations} />
          <Toggle label="International Donations" checked={donations.internationalDonations} />
          <Toggle label="Recurring Donations" checked={donations.recurringDonations} />
          <Toggle label="Offline Donations" checked={donations.offlineDonations} />
        </div>
        <button type="button" className={`${adminBtnPrimary} mt-4`} onClick={onSave}>Save Donation Settings</button>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Payment Gateway Settings</h3>
        <DataTable
          columns={[
            { key: 'provider', header: 'Provider', render: (g) => <span className="font-medium">{g.provider}</span> },
            { key: 'status', header: 'Status', render: (g) => <StatusBadge status={g.status === 'connected' ? 'active' : 'draft'} /> },
            { key: 'mode', header: 'Mode', render: (g) => g.mode.toUpperCase() },
            { key: 'actions', header: 'Action', render: (g) => (
              <button type="button" className={adminBtnSecondary}>{g.status === 'connected' ? 'Configure' : 'Connect'}</button>
            ) },
          ]}
          data={gateways}
          keyFn={(g) => g.id}
          emptyMessage="No payment gateways."
        />
      </AdminCard>
    </div>
  )
}

interface TaxProps {
  tax: TaxComplianceSettings
  onChange: (t: TaxComplianceSettings) => void
  onSave: () => void
}

export function SettingsTaxPanel({ tax, onChange, onSave }: TaxProps) {
  const receiptExample = formatReceiptNumber(tax.receiptPrefix, tax.financialYear, tax.receiptSequence)
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Tax & Compliance</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="80G Enabled" checked={tax.eightyGEnabled} />
        <Toggle label="12A Enabled" checked={tax.twelveAEnabled} />
        <Toggle label="CSR Enabled" checked={tax.csrEnabled} />
        <Toggle label="FCRA Enabled" checked={tax.fcraEnabled} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={adminLabelClass}>Receipt Prefix</span>
          <input className={adminInputClass} value={tax.receiptPrefix} onChange={(e) => onChange({ ...tax, receiptPrefix: e.target.value })} />
        </label>
        <label className="block"><span className={adminLabelClass}>Financial Year</span>
          <input className={adminInputClass} value={tax.financialYear} onChange={(e) => onChange({ ...tax, financialYear: e.target.value })} />
        </label>
        <label className="block"><span className={adminLabelClass}>Receipt Sequence</span>
          <input className={adminInputClass} type="number" value={tax.receiptSequence} onChange={(e) => onChange({ ...tax, receiptSequence: Number(e.target.value) })} />
        </label>
        <div className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs text-slate-500">Example Receipt</p><p className="font-semibold text-[#0B2C6B]">{receiptExample}</p></div>
      </div>
      <button type="button" className={`${adminBtnPrimary} mt-4`} onClick={onSave}>Save Tax Settings</button>
    </AdminCard>
  )
}

export function SettingsCertificatesPanel({ certificates }: { certificates: CertificateTemplate[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Certificate Management</h3>
      <div className="space-y-4">
        {certificates.map((c) => (
          <div key={c.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{c.name}</h4>
            <pre className="mt-2 rounded-lg bg-[#F8FAFC] p-3 text-xs text-slate-600">{c.template}</pre>
            <button type="button" className={`${adminBtnSecondary} mt-2`}>Edit Template</button>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function SettingsCommunicationsPanel({ comms }: { comms: SettingsDashboardData['communications'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Communications</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {(['email', 'sms', 'whatsapp'] as const).map((channel) => (
          <div key={channel} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold capitalize text-[#0B2C6B]">{channel}</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {comms[channel].map((p) => <li key={p}>• {p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function SettingsNotificationsPanel({ notifications }: { notifications: SettingsDashboardData['notifications'] }) {
  const channels = ['email', 'sms', 'whatsapp', 'push', 'inApp'] as const
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Notification Settings</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left text-slate-500">
              <th className="pb-2 pr-4 font-semibold">Event</th>
              {channels.map((c) => <th key={c} className="pb-2 px-2 font-semibold capitalize">{c === 'inApp' ? 'In-app' : c}</th>)}
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.event} className="border-b border-[#F8FAFC]">
                <td className="py-2.5 pr-4 font-medium">{n.event}</td>
                {channels.map((c) => (
                  <td key={c} className="px-2 text-center">{n[c] ? '✓' : '✗'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}

export function SettingsIntegrationsPanel({ integrations }: { integrations: IntegrationStatus[] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">API & Integrations</h3>
      <DataTable
        columns={[
          { key: 'name', header: 'Integration', render: (i) => <span className="font-medium">{i.name}</span> },
          { key: 'category', header: 'Category', render: (i) => i.category },
          { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status === 'connected' ? 'active' : i.status === 'demo' ? 'pending' : 'draft'} /> },
          { key: 'actions', header: 'Action', render: () => <button type="button" className={adminBtnSecondary}>Configure</button> },
        ]}
        data={integrations}
        keyFn={(i) => i.id}
        emptyMessage="No integrations."
      />
    </AdminCard>
  )
}

export function SettingsSecurityPanel({ security }: { security: SettingsDashboardData['security'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Users & Security</h3>
      <p className="mb-4 text-sm text-slate-500">
        <Link to="/admin/users" className="font-semibold text-[#0B2C6B] hover:underline">Manage Admin Users →</Link>
        {' '}· Role templates · Departments · Permission matrix · Approval matrix · Invitations
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Two-Factor Authentication (2FA)" checked={security.twoFactor} />
        <Toggle label="Single Sign-On (SSO)" checked={security.sso} />
        <Toggle label="IP Restriction" checked={security.ipRestriction} />
        <Toggle label="Device Restriction" checked={security.deviceRestriction} />
        <Toggle label="Auto Logout" checked={security.autoLogout} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Session Timeout</dt><dd className="font-semibold">{security.sessionTimeout}</dd></div>
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Password Policy</dt><dd className="font-semibold">{security.passwordMinLength} characters minimum</dd></div>
      </dl>
    </AdminCard>
  )
}

export function SettingsWorkflowsPanel({ workflows }: { workflows: SettingsDashboardData['workflows'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Approval Workflows</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {workflows.map((w) => (
          <div key={w.id} className="rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="font-semibold text-[#0B2C6B]">{w.name}</h4>
            <div className="mt-3 space-y-2">
              {w.steps.map((step, i) => (
                <div key={step}>
                  <span className="text-sm font-medium">{step}</span>
                  {i < w.steps.length - 1 ? <div className="ml-3 border-l-2 border-[#E5E7EB] py-1 pl-2 text-xs text-slate-400">↓</div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function SettingsAiPanel({ ai, automation }: { ai: SettingsDashboardData['ai']; automation: SettingsDashboardData['automation'] }) {
  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">AI Settings</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block"><span className={adminLabelClass}>OpenAI API Key</span><input className={adminInputClass} type="password" placeholder="sk-..." defaultValue={ai.openaiKey} /></label>
          <label className="block"><span className={adminLabelClass}>Gemini API Key</span><input className={adminInputClass} type="password" placeholder="..." defaultValue={ai.geminiKey} /></label>
          <label className="block"><span className={adminLabelClass}>Anthropic API Key</span><input className={adminInputClass} type="password" placeholder="..." defaultValue={ai.anthropicKey} /></label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle label="AI Reports" checked={ai.aiReports} />
          <Toggle label="AI Insights" checked={ai.aiInsights} />
          <Toggle label="AI Content" checked={ai.aiContent} />
          <Toggle label="AI Analytics" checked={ai.aiAnalytics} />
        </div>
      </AdminCard>
      <AdminCard>
        <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Automation Settings</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Auto Tax Receipts" checked={automation.autoTaxReceipts} />
          <Toggle label="Auto Thank You Emails" checked={automation.autoThankYouEmails} />
          <Toggle label="Auto Volunteer IDs" checked={automation.autoVolunteerIds} />
          <Toggle label="Auto Certificates" checked={automation.autoCertificates} />
          <Toggle label="Auto Reports" checked={automation.autoReports} />
          <Toggle label="Auto Reminders" checked={automation.autoReminders} />
        </div>
      </AdminCard>
    </div>
  )
}

export function SettingsBackupPanel({ backup }: { backup: SettingsDashboardData['backup'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Backup & Recovery</h3>
      <DataTable
        columns={[
          { key: 'item', header: 'Item', render: (r) => r.item },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.enabled ? 'active' : 'draft'} /> },
        ]}
        data={[
          { item: 'Daily Backup', enabled: backup.dailyBackup },
          { item: 'Weekly Snapshot', enabled: backup.weeklySnapshot },
          { item: 'Last Backup', enabled: true, label: backup.lastBackup },
          { item: 'Disaster Recovery', enabled: backup.disasterRecovery },
        ]}
        keyFn={(r) => r.item}
        emptyMessage=""
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary}>Create Backup</button>
        <button type="button" className={adminBtnSecondary}>Restore Backup</button>
        <button type="button" className={adminBtnSecondary}>Export Database</button>
        <button type="button" className={adminBtnSecondary}>Download Archive</button>
      </div>
    </AdminCard>
  )
}

export function SettingsAuditConfigPanel({ audit }: { audit: SettingsDashboardData['auditConfig'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">Audit Configuration</h3>
      <p className="mb-4 text-sm text-slate-500">
        <Link to="/admin/audit" className="font-semibold text-[#0B2C6B] hover:underline">View Audit Center →</Link>
      </p>
      <dl className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Retention Period</dt><dd className="mt-1 font-semibold text-[#0B2C6B]">{audit.retentionPeriod}</dd></div>
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Log Level</dt><dd className="mt-1 font-semibold text-[#0B2C6B]">{audit.logLevel}</dd></div>
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Critical Events</dt><dd className="mt-1"><StatusBadge status={audit.criticalEvents ? 'active' : 'draft'} /></dd></div>
        <div className="rounded-xl bg-[#F8FAFC] p-4"><dt className="text-slate-500">Export Schedule</dt><dd className="mt-1 font-semibold text-[#0B2C6B]">{audit.exportSchedule}</dd></div>
      </dl>
    </AdminCard>
  )
}

export function SettingsSystemPanel({ system }: { system: SettingsDashboardData['system'] }) {
  return (
    <AdminCard>
      <h3 className="mb-4 text-base font-semibold text-[#0B2C6B]">System & Maintenance</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Maintenance Mode" checked={system.maintenanceMode} />
        <Toggle label="Emergency Shutdown" checked={system.emergencyShutdown} />
        <Toggle label="Read Only Mode" checked={system.readOnlyMode} />
        <Toggle label="Demo Mode" checked={system.demoMode} />
      </div>
    </AdminCard>
  )
}
