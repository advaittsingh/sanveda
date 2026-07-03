import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type { CampaignRecord, CampaignStatus } from '../../../lib/campaignService'
import type { CampaignAdminMeta } from '../../../types/campaignAdmin'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

const STEPS = [
  'Basic Details',
  'Beneficiary Details',
  'Story',
  'Media',
  'Financials',
  'Documents',
  'Publishing',
]

const STATUSES: CampaignStatus[] = [
  'draft', 'review', 'approved', 'published', 'paused', 'completed', 'rejected', 'archived',
]

const EMPTY: Partial<CampaignRecord> = {
  title: '',
  slug: '',
  goal: 5000000,
  raised: 0,
  description: '',
  exemption_tag: 'Tax Benefit',
  status: 'draft',
  banner_image: '/assets/fallBackBanner',
  thumbnail_image: '/assets/fallBackBanner',
  category: '["General"]',
  featureUrgent: 0,
  featureRecent: 0,
  meta: {
    beneficiary: { name: '', location: '', category: 'General', verified: false },
    focusArea: 'General',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    gallery: [],
    documents: [],
    timeline: [{ label: 'Created', date: new Date().toISOString() }],
    featured: false,
    trending: false,
    urgent: false,
    recommended: false,
  },
}

interface Props {
  open: boolean
  initial?: CampaignRecord | null
  onClose: () => void
  onSave: (data: Partial<CampaignRecord> & { title: string; slug: string }) => Promise<void>
}

export default function CampaignWizard({ open, initial, onClose, onSave }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<CampaignRecord>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const editing = Boolean(initial?.id)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setError('')
    setForm(initial ? { ...initial, meta: { ...initial.meta } } : { ...EMPTY, meta: { ...EMPTY.meta } })
  }, [open, initial])

  if (!open) return null

  const meta = form.meta ?? {}
  const setMeta = (patch: Partial<CampaignAdminMeta>) => setForm({ ...form, meta: { ...meta, ...patch } })

  const handleSave = async () => {
    setError('')
    if (!form.title?.trim() || !form.slug?.trim()) {
      setError('Title and slug are required')
      setStep(0)
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        id: initial?.id,
        title: form.title.trim(),
        slug: form.slug.trim(),
        meta: {
          ...meta,
          beneficiary: meta.beneficiary ?? { name: '', verified: false },
          timeline: [
            ...(meta.timeline ?? []),
            { label: editing ? 'Updated' : 'Created', date: new Date().toISOString() },
          ],
        },
      })
      onClose()
      setForm(EMPTY)
      setStep(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close wizard" />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B2C6B]">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
            <p className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-6 py-3">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                i === step ? 'bg-[#0B2C6B] text-white' : i < step ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Campaign Title *" value={form.title ?? ''} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="URL Slug *" value={form.slug ?? ''} onChange={(v) => setForm({ ...form, slug: v })} />
              <Field label="Category" value={form.category as string ?? '["General"]'} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="Focus Area" value={meta.focusArea ?? ''} onChange={(v) => setMeta({ focusArea: v })} />
              <Field label="Exemption Tag" value={form.exemption_tag ?? ''} onChange={(v) => setForm({ ...form, exemption_tag: v })} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Beneficiary Name" value={meta.beneficiary?.name ?? ''} onChange={(v) => setMeta({ beneficiary: { ...meta.beneficiary, name: v, verified: meta.beneficiary?.verified } })} />
              <Field label="Age" type="number" value={String(meta.beneficiary?.age ?? '')} onChange={(v) => setMeta({ beneficiary: { ...meta.beneficiary, name: meta.beneficiary?.name ?? '', age: Number(v), verified: meta.beneficiary?.verified } })} />
              <Field label="Location" value={meta.beneficiary?.location ?? ''} onChange={(v) => setMeta({ beneficiary: { ...meta.beneficiary, name: meta.beneficiary?.name ?? '', location: v, verified: meta.beneficiary?.verified } })} />
              <Field label="Category" value={meta.beneficiary?.category ?? ''} onChange={(v) => setMeta({ beneficiary: { ...meta.beneficiary, name: meta.beneficiary?.name ?? '', category: v, verified: meta.beneficiary?.verified } })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={meta.beneficiary?.verified ?? false} onChange={(e) => setMeta({ beneficiary: { ...meta.beneficiary, name: meta.beneficiary?.name ?? '', verified: e.target.checked } })} />
                Beneficiary verified
              </label>
            </div>
          )}

          {step === 2 && (
            <label className="block">
              <span className={adminLabelClass}>Campaign Story</span>
              <textarea className={adminInputClass} rows={8} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell the story behind this campaign…" />
            </label>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Hero / Banner Image URL" value={form.banner_image ?? ''} onChange={(v) => setForm({ ...form, banner_image: v, thumbnail_image: v })} />
              <Field label="Gallery URLs (comma-separated)" value={(meta.gallery ?? []).join(', ')} onChange={(v) => setMeta({ gallery: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
              <Field label="Video URLs (comma-separated)" value={(meta.videos ?? []).join(', ')} onChange={(v) => setMeta({ videos: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Field label="Fundraising Goal (₹)" type="number" value={String(form.goal ?? 0)} onChange={(v) => setForm({ ...form, goal: Number(v) })} />
              <Field label="Amount Raised (₹)" type="number" value={String(form.raised ?? 0)} onChange={(v) => setForm({ ...form, raised: Number(v) })} />
              <Field label="Total Donors" type="number" value={String(form.total_donors ?? 0)} onChange={(v) => setForm({ ...form, total_donors: Number(v) })} />
              <Field label="Campaign End Date" type="date" value={meta.endDate?.slice(0, 10) ?? ''} onChange={(v) => setMeta({ endDate: v ? new Date(v).toISOString() : undefined })} />
            </div>
          )}

          {step === 5 && (
            <Field label="Document URLs (comma-separated)" value={(meta.documents ?? []).join(', ')} onChange={(v) => setMeta({ documents: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
          )}

          {step === 6 && (
            <div className="space-y-4">
              <label className="block">
                <span className={adminLabelClass}>Workflow Status</span>
                <select className={adminInputClass} value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Featured" checked={meta.featured ?? false} onChange={(v) => setMeta({ featured: v })} />
                <Toggle label="Trending" checked={meta.trending ?? false} onChange={(v) => setMeta({ trending: v })} />
                <Toggle label="Urgent" checked={meta.urgent ?? false} onChange={(v) => { setMeta({ urgent: v }); setForm({ ...form, featureUrgent: v ? 1 : 0 }) }} />
                <Toggle label="Recommended" checked={meta.recommended ?? false} onChange={(v) => setMeta({ recommended: v })} />
              </div>
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
          <button type="button" className={adminBtnSecondary} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft size={16} className="mr-1" />Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className={adminBtnPrimary} onClick={() => setStep((s) => s + 1)}>
              Next<ChevronRight size={16} className="ml-1" />
            </button>
          ) : (
            <button type="button" className={adminBtnPrimary} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : editing ? 'Update Campaign' : 'Publish Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className={adminLabelClass}>{label}</span>
      <input type={type} className={adminInputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="font-medium text-slate-700">{label}</span>
    </label>
  )
}
