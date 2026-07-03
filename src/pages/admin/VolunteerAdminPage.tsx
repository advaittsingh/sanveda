import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  getVolunteerApplications,
  getVolunteerDashboardStats,
  notifyVolunteerByEmail,
  updateVolunteerApplication,
} from '../../lib/volunteerStore'
import { downloadAppointmentLetter, downloadVolunteerIdCard } from '../../lib/documentService'
import { registerVerification } from '../../lib/verificationService'
import { VOLUNTEER_ROLE_OPTIONS } from '../../constants/volunteerContent'
import type { VolunteerApplication, VolunteerStatus } from '../../types/volunteer'
import StatCard from '../../components/admin/ui/StatCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import DetailPanel from '../../components/admin/ui/DetailPanel'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../../components/admin/ui/adminStyles'

function roleLabel(role: string) {
  return VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role
}

export default function VolunteerAdminPage() {
  const { authed } = useAdminAuth()
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, active: 0, interview: 0 })
  const [selected, setSelected] = useState<VolunteerApplication | null>(null)
  const [notes, setNotes] = useState('')
  const [team, setTeam] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const [apps, dashboardStats] = await Promise.all([
        getVolunteerApplications(),
        getVolunteerDashboardStats(),
      ])
      setApplications(apps)
      setStats(dashboardStats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const openProfile = (app: VolunteerApplication) => {
    setSelected(app)
    setNotes(app.adminNotes ?? '')
    setTeam(app.assignedTeam ?? '')
    setInterviewDate(app.interviewDate ? app.interviewDate.slice(0, 16) : '')
  }

  const applyPatch = async (id: string, patchData: Partial<VolunteerApplication>) => {
    const updated = await updateVolunteerApplication(id, patchData)
    await refresh()
    if (updated) setSelected(updated)
  }

  const setStatus = async (id: string, status: VolunteerStatus) => {
    const updated = await updateVolunteerApplication(id, { status })
    await refresh()
    if (updated) setSelected(updated)
    if (!updated) return

    if (status === 'approved' && updated.volunteerId) {
      notifyVolunteerByEmail(
        updated,
        'Sanveda Volunteer Application Approved',
        `Dear ${updated.fullName},\n\nCongratulations! Your volunteer application has been approved.\nVolunteer ID: ${updated.volunteerId}\n\nWelcome to the Sanveda family.\n\nRegards,\nSanveda Global Humanitarian Foundation`,
      )
      await registerVerification({
        type: 'volunteer_id',
        holderName: updated.fullName,
        referenceId: updated.volunteerId,
        metadata: { applicationId: updated.id },
      }).catch(() => {})
    }
    if (status === 'rejected') {
      notifyVolunteerByEmail(
        updated,
        'Sanveda Volunteer Application Update',
        `Dear ${updated.fullName},\n\nThank you for your interest in volunteering with Sanveda. After careful review, we are unable to proceed with your application at this time.\n\nRegards,\nSanveda Global Humanitarian Foundation`,
      )
    }
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Volunteer Admin"
        subtitle="Sign in to manage volunteer applications."
      />
    )
  }

  return (
    <AdminShell title="Volunteer Management" subtitle="Applications, approvals, assignments, and ID cards">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Applications" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} accent="secondary" />
        <StatCard label="Approved" value={stats.approved} accent="green" />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Active" value={stats.active} accent="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <DataTable
          loading={loading}
          data={applications}
          keyFn={(app) => app.id}
          selectedKey={selected?.id}
          onRowClick={openProfile}
          columns={[
            {
              key: 'photo',
              header: '',
              render: (app) => (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2C6B]/10 text-sm font-bold text-[#0B2C6B]">
                  {app.fullName.charAt(0)}
                </span>
              ),
            },
            { key: 'name', header: 'Name', render: (app) => <span className="font-medium">{app.fullName}</span> },
            { key: 'role', header: 'Role', render: (app) => app.preferredRoles.map(roleLabel).join(', ') },
            { key: 'location', header: 'Location', render: (app) => `${app.city}, ${app.state}` },
            { key: 'team', header: 'Team', render: (app) => app.assignedTeam ?? '—' },
            { key: 'status', header: 'Status', render: (app) => <StatusBadge status={app.status} /> },
            {
              key: 'actions',
              header: 'Actions',
              render: (app) => (
                <button type="button" className={adminBtnSecondary} onClick={(e) => { e.stopPropagation(); openProfile(app) }}>
                  View
                </button>
              ),
            },
          ]}
        />

        <DetailPanel open={!!selected} onClose={() => setSelected(null)} title={selected?.fullName ?? 'Volunteer'}>
          {selected && (
            <div className="space-y-5 text-sm text-slate-600">
              <p className="text-xs text-slate-400">{selected.id}</p>
              {selected.volunteerId ? <p><strong className="text-slate-800">Volunteer ID:</strong> {selected.volunteerId}</p> : null}
              <div>
                <h3 className="mb-1 font-semibold text-[#0B2C6B]">Contact</h3>
                <p>{selected.email} · {selected.phone}</p>
                <p>{selected.address}</p>
                <p>{selected.city}, {selected.state}, {selected.country}</p>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-[#0B2C6B]">Details</h3>
                <p><strong>Roles:</strong> {selected.preferredRoles.map(roleLabel).join(', ')}</p>
                <p><strong>Type:</strong> {selected.volunteerType}</p>
                <p><strong>Hours/week:</strong> {selected.hoursPerWeek || '—'}</p>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-[#0B2C6B]">Motivation</h3>
                <p>{selected.motivation}</p>
                <p>{selected.skills}</p>
              </div>
              <label className="block"><span className={adminLabelClass}>Assigned Team</span>
                <input className={adminInputClass} value={team} onChange={(e) => setTeam(e.target.value)} />
              </label>
              <label className="block"><span className={adminLabelClass}>Interview Date</span>
                <input type="datetime-local" className={adminInputClass} value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
              </label>
              <label className="block"><span className={adminLabelClass}>Notes</span>
                <textarea className={adminInputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminBtnSecondary} onClick={() => setStatus(selected.id, 'screening')}>Screening</button>
                <button type="button" className={adminBtnSecondary} onClick={() => applyPatch(selected.id, { status: 'interview', interviewDate: interviewDate || new Date().toISOString() })}>Interview</button>
                <button type="button" className={adminBtnPrimary} onClick={() => setStatus(selected.id, 'approved')}>Approve</button>
                <button type="button" className={adminBtnSecondary} onClick={() => setStatus(selected.id, 'rejected')}>Reject</button>
                <button type="button" className={adminBtnPrimary} onClick={() => setStatus(selected.id, 'active')}>Activate</button>
                {selected.volunteerId && selected.status !== 'rejected' ? (
                  <>
                    <button type="button" className={adminBtnSecondary} onClick={() => downloadVolunteerIdCard(selected)}>ID Card</button>
                    <button type="button" className={adminBtnSecondary} onClick={() => downloadAppointmentLetter({ recipientName: selected.fullName, role: selected.preferredRoles[0] ?? 'Volunteer', department: selected.assignedTeam ?? 'Field Operations', startDate: new Date().toLocaleDateString('en-IN'), type: 'volunteer', referenceId: selected.volunteerId ?? selected.id })}>Appointment</button>
                  </>
                ) : null}
                <button type="button" className={adminBtnSecondary} onClick={() => applyPatch(selected.id, { assignedTeam: team, adminNotes: notes, interviewDate: interviewDate || undefined })}>Save</button>
                <button type="button" className={adminBtnSecondary} onClick={() => notifyVolunteerByEmail(selected, 'Sanveda Volunteer Update', `Dear ${selected.fullName},\n\nWe have an update regarding your volunteer application (${selected.id}).\n\nRegards,\nSanveda Team`)}>Email</button>
              </div>
            </div>
          )}
        </DetailPanel>
      </div>
    </AdminShell>
  )
}
