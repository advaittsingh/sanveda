import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import DataTable from '../../components/admin/ui/DataTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import { adminBtnPrimary, adminBtnSecondary } from '../../components/admin/ui/adminStyles'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useRbac } from '../../context/RbacContext'
import {
  canApproveTask,
  defaultTaskFilters,
  filterAdminTasks,
  getAdminTasks,
  needsReview,
  reviewAdminTask,
  taskProofHref,
  type AdminTaskRow,
  type TaskApprovalStatus,
  type TaskFilters,
} from '../../lib/taskOperationsService'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function approvalLabel(status: TaskApprovalStatus) {
  if (status === 'changes_requested') return 'changes_requested'
  return status
}

export default function TasksAdminPage() {
  const { authed } = useAdminAuth()
  const { canAccessModule, canPerform } = useRbac()
  const includeVolunteers = canAccessModule('volunteers')
  const includeInterns = canAccessModule('internships')
  const canEditVolunteers = canPerform('volunteers', 'edit')
  const canEditInterns = canPerform('internships', 'edit')

  const [tasks, setTasks] = useState<AdminTaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters)
  const [active, setActive] = useState<AdminTaskRow | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!includeVolunteers && !includeInterns) {
        setTasks([])
        return
      }
      setTasks(await getAdminTasks({ includeVolunteers, includeInterns }))
    } catch (err) {
      setTasks([])
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [includeVolunteers, includeInterns])

  useEffect(() => {
    if (authed) void refresh()
  }, [authed, refresh])

  const filtered = useMemo(() => filterAdminTasks(tasks, filters), [tasks, filters])
  const needsReviewCount = useMemo(() => tasks.filter(needsReview).length, [tasks])

  const openReview = (task: AdminTaskRow) => {
    setActive(task)
    setNotes(task.approvalNotes ?? '')
    setActionError(null)
  }

  const canEditActive =
    active &&
    ((active.kind === 'volunteer' && canEditVolunteers) || (active.kind === 'intern' && canEditInterns))

  const runReview = async (approvalStatus: Exclude<TaskApprovalStatus, 'unreviewed'>) => {
    if (!active || !canEditActive) return
    setBusy(true)
    setActionError(null)
    try {
      await reviewAdminTask({
        kind: active.kind,
        taskId: active.id,
        approvalStatus,
        notes,
      })
      await refresh()
      setActive(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update approval')
    } finally {
      setBusy(false)
    }
  }

  if (!includeVolunteers && !includeInterns) {
    return (
      <AdminShell title="Tasks" subtitle="Review volunteer and intern task proof of work.">
        <AdminCard>
          <p className="text-sm text-slate-500">
            Your role does not include volunteers or internships access required for this module.
          </p>
        </AdminCard>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="Tasks"
      subtitle="All volunteer and intern tasks — review proof of work and approve completed work."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search task, assignee, project…"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="min-w-[220px] flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
        />
        <select
          className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
          value={filters.kind}
          onChange={(e) => setFilters((prev) => ({ ...prev, kind: e.target.value as TaskFilters['kind'] }))}
        >
          <option value="all">All kinds</option>
          {includeVolunteers ? <option value="volunteer">Volunteer</option> : null}
          {includeInterns ? <option value="intern">Intern</option> : null}
        </select>
        <select
          className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value as TaskFilters['status'] }))
          }
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
          value={filters.approval}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, approval: e.target.value as TaskFilters['approval'] }))
          }
        >
          <option value="all">All approvals</option>
          <option value="needs_review">Needs review ({needsReviewCount})</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="changes_requested">Changes requested</option>
        </select>
        <button type="button" className={adminBtnSecondary} onClick={() => void refresh()}>
          Refresh
        </button>
      </div>

      {error ? (
        <AdminCard>
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </AdminCard>
      ) : (
        <DataTable
          loading={loading}
          data={filtered}
          keyFn={(row) => `${row.kind}-${row.id}`}
          emptyMessage="No tasks match these filters."
          onRowClick={openReview}
          selectedKey={active ? `${active.kind}-${active.id}` : undefined}
          columns={[
            {
              key: 'title',
              header: 'Task',
              render: (row) => (
                <div>
                  <p className="font-semibold text-[#0B2C6B]">{row.title}</p>
                  {row.projectTitle ? (
                    <p className="text-xs text-slate-500">{row.projectTitle}</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'assignee',
              header: 'Assignee',
              render: (row) => (
                <div>
                  <p className="font-medium">{row.assigneeName}</p>
                  <p className="text-xs text-slate-500">{row.assigneeEmail || '—'}</p>
                </div>
              ),
            },
            {
              key: 'kind',
              header: 'Kind',
              render: (row) => (
                <span className="capitalize">{row.kind === 'intern' ? 'Intern' : 'Volunteer'}</span>
              ),
            },
            {
              key: 'due',
              header: 'Due',
              render: (row) => formatDate(row.dueDate),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'proof',
              header: 'Proof',
              render: (row) =>
                row.proofUrl ? (
                  <a
                    href={taskProofHref(row.proofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#0B2C6B] underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.proofName || 'View'}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                ),
            },
            {
              key: 'approval',
              header: 'Approval',
              render: (row) => (
                <div className="space-y-1">
                  <StatusBadge status={approvalLabel(row.approvalStatus)} />
                  {needsReview(row) ? (
                    <p className="text-[11px] font-semibold text-amber-700">Ready for review</p>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      )}

      {active ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30 p-4" onClick={() => setActive(null)}>
          <aside
            className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {active.kind === 'intern' ? 'Intern task' : 'Volunteer task'}
                </p>
                <h2 className="text-lg font-bold text-[#0B2C6B]">{active.title}</h2>
              </div>
              <button type="button" className={adminBtnSecondary} onClick={() => setActive(null)}>
                Close
              </button>
            </div>

            <div className="grid gap-3 text-sm">
              <p>
                <span className="font-semibold text-slate-500">Assignee:</span> {active.assigneeName}
              </p>
              <p>
                <span className="font-semibold text-slate-500">Due:</span> {formatDate(active.dueDate)}
              </p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={active.status} />
                <StatusBadge status={approvalLabel(active.approvalStatus)} />
              </div>
              {active.proofUrl ? (
                <a
                  href={taskProofHref(active.proofUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#0B2C6B] underline"
                >
                  Open proof{active.proofName ? `: ${active.proofName}` : ''}
                </a>
              ) : (
                <p className="text-slate-500">No proof uploaded yet.</p>
              )}
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-slate-600">Review notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={!canEditActive || busy}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                placeholder="Optional notes for the volunteer/intern…"
              />
            </label>

            {actionError ? <p className="text-sm font-semibold text-red-700">{actionError}</p> : null}

            {canEditActive ? (
              <div className="mt-auto flex flex-col gap-2">
                <button
                  type="button"
                  className={adminBtnPrimary}
                  disabled={busy || !canApproveTask(active)}
                  title={
                    canApproveTask(active)
                      ? 'Approve this completed task with proof'
                      : 'Requires completed status and uploaded proof'
                  }
                  onClick={() => void runReview('approved')}
                >
                  {busy ? 'Saving…' : 'Approve'}
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  disabled={busy}
                  onClick={() => void runReview('changes_requested')}
                >
                  Request changes
                </button>
                <button
                  type="button"
                  className={adminBtnSecondary}
                  disabled={busy}
                  onClick={() => void runReview('rejected')}
                >
                  Reject
                </button>
                {!canApproveTask(active) ? (
                  <p className="text-xs text-slate-500">
                    Approve is enabled only when status is completed and proof of work is uploaded.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You can view this task but do not have edit permission.</p>
            )}
          </aside>
        </div>
      ) : null}
    </AdminShell>
  )
}
