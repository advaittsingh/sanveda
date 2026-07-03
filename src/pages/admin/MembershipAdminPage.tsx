import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import MembershipAiInsights from '../../components/admin/memberships/MembershipAiInsights'
import MembershipAnalytics from '../../components/admin/memberships/MembershipAnalytics'
import MembershipFiltersPanel from '../../components/admin/memberships/MembershipFiltersPanel'
import MembershipKpiCards from '../../components/admin/memberships/MembershipKpiCards'
import MembershipPipeline from '../../components/admin/memberships/MembershipPipeline'
import MembershipProfileDrawer from '../../components/admin/memberships/MembershipProfileDrawer'
import MembershipRenewalDashboard from '../../components/admin/memberships/MembershipRenewalDashboard'
import MembershipTierManager from '../../components/admin/memberships/MembershipTierManager'
import MembershipToolbar, { MembershipEmptyState } from '../../components/admin/memberships/MembershipToolbar'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  downloadMembershipCertificate,
  updateMembership,
  type MembershipStatus,
} from '../../lib/membershipService'
import {
  exportMembersCsv,
  filterMembers,
  getMembershipDashboardData,
  type MemberFilters,
  type MemberProfile,
  type MembershipDashboardData,
} from '../../lib/membershipOperationsService'

const defaultFilters: MemberFilters = {
  search: '',
  tier: 'all',
  status: 'all',
  activity: 'all',
  engagement: 'all',
}

export default function MembershipAdminPage() {
  const { authed } = useAdminAuth()
  const [dashboard, setDashboard] = useState<MembershipDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MemberFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table')
  const [activeMember, setActiveMember] = useState<MemberProfile | null>(null)
  const [notes, setNotes] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDashboard(await getMembershipDashboardData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) refresh()
  }, [authed, refresh])

  const filteredMembers = useMemo(() => {
    if (!dashboard) return []
    return filterMembers(dashboard.members, filters)
  }, [dashboard, filters])

  const openProfile = (member: MemberProfile) => {
    setActiveMember(member)
    setNotes(member.adminNotes ?? '')
  }

  const setStatus = async (id: string, status: MembershipStatus) => {
    const updated = await updateMembership(id, { status })
    await refresh()
    if (updated) {
      const refreshed = (await getMembershipDashboardData()).members.find((m) => m.id === id)
      if (refreshed) setActiveMember(refreshed)
    }
  }

  const handleSaveNotes = async (id: string, adminNotes: string) => {
    await updateMembership(id, { adminNotes })
    await refresh()
  }

  const handleApproveApplications = async () => {
    const pending = filteredMembers.filter((m) => m.status === 'pending')
    for (const member of pending.slice(0, 10)) {
      await setStatus(member.id, 'approved')
    }
  }

  const handleGenerateCertificates = () => {
    const eligible = filteredMembers.filter(
      (m) => (m.status === 'active' || m.status === 'approved') && m.memberId,
    )
    if (!eligible.length) {
      window.alert('No approved members with certificates in the current view.')
      return
    }
    eligible.slice(0, 5).forEach((m) => downloadMembershipCertificate(m))
  }

  const handleSendRenewals = () => {
    const due = filteredMembers.filter((m) => m.isRenewalDue || m.isOverdue)
    window.alert(
      due.length
        ? `Renewal reminders queued for ${due.length} member(s). Email integration coming soon.`
        : 'No renewals due in the current view.',
    )
  }

  const handleSendEmail = (member: MemberProfile) => {
    const subject = encodeURIComponent('Sanveda Membership Update')
    const body = encodeURIComponent(`Dear ${member.fullName},\n\nWe have an update regarding your Sanveda membership.\n\nRegards,\nSanveda Team`)
    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, '_blank')
  }

  if (!authed) {
    return <AdminLogin title="Membership Admin" subtitle="Review and approve membership applications." />
  }

  if (loading || !dashboard) {
    return (
      <AdminShell title="Membership Management" subtitle="Member applications, approvals, and certificates">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </AdminShell>
    )
  }

  const patchFilters = (patch: Partial<MemberFilters>) => setFilters((prev) => ({ ...prev, ...patch }))

  return (
    <AdminShell title="Membership Management" subtitle="Community, subscriptions, and governance CRM">
      <div className="space-y-6">
        <MembershipKpiCards kpis={dashboard.kpis} />

        <MembershipToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddMember={() => window.open('/membership/apply', '_blank')}
          onApproveApplications={handleApproveApplications}
          onGenerateCertificates={handleGenerateCertificates}
          onSendRenewals={handleSendRenewals}
          onExport={() => exportMembersCsv(filteredMembers)}
          search={filters.search}
          onSearchChange={(search) => patchFilters({ search })}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters ? <MembershipFiltersPanel filters={filters} onChange={patchFilters} /> : null}

        <MembershipTierManager tiers={dashboard.tiers} onSaved={refresh} />

        <MembershipRenewalDashboard renewals={dashboard.renewals} />

        <AdminCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">Member Directory</h3>
            <p className="text-sm text-slate-500">{filteredMembers.length} members</p>
          </div>

          {!filteredMembers.length ? (
            <MembershipEmptyState onAddMember={() => window.open('/membership/apply', '_blank')} />
          ) : viewMode === 'pipeline' ? (
            <MembershipPipeline pipeline={dashboard.pipeline} onSelect={openProfile} />
          ) : (
            <DataTable
              data={filteredMembers}
              keyFn={(m) => m.id}
              onRowClick={openProfile}
              selectedKey={activeMember?.id}
              columns={[
                {
                  key: 'member',
                  header: 'Member',
                  render: (m) => (
                    <div>
                      <p className="font-semibold text-[#0B2C6B]">{m.fullName}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  ),
                },
                { key: 'id', header: 'Membership ID', render: (m) => m.memberId ?? '—' },
                { key: 'tier', header: 'Tier', render: (m) => m.tierLabel },
                { key: 'joined', header: 'Joined', render: (m) => m.joinedLabel },
                { key: 'expires', header: 'Expires', render: (m) => m.expiresLabel },
                {
                  key: 'contributions',
                  header: 'Contributions',
                  render: (m) => `₹${m.totalContributions.toLocaleString('en-IN')}`,
                },
                { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (m) => (
                    <button
                      type="button"
                      className={`${adminBtnSecondary} !px-3 !py-1.5 text-xs`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProfile(m)
                      }}
                    >
                      <Eye size={13} className="mr-1" />
                      View
                    </button>
                  ),
                },
              ]}
            />
          )}
        </AdminCard>

        <MembershipAnalytics
          membershipGrowth={dashboard.membershipGrowth}
          tierDistribution={dashboard.tierDistribution}
          revenueByTier={dashboard.revenueByTier}
        />

        <MembershipAiInsights insights={dashboard.aiInsights} />
      </div>

      <MembershipProfileDrawer
        member={activeMember}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setActiveMember(null)}
        onStatusChange={setStatus}
        onSaveNotes={handleSaveNotes}
        onSendEmail={handleSendEmail}
      />
    </AdminShell>
  )
}
