import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  deleteBeneficiary,
  getBeneficiaries,
  saveBeneficiary,
  type Beneficiary,
  type BeneficiaryStatus,
} from '../../lib/beneficiaryService'

const STATUSES: BeneficiaryStatus[] = ['active', 'completed', 'on_hold', 'archived']

const EMPTY: Partial<Beneficiary> = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  category: '',
  program: '',
  supportType: '',
  notes: '',
  status: 'active',
  supportAmount: 0,
}

export default function BeneficiaryAdminPage() {
  const { authed } = useAdminAuth()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [form, setForm] = useState<Partial<Beneficiary>>(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)

  const refresh = async () => setBeneficiaries(await getBeneficiaries())

  useEffect(() => {
    if (authed) refresh()
  }, [authed])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName?.trim()) return
    await saveBeneficiary({ ...form, id: editing ?? undefined, fullName: form.fullName.trim() })
    setForm(EMPTY)
    setEditing(null)
    await refresh()
  }

  if (!authed) {
    return <AdminLogin title="Beneficiary Admin" subtitle="Manage beneficiary records and support tracking." />
  }

  return (
    <AdminShell title="Beneficiary Management" subtitle="Register and track programme beneficiaries">
      <div className="volunteer-admin-layout">
        <form className="volunteer-admin-profile admin-form-panel" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
          <label className="volunteer-field"><span>Full Name *</span><input value={form.fullName ?? ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
          <label className="volunteer-field"><span>Phone</span><input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="volunteer-field"><span>Category</span><input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label className="volunteer-field"><span>Program</span><input value={form.program ?? ''} onChange={(e) => setForm({ ...form, program: e.target.value })} /></label>
          <label className="volunteer-field"><span>Support Amount (₹)</span><input type="number" value={form.supportAmount ?? 0} onChange={(e) => setForm({ ...form, supportAmount: Number(e.target.value) })} /></label>
          <label className="volunteer-field"><span>Status</span>
            <select value={form.status ?? 'active'} onChange={(e) => setForm({ ...form, status: e.target.value as BeneficiaryStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" className="volunteer-btn volunteer-btn-primary">{editing ? 'Update' : 'Add'}</button>
        </form>

        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Name</th><th>Program</th><th>Support</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td>{b.fullName}</td>
                  <td>{b.program ?? '—'}</td>
                  <td>₹{b.supportAmount.toLocaleString('en-IN')}</td>
                  <td>{b.status}</td>
                  <td>
                    <button type="button" onClick={() => { setEditing(b.id); setForm(b) }}>Edit</button>
                    <button type="button" onClick={async () => { await deleteBeneficiary(b.id); await refresh() }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
