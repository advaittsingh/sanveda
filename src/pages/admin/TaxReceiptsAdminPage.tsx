import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import TaxReceiptAiInsights from '../../components/admin/tax-receipts/TaxReceiptAiInsights'
import TaxReceiptAnalytics from '../../components/admin/tax-receipts/TaxReceiptAnalytics'
import TaxReceiptFiltersPanel from '../../components/admin/tax-receipts/TaxReceiptFiltersPanel'
import TaxReceiptKpiCards from '../../components/admin/tax-receipts/TaxReceiptKpiCards'
import TaxReceiptNav from '../../components/admin/tax-receipts/TaxReceiptNav'
import TaxReceiptProfileDrawer from '../../components/admin/tax-receipts/TaxReceiptProfileDrawer'
import {
  TaxReceiptArchitecturePanel,
  TaxReceiptBulkPanel,
  TaxReceiptCompliancePanel,
  TaxReceiptEightyGPanel,
  TaxReceiptEmailPanel,
  TaxReceiptTemplatesPanel,
  TaxReceiptVerificationPanel,
} from '../../components/admin/tax-receipts/TaxReceiptSupportPanels'
import TaxReceiptToolbar from '../../components/admin/tax-receipts/TaxReceiptToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { formatIndianCompact } from '../../lib/formatIndian'
import {
  bulkGeneratePending,
  exportReceiptsCsv,
  filterReceipts,
  generateReceipt,
  getTaxReceiptDashboardData,
  printReceiptPdf,
  sendReceiptEmail,
  verifyReceiptByNumber,
  type TaxReceiptDashboardData,
  type TaxReceiptFilters,
  type TaxReceiptProfile,
  type TaxReceiptTab,
} from '../../lib/taxReceiptOperationsService'

const defaultFilters: TaxReceiptFilters = {
  search: '',
  type: 'all',
  status: 'all',
  campaign: 'all',
  financialYear: 'all',
}

export default function TaxReceiptsAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<TaxReceiptDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TaxReceiptTab>('dashboard')
  const [filters, setFilters] = useState<TaxReceiptFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState<TaxReceiptProfile | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<TaxReceiptProfile | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getTaxReceiptDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => {
    if (!dashboard) return []
    return filterReceipts(dashboard.receipts, { ...filters, search: filters.search })
  }, [dashboard, filters])

  const campaigns = useMemo(
    () => (dashboard ? [...new Set(dashboard.receipts.map((r) => r.campaign))] : []),
    [dashboard],
  )
  const financialYears = useMemo(
    () => (dashboard ? [...new Set(dashboard.receipts.map((r) => r.financialYear))] : []),
    [dashboard],
  )

  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3500)
  }

  const handleGenerate = async (receipt: TaxReceiptProfile) => {
    await generateReceipt(receipt.id)
    await refresh()
    notify(`Receipt ${receipt.receiptNumber} generated.`)
    const updated = (await getTaxReceiptDashboardData()).receipts.find((r) => r.id === receipt.id)
    if (updated) setActiveReceipt(updated)
  }

  const handleEmail = async (receipt: TaxReceiptProfile) => {
    await sendReceiptEmail(receipt.id)
    await refresh()
    notify(`Receipt emailed to ${receipt.email || 'donor'}.`)
  }

  const handleBulkGenerate = async () => {
    const count = await bulkGeneratePending()
    await refresh()
    notify(`Generated ${count} pending receipts.`)
  }

  const handleVerify = async (receiptNumber: string) => {
    const result = await verifyReceiptByNumber(receiptNumber)
    setVerifyResult(result)
    if (!result) notify('Receipt not found.')
  }

  const showTable = tab === 'dashboard' || tab === 'receipts' || tab === 'donation_receipts'

  if (!authed) {
    return (
      <AdminLogin
        title="Tax Receipts"
        subtitle="Donation receipt and tax compliance system — 80G, CSR, FCRA, and donor trust."
      />
    )
  }

  return (
    <AdminShell
      title="Tax Receipts"
      subtitle="Donation Receipt & Tax Compliance System — bridge between Finance and Compliance engines"
    >
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#0B2C6B] px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {loading && !dashboard ? (
        <AdminCard><p className="text-sm text-slate-500">Loading tax receipt data…</p></AdminCard>
      ) : dashboard ? (
        <div className="space-y-6">
          <TaxReceiptKpiCards kpis={dashboard.kpis} />
          <TaxReceiptNav active={tab} onChange={setTab} />

          {(tab === 'dashboard') ? (
            <>
              <TaxReceiptAnalytics
                receiptsGeneratedTrend={dashboard.receiptsGeneratedTrend}
                donationsByTaxCategory={dashboard.donationsByTaxCategory}
              />
              <TaxReceiptAiInsights insights={dashboard.aiInsights} />
              <TaxReceiptArchitecturePanel />
            </>
          ) : null}

          {showTable ? (
            <AdminCard>
              <TaxReceiptToolbar
                onGeneratePending={handleBulkGenerate}
                onBulkGenerate={() => setTab('bulk')}
                onExport={() => { exportReceiptsCsv(filtered); notify('Receipts exported to CSV.') }}
                onEmailAll={() => notify('Bulk email queued for all pending receipts.')}
                search={filters.search}
                onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
              />
              {showFilters ? (
                <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                  <TaxReceiptFiltersPanel
                    filters={filters}
                    campaigns={campaigns}
                    financialYears={financialYears}
                    onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
                  />
                </div>
              ) : null}
              <div className="mt-4">
                <DataTable
                  columns={[
                    { key: 'receiptNumber', header: 'Receipt No', render: (r) => <span className="font-mono text-xs">{r.receiptNumber}</span> },
                    { key: 'donor', header: 'Donor', render: (r) => r.donorName },
                    { key: 'amount', header: 'Donation', render: (r) => `₹${formatIndianCompact(r.amount)}` },
                    { key: 'date', header: 'Date', render: (r) => new Date(r.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                    { key: 'campaign', header: 'Campaign', render: (r) => r.campaign },
                    { key: 'type', header: 'Type', render: (r) => r.receiptTypeLabel },
                    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (r) => (
                        <div className="flex gap-2">
                          {r.status === 'pending' ? (
                            <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); handleGenerate(r) }}>Generate</button>
                          ) : (
                            <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); setActiveReceipt(r) }}>View</button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={filtered}
                  keyFn={(r) => r.id}
                  onRowClick={setActiveReceipt}
                  selectedKey={activeReceipt?.id}
                  emptyMessage="No receipts match your filters."
                />
              </div>
            </AdminCard>
          ) : null}

          {tab === 'eighty_g' ? <TaxReceiptEightyGPanel certificates={dashboard.certificates} /> : null}
          {tab === 'donation_receipts' ? null : null}
          {tab === 'bulk' ? (
            <TaxReceiptBulkPanel
              pendingCount={dashboard.bulkPendingCount}
              onGenerateAll={handleBulkGenerate}
              onGenerateByCampaign={() => notify('Generating receipts by campaign…')}
              onGenerateByMonth={() => notify('Generating 845 receipts for April 2026…')}
              onGenerateByFY={() => notify('Generating receipts for FY 2025-26…')}
              onEmailAll={() => notify('Emailing all generated receipts…')}
            />
          ) : null}
          {tab === 'email_history' ? <TaxReceiptEmailPanel history={dashboard.emailHistory} /> : null}
          {tab === 'templates' ? (
            <TaxReceiptTemplatesPanel templates={dashboard.templates} onUse={(name) => notify(`Template "${name}" selected.`)} />
          ) : null}
          {tab === 'verification' ? (
            <>
              <TaxReceiptVerificationPanel onVerify={handleVerify} />
              {verifyResult ? (
                <AdminCard>
                  <p className="text-sm font-semibold text-emerald-700">✓ Verified</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Receipt Number</dt><dd className="font-mono">{verifyResult.receiptNumber}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Donor</dt><dd>{verifyResult.donorName}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Amount</dt><dd>₹{formatIndianCompact(verifyResult.amount)}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd>{new Date(verifyResult.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
                  </dl>
                </AdminCard>
              ) : null}
            </>
          ) : null}
          {tab === 'reports' ? (
            <>
              <TaxReceiptCompliancePanel reports={dashboard.complianceReports} onGenerate={(name) => notify(`Generating "${name}"…`)} />
              <TaxReceiptAnalytics
                receiptsGeneratedTrend={dashboard.receiptsGeneratedTrend}
                donationsByTaxCategory={dashboard.donationsByTaxCategory}
              />
            </>
          ) : null}

          {tab !== 'dashboard' && tab !== 'reports' ? (
            <TaxReceiptAiInsights insights={dashboard.aiInsights} />
          ) : null}
        </div>
      ) : null}

      <TaxReceiptProfileDrawer
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
        onGenerate={() => activeReceipt && handleGenerate(activeReceipt)}
        onEmail={() => activeReceipt && handleEmail(activeReceipt)}
        onPrint={() => activeReceipt && printReceiptPdf(activeReceipt)}
      />
    </AdminShell>
  )
}
