import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { adminBtnDanger, adminBtnSecondary, adminLabelClass } from '../ui/adminStyles'

export interface ReassignOption {
  id: string
  label: string
}

interface Props {
  open: boolean
  title: string
  entityLabel: string
  entityName: string
  adminCount: number
  inviteCount: number
  reassignOptions: ReassignOption[]
  onClose: () => void
  onConfirm: (reassignToId?: string) => void | Promise<void>
}

export default function RbacDeleteConfirmModal({
  open,
  title,
  entityLabel,
  entityName,
  adminCount,
  inviteCount,
  reassignOptions,
  onClose,
  onConfirm,
}: Props) {
  const [reassignToId, setReassignToId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const needsReassign = adminCount > 0 || inviteCount > 0

  useEffect(() => {
    if (!open) return
    setReassignToId('')
    setSaving(false)
    setError(null)
  }, [open])

  if (!open) return null

  const parts: string[] = []
  if (adminCount > 0) parts.push(`${adminCount} admin user${adminCount === 1 ? '' : 's'}`)
  if (inviteCount > 0) parts.push(`${inviteCount} pending invitation${inviteCount === 1 ? '' : 's'}`)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <h2 className="text-lg font-semibold text-[#0B2C6B]">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-slate-600">
            Delete {entityLabel} <span className="font-semibold text-[#0B2C6B]">"{entityName}"</span>? This cannot be undone.
          </p>

          {needsReassign ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This {entityLabel} is assigned to {parts.join(' and ')}. Choose a replacement so accounts are not left without a {entityLabel}.
            </div>
          ) : (
            <p className="text-sm text-slate-500">No admin users or pending invitations currently use this {entityLabel}.</p>
          )}

          {needsReassign ? (
            <div>
              <label className={adminLabelClass}>Reassign to *</label>
              <select
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                value={reassignToId}
                onChange={(e) => setReassignToId(e.target.value)}
              >
                <option value="">Select {entityLabel}…</option>
                {reassignOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {reassignOptions.length === 0 ? (
                <p className="mt-2 text-sm text-red-600">
                  No other {entityLabel} is available for reassignment. Create one first, then retry delete.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose} disabled={saving}>Cancel</button>
            <button
              type="button"
              className={adminBtnDanger}
              disabled={saving || (needsReassign && (!reassignToId || reassignOptions.length === 0))}
              onClick={async () => {
                if (needsReassign && !reassignToId) {
                  setError(`Select a ${entityLabel} to reassign to before deleting.`)
                  return
                }
                setSaving(true)
                setError(null)
                try {
                  await onConfirm(needsReassign ? reassignToId : undefined)
                } catch (err) {
                  setError(err instanceof Error ? err.message : `Failed to delete ${entityLabel}`)
                  setSaving(false)
                }
              }}
            >
              {saving ? 'Deleting…' : needsReassign ? 'Reassign & Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
