import { useEffect, useMemo, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DataTable from '../../components/admin/ui/DataTable'
import StatCard from '../../components/admin/ui/StatCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getAllDonations, type Donation } from '../../lib/donationService'

interface DonorRow {
  key: string
  name: string
  email: string
  total: number
  count: number
  lastDonation: string
}

export default function DonorsAdminPage() {
  const { authed } = useAdminAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authed) getAllDonations().then(setDonations).finally(() => setLoading(false))
  }, [authed])

  const donors = useMemo(() => {
    const map = new Map<string, DonorRow>()
    for (const d of donations.filter((x) => x.status === 'completed' && !x.isAnonymous)) {
      const key = d.donorEmail ?? d.donorName ?? d.id
      const existing = map.get(key)
      if (existing) {
        existing.total += d.amount
        existing.count += 1
        if (d.createdAt > existing.lastDonation) existing.lastDonation = d.createdAt
      } else {
        map.set(key, {
          key,
          name: d.donorName ?? 'Donor',
          email: d.donorEmail ?? '—',
          total: d.amount,
          count: 1,
          lastDonation: d.createdAt,
        })
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [donations])

  if (!authed) {
    return <AdminLogin title="Donors" subtitle="View donor profiles and giving history." />
  }

  const totalRaised = donors.reduce((s, d) => s + d.total, 0)

  return (
    <AdminShell title="Donor Management" subtitle="Track donor relationships and lifetime giving">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Donors" value={donors.length} />
        <StatCard label="Lifetime Giving" value={totalRaised} prefix="₹" accent="gold" />
        <StatCard label="Avg. per Donor" value={donors.length ? Math.round(totalRaised / donors.length) : 0} prefix="₹" />
      </div>

      <DataTable
        loading={loading}
        data={donors}
        keyFn={(d) => d.key}
        columns={[
          { key: 'name', header: 'Donor', render: (d) => <span className="font-medium">{d.name}</span> },
          { key: 'email', header: 'Email', render: (d) => d.email },
          { key: 'total', header: 'Total Given', render: (d) => `₹${d.total.toLocaleString('en-IN')}` },
          { key: 'count', header: 'Donations', render: (d) => d.count },
          { key: 'last', header: 'Last Donation', render: (d) => new Date(d.lastDonation).toLocaleDateString('en-IN') },
        ]}
      />
    </AdminShell>
  )
}
