import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getDashboardAnalytics, type DashboardAnalytics } from '../../lib/analyticsService'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <em>{sub}</em> : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { authed } = useAdminAuth()
  const [stats, setStats] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authed) return
    getDashboardAnalytics()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [authed])

  if (!authed) {
    return <AdminLogin title="Admin Dashboard" subtitle="Sign in to access the Sanveda admin panel." />
  }

  return (
    <AdminShell title="Admin Dashboard" subtitle="Sanveda Global Humanitarian Foundation">
      {loading || !stats ? (
        <p className="volunteer-admin-empty">Loading analytics…</p>
      ) : (
        <>
          <div className="volunteer-admin-stats">
            <StatCard label="Total Donations" value={`₹${stats.donations.total.toLocaleString('en-IN')}`} sub={`${stats.donations.count} transactions`} />
            <StatCard label="This Month" value={`₹${stats.donations.thisMonth.toLocaleString('en-IN')}`} />
            <StatCard label="Active Campaigns" value={String(stats.campaigns.active)} sub={`${stats.campaigns.total} total`} />
            <StatCard label="Volunteers" value={String(stats.volunteers.active)} sub={`${stats.volunteers.pending} pending`} />
            <StatCard label="Members" value={String(stats.memberships.active)} sub={`${stats.memberships.pending} pending`} />
            <StatCard label="New Enquiries" value={String(stats.enquiries.new)} sub={`${stats.enquiries.total} total`} />
            <StatCard label="Total Income" value={`₹${stats.finance.totalIncome.toLocaleString('en-IN')}`} />
            <StatCard label="Net Balance" value={`₹${stats.finance.netBalance.toLocaleString('en-IN')}`} sub={`₹${stats.finance.pendingExpenses.toLocaleString('en-IN')} pending expenses`} />
          </div>

          <div className="admin-quick-links">
            <Link to="/admin/campaigns" className="volunteer-btn volunteer-btn-secondary">Manage Campaigns</Link>
            <Link to="/admin/blogs" className="volunteer-btn volunteer-btn-secondary">Manage Blogs</Link>
            <Link to="/admin/finance" className="volunteer-btn volunteer-btn-secondary">Finance Reports</Link>
            <Link to="/admin/memberships" className="volunteer-btn volunteer-btn-secondary">Memberships</Link>
          </div>
        </>
      )}
    </AdminShell>
  )
}
