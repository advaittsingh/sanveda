import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { BRAND, C } from '../constants/brand'
import { useAuth } from '../context/AuthContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  downloadVolunteerIdCard,
  downloadAppointmentLetter,
} from '../lib/documentService'
import { downloadInternshipCertificate, downloadInternshipLor } from '../lib/internshipService'
import { deliveryUrl, uploadPrivateFile } from '../lib/privateStorageClient'
import { runDocumentAction } from '../lib/runDocumentAction'
import {
  getServicePortalData,
  hasServiceAccess,
  toInternship,
  toVolunteerApplication,
  updateMyTask,
  type ServicePortalData,
  type ServiceTask,
  type ServiceTaskStatus,
} from '../lib/servicePortalService'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 4px 16px rgba(4,27,77,0.04)',
      }}
    >
      <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: C.primary }}>{title}</h2>
      {children}
    </section>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted }}>
        {label}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: C.text }}>{value || '—'}</p>
    </div>
  )
}

function TaskRow({
  task,
  busy,
  onStatusChange,
  onProofUpload,
}: {
  task: ServiceTask
  busy: boolean
  onStatusChange: (task: ServiceTask, status: ServiceTaskStatus) => void
  onProofUpload: (task: ServiceTask, file: File) => void
}) {
  const editable = task.source === 'volunteer' || task.source === 'intern'
  const proofHref = deliveryUrl(task.proofUrl ?? undefined)
  const approval = task.approvalStatus || 'unreviewed'
  const approvalLabel =
    approval === 'approved'
      ? 'Approved'
      : approval === 'rejected'
        ? 'Rejected'
        : approval === 'changes_requested'
          ? 'Changes requested'
          : task.status === 'completed' && task.proofUrl
            ? 'Awaiting review'
            : 'Unreviewed'
  const approvalColor =
    approval === 'approved'
      ? '#166534'
      : approval === 'rejected'
        ? '#B91C1C'
        : approval === 'changes_requested'
          ? '#B45309'
          : C.textMuted

  return (
    <tr style={{ borderTop: `1px solid ${C.border}`, verticalAlign: 'top' }}>
      <td style={{ padding: '12px 6px', fontWeight: 600 }}>
        <div>{task.title}</div>
        {editable ? (
          <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
            {proofHref ? (
              <a
                href={proofHref}
                target="_blank"
                rel="noreferrer"
                style={{ color: C.primary, fontSize: 12, fontWeight: 700 }}
              >
                View proof{task.proofName ? `: ${task.proofName}` : ''}
              </a>
            ) : (
              <span style={{ color: C.textMuted, fontSize: 12 }}>No proof uploaded yet</span>
            )}
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: busy ? 'default' : 'pointer' }}>
              {busy ? 'Uploading…' : 'Upload proof (PDF, DOC, or image)'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf"
                disabled={busy}
                style={{ display: 'block', marginTop: 4, fontSize: 12 }}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) onProofUpload(task, file)
                }}
              />
            </label>
            {(approval === 'rejected' || approval === 'changes_requested') && task.approvalNotes ? (
              <p style={{ margin: 0, fontSize: 12, color: '#B45309', fontWeight: 600 }}>
                Reviewer note: {task.approvalNotes}
              </p>
            ) : null}
          </div>
        ) : null}
      </td>
      <td style={{ padding: '12px 6px' }}>{formatDate(task.dueDate)}</td>
      <td style={{ padding: '12px 6px' }}>
        {editable ? (
          <select
            value={['pending', 'in_progress', 'completed'].includes(task.status) ? task.status : 'pending'}
            disabled={busy}
            onChange={(event) => onStatusChange(task, event.target.value as ServiceTaskStatus)}
            style={{
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              padding: '6px 8px',
              fontSize: 13,
              textTransform: 'capitalize',
              background: C.white,
            }}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        ) : (
          <span style={{ textTransform: 'capitalize' }}>{String(task.status).replace(/_/g, ' ')}</span>
        )}
      </td>
      <td style={{ padding: '12px 6px' }}>
        {editable ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: approvalColor }}>{approvalLabel}</span>
        ) : (
          '—'
        )}
      </td>
      <td style={{ padding: '12px 6px' }}>
        {task.source === 'intern' ? 'Internship' : task.source === 'volunteer' ? 'Volunteer' : 'Project'}
      </td>
    </tr>
  )
}

export default function ServicePortalPage() {
  const mobile = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<ServicePortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [docMessage, setDocMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [docBusy, setDocBusy] = useState(false)
  const [taskBusyId, setTaskBusyId] = useState<string | null>(null)
  const [taskMessage, setTaskMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const portal = await getServicePortalData()
      if (!hasServiceAccess(portal)) {
        setError('No volunteer or internship record is linked to this account yet.')
        setData(portal)
        return
      }
      setData(portal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your portal.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login?redirect=/portal')
      return
    }
    void load()
  }, [user, authLoading, navigate, load])

  const projects = useMemo(() => {
    if (!data) return []
    const map = new Map<string, { title: string; role: string; status: string; kind: string }>()
    for (const row of data.volunteerAssignments) {
      if (!row.projectId) continue
      map.set(row.projectId, {
        title: row.projectTitle || 'Project',
        role: row.role,
        status: row.status,
        kind: 'Volunteer',
      })
    }
    for (const row of data.internshipAssignments) {
      if (!row.projectId) continue
      map.set(row.projectId, {
        title: row.projectTitle || 'Project',
        role: row.role,
        status: row.status,
        kind: 'Intern',
      })
    }
    return [...map.entries()].map(([id, value]) => ({ id, ...value }))
  }, [data])

  const tasks = useMemo(() => {
    if (!data) return []
    return [...data.volunteerTasks, ...data.internTasks, ...data.projectTasks]
  }, [data])

  const patchTask = useCallback((updated: ServiceTask) => {
    setData((prev) => {
      if (!prev) return prev
      const mapList = (list: ServiceTask[]) =>
        list.map((task) => (task.id === updated.id && task.source === updated.source ? { ...task, ...updated } : task))
      return {
        ...prev,
        volunteerTasks: mapList(prev.volunteerTasks),
        internTasks: mapList(prev.internTasks),
      }
    })
  }, [])

  const handleStatusChange = async (task: ServiceTask, status: ServiceTaskStatus) => {
    if (task.source !== 'volunteer' && task.source !== 'intern') return
    setTaskBusyId(task.id)
    setTaskMessage(null)
    try {
      const updated = await updateMyTask({ kind: task.source, taskId: task.id, status })
      patchTask(updated)
      setTaskMessage({ tone: 'ok', text: 'Task status updated.' })
    } catch (err) {
      setTaskMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not update status.' })
    } finally {
      setTaskBusyId(null)
    }
  }

  const handleProofUpload = async (task: ServiceTask, file: File) => {
    if (task.source !== 'volunteer' && task.source !== 'intern') return
    setTaskBusyId(task.id)
    setTaskMessage(null)
    try {
      const stored = await uploadPrivateFile('task-proof', task.id, file)
      const updated = await updateMyTask({
        kind: task.source,
        taskId: task.id,
        proofUrl: stored.path,
        proofName: stored.originalName,
        proofContentType: stored.contentType,
      })
      patchTask(updated)
      setTaskMessage({ tone: 'ok', text: 'Proof of work uploaded.' })
    } catch (err) {
      setTaskMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Could not upload proof of work.',
      })
    } finally {
      setTaskBusyId(null)
    }
  }

  const runDoc = async (label: string, action: () => void | Promise<void>) => {
    setDocBusy(true)
    setDocMessage(null)
    const result = await runDocumentAction(action)
    setDocBusy(false)
    setDocMessage(result.ok ? { tone: 'ok', text: label } : { tone: 'error', text: result.message })
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: C.textMuted }}>
        Loading your volunteer & internship portal…
      </div>
    )
  }

  if (!user || !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: C.textMuted }}>
        {error || 'Sign in to continue.'}
      </div>
    )
  }

  const volunteer = data.volunteer
  const internship = data.internship
  const canDownloadId = Boolean(volunteer?.volunteerId)
  const canDownloadVolunteerAppt = Boolean(volunteer && ['approved', 'orientation', 'active'].includes(volunteer.status))
  const canDownloadInternAppt = Boolean(
    internship && ['approved', 'active', 'completed'].includes(internship.status),
  )
  const canDownloadLor = Boolean(internship && (internship.status === 'active' || internship.status === 'completed'))
  const canDownloadCert = Boolean(internship?.status === 'completed' && internship.certificateNumber)

  return (
    <div style={{ background: C.grayBg, paddingBottom: mobile ? 40 : 80, minHeight: '60vh' }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'My Service Portal', path: null },
        ]}
      />

      <div
        style={{
          width: '94.44%',
          maxWidth: 1100,
          margin: '0 auto',
          padding: mobile ? '20px 16px' : '32px 0',
          display: 'grid',
          gap: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: mobile ? 26 : 34, fontWeight: 800, color: C.primary, margin: '0 0 4px' }}>
            My Service Portal
          </h1>
          <p style={{ color: C.textMuted, margin: 0, fontSize: 14 }}>
            Your {BRAND.shortName} volunteer and internship work — projects, tasks, and documents
          </p>
        </div>

        {error ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: '#FEF2F2',
              color: '#B91C1C',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {error} Apply as a volunteer or intern with this email, or ask admin to update your application email.
          </div>
        ) : null}

        {volunteer ? (
          <Card title="Volunteer profile">
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)' }}>
              <Info label="Name" value={volunteer.fullName} />
              <Info label="Status" value={String(volunteer.status).replace(/_/g, ' ')} />
              <Info label="Volunteer ID" value={volunteer.volunteerId || 'Pending approval'} />
              <Info label="Assigned team" value={volunteer.assignedTeam} />
              <Info label="Department" value={volunteer.department} />
              <Info label="Email" value={volunteer.email} />
            </div>
          </Card>
        ) : null}

        {internship ? (
          <Card title="Internship profile">
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)' }}>
              <Info label="Name" value={internship.fullName} />
              <Info label="Status" value={String(internship.status).replace(/_/g, ' ')} />
              <Info label="Application ID" value={internship.applicationId} />
              <Info label="Department" value={internship.preferredDepartment} />
              <Info label="Mentor" value={internship.mentorName} />
              <Info label="Program" value={internship.programName} />
              <Info label="Start" value={formatDate(internship.startDate)} />
              <Info label="End" value={formatDate(internship.endDate)} />
              <Info label="Certificate #" value={internship.certificateNumber || 'Issued on completion'} />
            </div>
          </Card>
        ) : null}

        <Card title="My projects">
          {projects.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: C.textMuted, fontSize: 12, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 6px' }}>Project</th>
                    <th style={{ padding: '8px 6px' }}>Role</th>
                    <th style={{ padding: '8px 6px' }}>Type</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: C.primary }}>{project.title}</td>
                      <td style={{ padding: '10px 6px' }}>{project.role}</td>
                      <td style={{ padding: '10px 6px' }}>{project.kind}</td>
                      <td style={{ padding: '10px 6px', textTransform: 'capitalize' }}>
                        {project.status.replace(/_/g, ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, color: C.textMuted, fontSize: 14 }}>
              No project assignments yet. Your coordinator will assign you from the admin panel.
            </p>
          )}
        </Card>

        <Card title="My tasks">
          {taskMessage ? (
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 13,
                fontWeight: 600,
                color: taskMessage.tone === 'ok' ? '#166534' : '#B91C1C',
              }}
            >
              {taskMessage.text}
            </p>
          ) : null}
          {tasks.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: C.textMuted, fontSize: 12, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 6px' }}>Task & proof</th>
                    <th style={{ padding: '8px 6px' }}>Due</th>
                    <th style={{ padding: '8px 6px' }}>Status</th>
                    <th style={{ padding: '8px 6px' }}>Approval</th>
                    <th style={{ padding: '8px 6px' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <TaskRow
                      key={`${task.source}-${task.id}`}
                      task={task}
                      busy={taskBusyId === task.id}
                      onStatusChange={(row, status) => void handleStatusChange(row, status)}
                      onProofUpload={(row, file) => void handleProofUpload(row, file)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, color: C.textMuted, fontSize: 14 }}>No tasks assigned yet.</p>
          )}
        </Card>

        <Card title="Documents">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              disabled={!canDownloadId || docBusy}
              onClick={() =>
                volunteer &&
                void runDoc('Volunteer ID card downloaded.', () =>
                  downloadVolunteerIdCard(toVolunteerApplication(volunteer)),
                )
              }
              style={docButtonStyle(canDownloadId && !docBusy)}
            >
              Download volunteer ID card
            </button>
            <button
              type="button"
              disabled={!canDownloadVolunteerAppt || docBusy}
              onClick={() =>
                volunteer &&
                void runDoc('Volunteer appointment letter downloaded.', () =>
                  downloadAppointmentLetter({
                    recipientName: volunteer.fullName,
                    role: volunteer.preferredRoles?.[0] || 'Volunteer',
                    department: volunteer.department || volunteer.assignedTeam || 'Operations',
                    startDate: new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                    type: 'volunteer',
                    referenceId: volunteer.volunteerId || volunteer.id,
                  }),
                )
              }
              style={docButtonStyle(canDownloadVolunteerAppt && !docBusy)}
            >
              Volunteer appointment letter
            </button>
            <button
              type="button"
              disabled={!canDownloadInternAppt || docBusy}
              onClick={() =>
                internship &&
                void runDoc('Internship appointment letter downloaded.', () =>
                  downloadAppointmentLetter({
                    recipientName: internship.fullName,
                    role: `${internship.preferredDepartment || 'General'} Intern`,
                    department: internship.preferredDepartment || 'Internship Programme',
                    startDate: internship.startDate
                      ? new Date(internship.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : new Date().toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }),
                    type: 'intern',
                    referenceId: internship.internCode || internship.applicationId || internship.id,
                  }),
                )
              }
              style={docButtonStyle(canDownloadInternAppt && !docBusy)}
            >
              Internship appointment letter
            </button>
            <button
              type="button"
              disabled={!canDownloadLor || docBusy}
              onClick={() =>
                internship &&
                void runDoc('Letter of recommendation downloaded.', () =>
                  downloadInternshipLor(toInternship(internship)),
                )
              }
              style={docButtonStyle(canDownloadLor && !docBusy)}
            >
              Download LOR
            </button>
            <button
              type="button"
              disabled={!canDownloadCert || docBusy}
              onClick={() =>
                internship &&
                void runDoc('Internship certificate downloaded.', () =>
                  downloadInternshipCertificate(toInternship(internship)),
                )
              }
              style={docButtonStyle(canDownloadCert && !docBusy)}
            >
              Internship completion certificate
            </button>
          </div>
          <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: C.textMuted, fontSize: 13, lineHeight: 1.6 }}>
            <li>Volunteer ID unlocks after approval; appointment letter unlocks at approved / training / active.</li>
            <li>Internship appointment letter unlocks once selected (approved) or later.</li>
            <li>LOR is available while your internship is active or completed.</li>
            <li>Completion certificate unlocks only after status is completed and a certificate number is issued.</li>
          </ul>
          {docMessage ? (
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 13,
                fontWeight: 600,
                color: docMessage.tone === 'error' ? '#B91C1C' : '#047857',
              }}
            >
              {docMessage.text}
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}

function docButtonStyle(enabled: boolean): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: enabled ? C.primary : '#94A3B8',
    color: C.white,
    fontWeight: 700,
    fontSize: 13,
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.7,
  }
}
