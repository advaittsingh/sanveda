import { X } from 'lucide-react'
import { formatAuditDetailTime, type AuditLogEntry } from '../../../lib/auditOperationsService'
import { adminBtnSecondary } from '../ui/adminStyles'
import AuditSeverityBadge from './AuditSeverityBadge'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  log: AuditLogEntry | null
  onClose: () => void
}

export default function AuditLogDrawer({ log, onClose }: Props) {
  if (!log) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">Activity Details</h2>
            <div className="mt-2 flex gap-2">
              <AuditSeverityBadge severity={log.severity} />
              <StatusBadge status={log.status} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <dl className="space-y-4 p-5 text-sm">
          <div><dt className="text-slate-500">Timestamp</dt><dd className="font-medium">{formatAuditDetailTime(log.createdAt)}</dd></div>
          <div><dt className="text-slate-500">User</dt><dd className="font-medium">{log.userName}</dd></div>
          <div><dt className="text-slate-500">Role</dt><dd className="font-medium">{log.role}</dd></div>
          <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{log.department}</dd></div>
          <div><dt className="text-slate-500">Module</dt><dd className="font-medium">{log.module}</dd></div>
          <div><dt className="text-slate-500">Action</dt><dd className="font-medium">{log.action}</dd></div>
          <div><dt className="text-slate-500">Entity</dt><dd className="font-medium">{log.entityType} {log.entityId !== '—' ? `#${log.entityId}` : ''}</dd></div>
          <div><dt className="text-slate-500">Object</dt><dd className="font-medium">{log.object}</dd></div>
          <div className="rounded-xl bg-[#F8FAFC] p-4">
            <dt className="text-slate-500">Old Value</dt>
            <dd className="mt-1 font-medium">{log.oldValue}</dd>
            <dt className="mt-3 text-slate-500">New Value</dt>
            <dd className="mt-1 font-medium">{log.newValue}</dd>
          </div>
          <div><dt className="text-slate-500">IP Address</dt><dd className="font-medium">{log.ip}</dd></div>
          <div><dt className="text-slate-500">Device</dt><dd className="font-medium">{log.device}</dd></div>
          <div><dt className="text-slate-500">Browser</dt><dd className="font-medium">{log.browser}</dd></div>
          <div><dt className="text-slate-500">Session ID</dt><dd className="font-mono text-xs">{log.sessionId}</dd></div>
        </dl>
        <div className="border-t border-[#E5E7EB] p-5">
          <button type="button" className={adminBtnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
