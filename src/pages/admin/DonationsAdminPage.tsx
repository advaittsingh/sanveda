import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DataTable from '../../components/admin/ui/DataTable'
import StatCard from '../../components/admin/ui/StatCard'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { downloadReceipt, getAllDonations, type Donation } from '../../lib/donationService'

export default function DonationsAdminPage() {
  const { authed } = useAdminAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authed) getAllDonations().then(setDonations).finally(() => setLoading(false))
  }, [authed])

  const completed = donations.filter((d) => d.status === 'completed')
  const total = completed.reduce((s, d) => s + d.amount, 0)
  const pending = donations.filter((d) => d.status === 'pending').length

  if (!authed) {
    return <AdminLogin title="Donation Management" subtitle="View donation analytics and receipts." />
  }

  return (
    <AdminShell title="Donation Management" subtitle="Track all donations, receipts, and 80G compliance">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Raised" value={total} prefix="₹" />
        <StatCard label="Completed" value={completed.length} accent="green" />
        <StatCard label="Pending" value={pending} accent="gold" />
      </div>

      <DataTable
        loading={loading}
        data={donations}
        keyFn={(d) => d.id}
        emptyMessage="No donations recorded yet."
        columns={[
          {
            key: 'date',
            header: 'Date',
            render: (d) => new Date(d.createdAt).toLocaleDateString('en-IN'),
          },
          {
            key: 'donor',
            header: 'Donor',
            render: (d) => (d.isAnonymous ? 'Anonymous' : (d.donorName ?? d.donorEmail ?? '—')),
          },
          { key: 'campaign', header: 'Campaign', render: (d) => d.campaignTitle },
          {
            key: 'amount',
            header: 'Amount',
            render: (d) => <span className="font-semibold text-[#0B2C6B]">₹{d.amount.toLocaleString('en-IN')}</span>,
          },
          {
            key: 'mode',
            header: 'Payment',
            render: (d) => (d.razorpayPaymentId ? 'Razorpay' : 'Demo'),
          },
          {
            key: '80g',
            header: '80G',
            render: (d) => (d.receiptNumber ? 'Yes' : '—'),
          },
          {
            key: 'status',
            header: 'Status',
            render: (d) => <StatusBadge status={d.status} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (d) => (
              <div className="flex gap-2">
                {d.receiptNumber ? (
                  <button type="button" className={adminBtnSecondary} onClick={() => downloadReceipt(d)}>
                    Receipt
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </AdminShell>
  )
}
