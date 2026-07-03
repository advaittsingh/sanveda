import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  downloadMembershipCertificate,
  getMemberships,
  updateMembership,
  type Membership,
  type MembershipStatus,
} from '../../lib/membershipService'
import { downloadMemberIdCard } from '../../lib/documentService'

export default function MembershipAdminPage() {
  const { authed } = useAdminAuth()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selected, setSelected] = useState<Membership | null>(null)
  const [notes, setNotes] = useState('')

  const refresh = async () => setMemberships(await getMemberships())

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const setStatus = async (id: string, status: MembershipStatus) => {
    const updated = await updateMembership(id, { status })
    await refresh()
    if (updated) setSelected(updated)
  }

  if (!authed) {
    return <AdminLogin title="Membership Admin" subtitle="Review and approve membership applications." />
  }

  return (
    <AdminShell title="Membership Management" subtitle="Member applications, approvals, and certificates">
      <div className="volunteer-admin-stats">
        <div><strong>{memberships.length}</strong><span>Total</span></div>
        <div><strong>{memberships.filter((m) => m.status === 'pending').length}</strong><span>Pending</span></div>
        <div><strong>{memberships.filter((m) => m.status === 'active').length}</strong><span>Active</span></div>
      </div>

      <div className="volunteer-admin-layout">
        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} data-selected={selected?.id === m.id}>
                  <td>{m.fullName}</td>
                  <td>{m.email}</td>
                  <td>{m.tier}</td>
                  <td><span className={`volunteer-status-badge status-${m.status}`}>{m.status}</span></td>
                  <td><button type="button" onClick={() => { setSelected(m); setNotes(m.adminNotes ?? '') }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <aside className="volunteer-admin-profile">
            <h2>{selected.fullName}</h2>
            <p>{selected.email} · {selected.phone}</p>
            {selected.memberId ? <p><strong>Member ID:</strong> {selected.memberId}</p> : null}
            {selected.certificateNumber ? <p><strong>Certificate:</strong> {selected.certificateNumber}</p> : null}
            <p>{selected.motivation}</p>
            <label className="volunteer-field"><span>Notes</span><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
            <div className="volunteer-admin-actions">
              <button type="button" onClick={() => setStatus(selected.id, 'approved')}>Approve</button>
              <button type="button" onClick={() => setStatus(selected.id, 'active')}>Activate</button>
              <button type="button" onClick={() => setStatus(selected.id, 'rejected')}>Reject</button>
              <button type="button" onClick={() => updateMembership(selected.id, { adminNotes: notes }).then(refresh)}>Save Notes</button>
              {(selected.status === 'active' || selected.status === 'approved') && selected.memberId ? (
                <>
                  <button type="button" onClick={() => downloadMembershipCertificate(selected)}>Download Certificate</button>
                  <button type="button" onClick={() => downloadMemberIdCard(selected)}>Download ID Card</button>
                </>
              ) : null}
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  )
}
