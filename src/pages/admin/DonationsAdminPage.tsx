import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { downloadReceipt, getAllDonations, type Donation } from '../../lib/donationService'

export default function DonationsAdminPage() {
  const { authed } = useAdminAuth()
  const [donations, setDonations] = useState<Donation[]>([])

  useEffect(() => {
    if (authed) getAllDonations().then(setDonations)
  }, [authed])

  const completed = donations.filter((d) => d.status === 'completed')
  const total = completed.reduce((s, d) => s + d.amount, 0)

  if (!authed) {
    return <AdminLogin title="Donations Admin" subtitle="View donation analytics and receipts." />
  }

  return (
    <AdminShell title="Donation Analytics" subtitle="Track all donations and receipts">
      <div className="volunteer-admin-stats">
        <div><strong>₹{total.toLocaleString('en-IN')}</strong><span>Total Raised</span></div>
        <div><strong>{completed.length}</strong><span>Completed</span></div>
        <div><strong>{donations.filter((d) => d.status === 'pending').length}</strong><span>Pending</span></div>
      </div>

      <div className="volunteer-admin-table-wrap">
        <table className="volunteer-admin-table">
          <thead><tr><th>Date</th><th>Donor</th><th>Campaign</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td>{d.isAnonymous ? 'Anonymous' : (d.donorName ?? d.donorEmail ?? '—')}</td>
                <td>{d.campaignTitle}</td>
                <td>₹{d.amount.toLocaleString('en-IN')}</td>
                <td>{d.status}</td>
                <td>
                  {d.receiptNumber ? (
                    <button type="button" onClick={() => downloadReceipt(d)}>Download</button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
