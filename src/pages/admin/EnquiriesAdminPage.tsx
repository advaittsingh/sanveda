import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getEnquiries, updateEnquiry, type Enquiry, type EnquiryStatus } from '../../lib/enquiryService'

const STATUS_OPTIONS: EnquiryStatus[] = ['new', 'in_progress', 'resolved', 'closed']

export default function EnquiriesAdminPage() {
  const { authed } = useAdminAuth()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<EnquiryStatus>('new')
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setEnquiries(await getEnquiries())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const openEnquiry = (enquiry: Enquiry) => {
    setSelected(enquiry)
    setNotes(enquiry.adminNotes ?? '')
    setStatus(enquiry.status)
  }

  const save = async () => {
    if (!selected) return
    await updateEnquiry(selected.id, { status, adminNotes: notes })
    await refresh()
    const updated = (await getEnquiries()).find((e) => e.id === selected.id)
    if (updated) setSelected(updated)
  }

  if (!authed) {
    return (
      <AdminLogin
        title="Enquiries Admin"
        subtitle="Sign in to manage contact form submissions."
      />
    )
  }

  return (
    <AdminShell title="Enquiry Management" subtitle="Contact form submissions">

      <div className="volunteer-admin-stats">
        <div><strong>{enquiries.length}</strong><span>Total</span></div>
        <div><strong>{enquiries.filter((e) => e.status === 'new').length}</strong><span>New</span></div>
        <div><strong>{enquiries.filter((e) => e.status === 'in_progress').length}</strong><span>In Progress</span></div>
        <div><strong>{enquiries.filter((e) => e.status === 'resolved').length}</strong><span>Resolved</span></div>
      </div>

      <div className="volunteer-admin-layout">
        <div className="volunteer-admin-table-wrap">
          {loading ? <p className="volunteer-admin-empty">Loading…</p> : null}
          <table className="volunteer-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} data-selected={selected?.id === e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.subject}</td>
                  <td><span className={`volunteer-status-badge status-${e.status}`}>{e.status}</span></td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td><button type="button" onClick={() => openEnquiry(e)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !enquiries.length && <p className="volunteer-admin-empty">No enquiries yet.</p>}
        </div>

        {selected && (
          <aside className="volunteer-admin-profile">
            <h2>{selected.name}</h2>
            <p>{selected.email} · {selected.phone}</p>
            <p><strong>Subject:</strong> {selected.subject}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p>

            <label className="volunteer-field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="volunteer-field">
              <span>Admin Notes</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>

            <div className="volunteer-admin-actions">
              <button type="button" onClick={save}>Save</button>
              <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>Reply via Email</a>
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  )
}
