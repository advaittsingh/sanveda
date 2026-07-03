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
import { STATUS_LABELS, VOLUNTEER_ROLE_OPTIONS } from '../../constants/volunteerContent'
import type { VolunteerApplication, VolunteerStatus } from '../../types/volunteer'

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
    <AdminShell title="Volunteer Management" subtitle="Sanveda Global Humanitarian Foundation">

      <div className="volunteer-admin-stats">
        <div><strong>{stats.total}</strong><span>Total Applications</span></div>
        <div><strong>{stats.pending}</strong><span>Pending</span></div>
        <div><strong>{stats.approved}</strong><span>Approved</span></div>
        <div><strong>{stats.rejected}</strong><span>Rejected</span></div>
        <div><strong>{stats.active}</strong><span>Active Volunteers</span></div>
      </div>

      <div className="volunteer-admin-layout">
        <div className="volunteer-admin-table-wrap">
          {loading ? <p className="volunteer-admin-empty">Loading…</p> : null}
          <table className="volunteer-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} data-selected={selected?.id === app.id}>
                  <td>{app.fullName}</td>
                  <td>{app.email}</td>
                  <td>{app.preferredRoles.map(roleLabel).join(', ')}</td>
                  <td>{app.city}, {app.state}</td>
                  <td><span className={`volunteer-status-badge status-${app.status}`}>{STATUS_LABELS[app.status]}</span></td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button type="button" onClick={() => openProfile(app)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !applications.length && <p className="volunteer-admin-empty">No applications yet.</p>}
        </div>

        {selected && (
          <aside className="volunteer-admin-profile">
            <h2>{selected.fullName}</h2>
            <p className="volunteer-admin-profile-id">{selected.id}</p>
            {selected.volunteerId ? <p><strong>Volunteer ID:</strong> {selected.volunteerId}</p> : null}

            <div className="volunteer-admin-profile-section">
              <h3>Personal Information</h3>
              <p>{selected.email} · {selected.phone}</p>
              <p>{selected.address}</p>
              <p>{selected.city}, {selected.state}, {selected.country}</p>
            </div>

            <div className="volunteer-admin-profile-section">
              <h3>Volunteer Details</h3>
              <p><strong>Roles:</strong> {selected.preferredRoles.map(roleLabel).join(', ')}</p>
              <p><strong>Type:</strong> {selected.volunteerType}</p>
              <p><strong>Hours/week:</strong> {selected.hoursPerWeek || '—'}</p>
            </div>

            <div className="volunteer-admin-profile-section">
              <h3>Skills & Motivation</h3>
              <p>{selected.motivation}</p>
              <p>{selected.skills}</p>
            </div>

            <div className="volunteer-admin-profile-section">
              <h3>Documents</h3>
              {selected.resumeDataUrl ? <a href={selected.resumeDataUrl} download={selected.resumeName} target="_blank" rel="noopener noreferrer">Download Resume</a> : <p>No resume</p>}
              {selected.idProofDataUrl ? <a href={selected.idProofDataUrl} download={selected.idProofName} target="_blank" rel="noopener noreferrer">Download ID Proof</a> : null}
              {selected.photoDataUrl ? <a href={selected.photoDataUrl} download={selected.photoName} target="_blank" rel="noopener noreferrer">Download Photo</a> : null}
            </div>

            <label className="volunteer-field">
              <span>Assigned Team</span>
              <input value={team} onChange={(e) => setTeam(e.target.value)} />
            </label>
            <label className="volunteer-field">
              <span>Interview Date</span>
              <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
            </label>
            <label className="volunteer-field">
              <span>Performance Notes</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>

            <div className="volunteer-admin-actions">
              <button type="button" onClick={() => setStatus(selected.id, 'screening')}>Move to Screening</button>
              <button type="button" onClick={() => applyPatch(selected.id, { status: 'interview', interviewDate: interviewDate || new Date().toISOString() })}>Schedule Interview</button>
              <button type="button" onClick={() => setStatus(selected.id, 'approved')}>Approve</button>
              <button type="button" onClick={() => setStatus(selected.id, 'rejected')}>Reject</button>
              <button type="button" onClick={() => setStatus(selected.id, 'active')}>Mark Active</button>
              {selected.volunteerId && selected.status !== 'rejected' ? (
                <>
                  <button type="button" onClick={() => downloadVolunteerIdCard(selected)}>Download ID Card</button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadAppointmentLetter({
                        recipientName: selected.fullName,
                        role: selected.preferredRoles[0] ?? 'Volunteer',
                        department: selected.assignedTeam ?? 'Field Operations',
                        startDate: new Date().toLocaleDateString('en-IN'),
                        type: 'volunteer',
                        referenceId: selected.volunteerId ?? selected.id,
                      })
                    }
                  >
                    Appointment Letter
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => applyPatch(selected.id, { assignedTeam: team, adminNotes: notes, interviewDate: interviewDate || undefined })}>Save Notes</button>
              <button
                type="button"
                onClick={() =>
                  notifyVolunteerByEmail(
                    selected,
                    'Sanveda Volunteer Update',
                    `Dear ${selected.fullName},\n\nWe have an update regarding your volunteer application (${selected.id}).\n\nRegards,\nSanveda Team`,
                  )
                }
              >
                Send Email
              </button>
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  )
}
