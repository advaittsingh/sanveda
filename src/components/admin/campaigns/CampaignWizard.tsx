import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  X,
  ChevronRight,
  Eye,
  Save,
  User,
  Shield,
  Calendar,
} from 'lucide-react'
import type { CampaignRecord } from '../../../lib/campaignService'
import type { CampaignAdminMeta } from '../../../types/campaignAdmin'
import {
  WIZARD_STEPS,
  validateWizardStep,
  wizardCompletionPercent,
  stepIndicator,
  saveWizardDraft,
  clearWizardDraft,
} from '../../../lib/campaignWizardValidation'
import {
  StepBasic,
  StepBeneficiary,
  StepStory,
  StepMedia,
  StepFinancials,
  StepDocuments,
  StepPublishing,
  StepCommunication,
} from './wizard/wizardSteps'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

const EMPTY: Partial<CampaignRecord> = {
  title: '',
  slug: '',
  goal: 5000000,
  raised: 0,
  description: '',
  exemption_tag: 'Tax Benefit',
  status: 'draft',
  banner_image: '',
  thumbnail_image: '',
  category: '["General"]',
  featureUrgent: 0,
  featureRecent: 0,
  featured: 0,
  meta: {
    beneficiary: { name: '', location: '', category: 'General', verified: false },
    story: { ctaMessage: 'Every Dream Matters. Every Family Deserves Support.' },
    focusArea: 'General',
    createdBy: 'Admin',
    campaignOwner: 'Admin',
    visibility: 'public',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    gallery: [],
    videos: [],
    documents: [],
    documentFiles: [],
    financials: { fundBreakdown: [{ label: 'Hospital Fee', amount: 200000 }, { label: 'Medicines', amount: 100000 }] },
    publishing: { publishNow: true },
    communication: { whatsappEnabled: true },
    timeline: [{ label: 'Created', date: new Date().toISOString() }],
    featured: false,
    trending: false,
    urgent: false,
    recommended: false,
  },
}

const STEP_SHORT_LABELS = [
  'Basic',
  'Beneficiary',
  'Story',
  'Media',
  'Financials',
  'Documents',
  'Publishing',
  'Updates',
]

interface Props {
  open: boolean
  initial?: CampaignRecord | null
  onClose: () => void
  onSave: (data: Partial<CampaignRecord> & { title: string; slug: string }) => Promise<void>
}

function formatLastSaved(iso?: string) {
  if (!iso) return 'Not saved yet'
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 5) return 'just now'
  if (sec < 60) return `${sec} sec ago`
  return `${Math.round(sec / 60)} min ago`
}

function formatEndDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

export default function CampaignWizard({ open, initial, onClose, onSave }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<CampaignRecord>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()

  const editing = Boolean(initial?.id)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setError('')
    const base = initial
      ? { ...initial, meta: { ...EMPTY.meta, ...initial.meta } }
      : { ...EMPTY, meta: { ...EMPTY.meta } }
    setForm(base)
    setLastSavedAt(base.meta?.lastSavedAt)
  }, [open, initial])

  const meta = form.meta ?? {}
  const setMeta = useCallback((patch: Partial<CampaignAdminMeta>) => {
    setForm((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } }))
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      saveWizardDraft(form)
      setLastSavedAt(new Date().toISOString())
    }, 3000)
    return () => clearTimeout(timer)
  }, [form, open])

  const validations = useMemo(() => WIZARD_STEPS.map((_, i) => validateWizardStep(i, form)), [form])
  const completion = wizardCompletionPercent(form)
  const completedSteps = validations.filter((v) => v.status === 'complete').length

  const handleSave = async (asDraft = false) => {
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
        status: asDraft ? 'draft' : (form.status ?? 'review'),
        meta: {
          ...meta,
          beneficiary: meta.beneficiary ?? { name: '', verified: false },
          lastSavedAt: new Date().toISOString(),
          timeline: [
            ...(meta.timeline ?? []),
            { label: asDraft ? 'Draft saved' : editing ? 'Updated' : 'Submitted', date: new Date().toISOString() },
          ],
        },
      })
      clearWizardDraft()
      if (!asDraft) {
        onClose()
        setForm(EMPTY)
        setStep(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (!form.slug?.trim()) {
      setError('Add a slug in Basic Details to preview')
      setStep(0)
      return
    }
    window.open(`/campaign/${form.slug.trim()}`, '_blank')
  }

  if (!open) return null

  const stepProps = { form, setForm, meta, setMeta }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close wizard" />
      <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header — tier 1: progress + actions */}
        <div className="border-b border-[#E5E7EB] px-5 pt-4 sm:px-6">
          <div className="mb-3 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Campaign Completion</span>
                <span className="text-xs font-bold text-[#0B2C6B]">{completion}% · {completedSteps}/{WIZARD_STEPS.length} steps</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B2C6B] to-[#0E4FA8] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handlePreview}
                className="hidden items-center gap-1.5 rounded-lg border border-[#0E4FA8] px-3 py-1.5 text-xs font-semibold text-[#0E4FA8] transition hover:bg-[#0E4FA8]/5 sm:inline-flex"
              >
                <Eye size={14} />
                Preview
              </button>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* tier 2: title + meta */}
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#0B2C6B] sm:text-xl">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Last saved {formatLastSaved(lastSavedAt)} · Auto-saved
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip icon={User} label="Status" value={capitalize(form.status ?? 'draft')} />
              <MetaChip icon={Shield} label="Priority" value={capitalize(meta.priority ?? 'medium')} />
              <MetaChip icon={Calendar} label="Ends" value={formatEndDate(meta.endDate)} />
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0E4FA8] px-3 py-1.5 text-xs font-semibold text-[#0E4FA8] sm:hidden"
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Step nav — grid on wide screens so nothing clips */}
        <div className="grid grid-cols-4 gap-1.5 border-b border-[#E5E7EB] bg-[#FAFBFC] p-2 sm:grid-cols-8 sm:gap-2 sm:px-4 sm:py-2.5">
          {WIZARD_STEPS.map((label, i) => {
            const active = i === step
            const done = validations[i].status === 'complete'
            const warn = validations[i].status === 'warning'
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                title={`${label}${validations[i].message ? ` — ${validations[i].message}` : ''}`}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition sm:px-2 sm:text-xs ${
                  active
                    ? 'bg-[#0B2C6B] text-white shadow-sm'
                    : done
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : warn
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        : 'bg-white text-slate-600 ring-1 ring-[#E5E7EB] hover:bg-slate-50'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold sm:h-5 sm:w-5 sm:text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {done && !active ? '✓' : i + 1}
                </span>
                <span className="truncate">
                  <span className="hidden lg:inline">{label}</span>
                  <span className="lg:hidden">{STEP_SHORT_LABELS[i]}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <h3 className="mb-5 text-base font-semibold text-[#0B2C6B]">
            {step === 0 ? 'Campaign Information' : WIZARD_STEPS[step]}
          </h3>
          {step === 0 && <StepBasic {...stepProps} />}
          {step === 1 && <StepBeneficiary meta={meta} setMeta={setMeta} />}
          {step === 2 && <StepStory {...stepProps} />}
          {step === 3 && <StepMedia {...stepProps} />}
          {step === 4 && <StepFinancials {...stepProps} />}
          {step === 5 && <StepDocuments meta={meta} setMeta={setMeta} />}
          {step === 6 && <StepPublishing {...stepProps} />}
          {step === 7 && <StepCommunication meta={meta} setMeta={setMeta} />}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-4 sm:px-6">
          {validations[step].message && validations[step].status !== 'complete' ? (
            <p className={`mb-3 text-center text-xs sm:text-left ${validations[step].status === 'invalid' ? 'text-red-600' : 'text-amber-600'}`}>
              {stepIndicator(validations[step])} {validations[step].message}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>
              Cancel
            </button>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} disabled={saving} onClick={() => handleSave(true)}>
                <Save size={14} className="mr-1.5" />
                Save Draft
              </button>
              <button type="button" className={adminBtnSecondary} onClick={handlePreview}>
                <Eye size={14} className="mr-1.5" />
                Preview
              </button>
              {step < WIZARD_STEPS.length - 1 ? (
                <button type="button" className={adminBtnPrimary} onClick={() => setStep((s) => s + 1)}>
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button type="button" className={adminBtnPrimary} disabled={saving} onClick={() => handleSave(false)}>
                  {saving ? 'Saving…' : editing ? 'Update Campaign' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaChip({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5">
      <Icon size={13} className="shrink-0 text-[#0E4FA8]" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] font-semibold text-[#0B2C6B]">{value}</p>
        <p className="text-[9px] uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  )
}
