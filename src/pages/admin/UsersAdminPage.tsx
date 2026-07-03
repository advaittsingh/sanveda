import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getAdminUsers, updateAdminRole, type AdminRole, type AdminUser } from '../../lib/rbacService'

const ROLES: AdminRole[] = ['super_admin', 'admin', 'finance', 'content', 'volunteer']

export default function UsersAdminPage() {
  const { authed } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])

  const refresh = async () => setUsers(await getAdminUsers())
  useEffect(() => { if (authed) refresh() }, [authed])

  const handleRoleChange = async (userId: string, role: AdminRole) => {
    await updateAdminRole(userId, role)
    await refresh()
  }

  if (!authed) {
    return <AdminLogin title="Admin Users" subtitle="Manage admin roles and permissions." />
  }

  return (
    <AdminShell title="Admin Users" subtitle="Role-based access control (RBAC)">
      <p style={{ marginBottom: 16, color: '#4A4A49', fontSize: 14 }}>
        Assign roles to control which admin modules each user can access. Add admins via Supabase:{' '}
        <code>insert into admin_users (user_id, role) values (&apos;uuid&apos;, &apos;admin&apos;);</code>
      </p>
      <div className="volunteer-admin-table-wrap">
        <table className="volunteer-admin-table">
          <thead><tr><th>User ID</th><th>Email</th><th>Role</th><th>Since</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td style={{ fontSize: 11 }}>{u.userId}</td>
                <td>{u.email ?? '—'}</td>
                <td>
                  <select value={u.role} onChange={(e) => handleRoleChange(u.userId, e.target.value as AdminRole)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="volunteer-admin-empty">No admin users found.</p>}
      </div>
    </AdminShell>
  )
}
