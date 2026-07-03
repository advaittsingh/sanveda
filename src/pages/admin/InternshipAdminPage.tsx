import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { downloadInternshipCertificate, getInternships, updateInternship, type Internship, type InternshipStatus } from '../../lib/internshipService'

export default function InternshipAdminPage() {
  const { authed } = useAdminAuth()
  const [internships, setInternships] = useState<Internship[]>([])
  const [selected, setSelected] = useState<Internship | null>(null)

  const refresh = async () => setInternships(await getInternships())
  useEffect(() => { if (authed) refresh() }, [authed])

  const setStatus = async (id: string, status: InternshipStatus) => {
    const updated = await updateInternship(id, { status })
    await refresh()
    if (updated) setSelected(updated)
  }

  if (!authed) return <AdminLogin title="Internship Admin" subtitle="Manage internship applications." />

  return (
    <AdminShell title="Internship Management" subtitle="Applications, approvals, and certificates">
      <div className="volunteer-admin-layout">
        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Name</th><th>University</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {internships.map((i) => (
                <tr key={i.id}><td>{i.fullName}</td><td>{i.university}</td><td>{i.preferredDepartment}</td>
                  <td><span className={`volunteer-status-badge status-${i.status}`}>{i.status}</span></td>
                  <td><button type="button" onClick={() => setSelected(i)}>View</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <aside className="volunteer-admin-profile">
            <h2>{selected.fullName}</h2>
            <p>{selected.email} · {selected.applicationId}</p>
            <p>{selected.motivation}</p>
            <div className="volunteer-admin-actions">
              <button type="button" onClick={() => setStatus(selected.id, 'review')}>Review</button>
              <button type="button" onClick={() => setStatus(selected.id, 'approved')}>Approve</button>
              <button type="button" onClick={() => setStatus(selected.id, 'active')}>Activate</button>
              <button type="button" onClick={() => setStatus(selected.id, 'completed')}>Complete & Certificate</button>
              <button type="button" onClick={() => setStatus(selected.id, 'rejected')}>Reject</button>
              {selected.certificateNumber && <button type="button" onClick={() => downloadInternshipCertificate(selected)}>Download Certificate</button>}
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  )
}
