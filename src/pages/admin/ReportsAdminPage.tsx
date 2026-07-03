import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getAllDonations } from '../../lib/donationService'
import { getVolunteerApplications } from '../../lib/volunteerStore'
import { getBeneficiaries } from '../../lib/beneficiaryService'
import { getAllCampaignsAdmin } from '../../lib/campaignService'
import { getFinancialSummary } from '../../lib/incomeService'

function exportCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const REPORTS = [
  { id: 'donations', title: 'Donation Report', desc: 'All completed donations with donor and campaign details' },
  { id: 'volunteers', title: 'Volunteer Report', desc: 'Volunteer applications and status breakdown' },
  { id: 'beneficiaries', title: 'Beneficiary Report', desc: 'Beneficiary records and support amounts' },
  { id: 'campaigns', title: 'Campaign Report', desc: 'Campaign goals, raised amounts, and status' },
  { id: 'finance', title: 'Finance Report', desc: 'Income, expenses, and net balance summary' },
]

export default function ReportsAdminPage() {
  const { authed } = useAdminAuth()
  const [exporting, setExporting] = useState<string | null>(null)

  if (!authed) {
    return <AdminLogin title="Reports" subtitle="Generate and export operational reports." />
  }

  const handleExport = async (id: string, format: 'csv' | 'excel') => {
    setExporting(`${id}-${format}`)
    try {
      if (id === 'donations') {
        const donations = await getAllDonations()
        exportCsv(`sanveda-donations.${format === 'excel' ? 'csv' : 'csv'}`, [
          ['Date', 'Donor', 'Campaign', 'Amount', 'Status', 'Receipt'],
          ...donations.map((d) => [
            new Date(d.createdAt).toLocaleDateString(),
            d.isAnonymous ? 'Anonymous' : (d.donorName ?? ''),
            d.campaignTitle,
            String(d.amount),
            d.status,
            d.receiptNumber ?? '',
          ]),
        ])
      } else if (id === 'volunteers') {
        const volunteers = await getVolunteerApplications()
        exportCsv('sanveda-volunteers.csv', [
          ['Name', 'Email', 'City', 'Status', 'Applied'],
          ...volunteers.map((v) => [v.fullName, v.email, v.city, v.status, new Date(v.createdAt).toLocaleDateString()]),
        ])
      } else if (id === 'beneficiaries') {
        const beneficiaries = await getBeneficiaries()
        exportCsv('sanveda-beneficiaries.csv', [
          ['Name', 'Program', 'Category', 'Status', 'Support Amount'],
          ...beneficiaries.map((b) => [b.fullName, b.program ?? '', b.category ?? '', b.status, String(b.supportAmount ?? 0)]),
        ])
      } else if (id === 'campaigns') {
        const campaigns = await getAllCampaignsAdmin()
        exportCsv('sanveda-campaigns.csv', [
          ['Title', 'Slug', 'Goal', 'Raised', 'Status'],
          ...campaigns.map((c) => [c.title, c.slug, String(c.goal), String(c.raised), c.status]),
        ])
      } else if (id === 'finance') {
        const summary = await getFinancialSummary()
        exportCsv('sanveda-finance.csv', [
          ['Metric', 'Value'],
          ['Total Income', String(summary.totalIncome)],
          ['Total Expenses', String(summary.totalExpenses)],
          ['Net Balance', String(summary.netBalance)],
          ['Pending Expenses', String(summary.pendingExpenses)],
        ])
      }
    } finally {
      setExporting(null)
    }
  }

  return (
    <AdminShell title="Reporting Center" subtitle="Export donation, volunteer, beneficiary, campaign, and finance reports">
      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((report) => (
          <AdminCard key={report.id}>
            <h3 className="font-semibold text-[#0B2C6B]">{report.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{report.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={!!exporting}
                onClick={() => handleExport(report.id, 'csv')}
              >
                <Download size={14} className="mr-1.5 inline" />
                {exporting === `${report.id}-csv` ? 'Exporting…' : 'CSV'}
              </button>
              <button
                type="button"
                className={adminBtnSecondary}
                disabled={!!exporting}
                onClick={() => handleExport(report.id, 'excel')}
              >
                <FileSpreadsheet size={14} className="mr-1.5 inline" />
                Excel
              </button>
              <button type="button" className={adminBtnSecondary} disabled title="PDF export coming soon">
                <FileText size={14} className="mr-1.5 inline" />
                PDF
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  )
}
