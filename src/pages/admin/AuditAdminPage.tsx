import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getAuditLogs, type AuditLog } from '../../lib/auditService'

export default function AuditAdminPage() {
  const { authed } = useAdminAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    if (authed) getAuditLogs(200).then(setLogs)
  }, [authed])

  if (!authed) return <AdminLogin title="Audit Log" subtitle="View system activity and audit trail." />

  return (
    <AdminShell title="Audit Log" subtitle="System activity and change history">
      <div className="volunteer-admin-table-wrap">
        <table className="volunteer-admin-table">
          <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>ID</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td>{log.entityId ?? '—'}</td>
                <td style={{ fontSize: 11 }}>{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && <p className="volunteer-admin-empty">No audit entries yet.</p>}
      </div>
    </AdminShell>
  )
}
