import { useEffect, useState } from 'react'
import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import DataTable from '../../components/admin/ui/DataTable'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getAuditLogs, type AuditLog } from '../../lib/auditService'

export default function AuditAdminPage() {
  const { authed } = useAdminAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authed) getAuditLogs(200).then(setLogs).finally(() => setLoading(false))
  }, [authed])

  if (!authed) return <AdminLogin title="Audit Logs" subtitle="View system activity and audit trail." />

  return (
    <AdminShell title="Audit Logs" subtitle="User actions, modules, and change history">
      <DataTable
        loading={loading}
        data={logs}
        keyFn={(log) => log.id}
        emptyMessage="No audit entries yet."
        columns={[
          { key: 'time', header: 'Timestamp', render: (log) => new Date(log.createdAt).toLocaleString() },
          { key: 'user', header: 'User', render: (log) => String(log.details?.userId ?? log.details?.user ?? 'System') },
          { key: 'action', header: 'Action', render: (log) => log.action },
          { key: 'module', header: 'Module', render: (log) => log.entityType },
          { key: 'id', header: 'Entity ID', render: (log) => log.entityId ?? '—' },
          { key: 'details', header: 'Details', render: (log) => <span className="text-xs text-slate-500">{JSON.stringify(log.details)}</span> },
        ]}
      />
    </AdminShell>
  )
}
