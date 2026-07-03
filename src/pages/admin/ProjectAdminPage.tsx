import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { deleteProject, getProjects, saveProject, type Project, type ProjectStatus } from '../../lib/projectService'

const STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'archived']
const EMPTY: Partial<Project> = { title: '', slug: '', status: 'planning', budget: 0, spent: 0, progressPercent: 0, beneficiariesCount: 0 }

export default function ProjectAdminPage() {
  const { authed } = useAdminAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState<Partial<Project>>(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)

  const refresh = async () => setProjects(await getProjects())
  useEffect(() => { if (authed) refresh() }, [authed])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return
    await saveProject({ ...form, id: editing ?? undefined, title: form.title, slug: form.slug })
    setForm(EMPTY)
    setEditing(null)
    await refresh()
  }

  if (!authed) return <AdminLogin title="Project Admin" subtitle="Track humanitarian projects." />

  return (
    <AdminShell title="Project Management" subtitle="Create and track programme projects">
      <div className="volunteer-admin-layout">
        <form className="volunteer-admin-profile admin-form-panel" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Project' : 'New Project'}</h2>
          <label className="volunteer-field"><span>Title *</span><input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label className="volunteer-field"><span>Slug *</span><input value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
          <label className="volunteer-field"><span>Focus Area</span><input value={form.focusArea ?? ''} onChange={(e) => setForm({ ...form, focusArea: e.target.value })} /></label>
          <label className="volunteer-field"><span>Budget (₹)</span><input type="number" value={form.budget ?? 0} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></label>
          <label className="volunteer-field"><span>Progress %</span><input type="number" min={0} max={100} value={form.progressPercent ?? 0} onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })} /></label>
          <label className="volunteer-field"><span>Status</span>
            <select value={form.status ?? 'planning'} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button type="submit" className="volunteer-btn volunteer-btn-primary">{editing ? 'Update' : 'Create'}</button>
        </form>
        <div className="volunteer-admin-table-wrap">
          <table className="volunteer-admin-table">
            <thead><tr><th>Title</th><th>Focus</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td><td>{p.focusArea ?? '—'}</td><td>{p.progressPercent}%</td>
                  <td>{p.status}</td>
                  <td>
                    <button type="button" onClick={() => { setEditing(p.id); setForm(p) }}>Edit</button>
                    <button type="button" onClick={async () => { await deleteProject(p.id); await refresh() }}>Delete</button>
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
