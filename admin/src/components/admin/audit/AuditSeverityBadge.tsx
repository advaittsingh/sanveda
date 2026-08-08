import { SEVERITY_LABELS, type AuditSeverity } from '../../../lib/auditOperationsService'

const styles: Record<AuditSeverity, string> = {
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  security: 'bg-violet-50 text-violet-700 border-violet-200',
}

export default function AuditSeverityBadge({ severity }: { severity: AuditSeverity }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${styles[severity]}`}>
      {SEVERITY_LABELS[severity]}
    </span>
  )
}
