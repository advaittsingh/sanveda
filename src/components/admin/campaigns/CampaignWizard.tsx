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
      <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: title + step + autosave */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3 lg:block">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2C6B]">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}
                  </p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden">
                  <X size={20} />
                </button>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Last saved {formatLastSaved(lastSavedAt)} · Auto-saved
              </p>
            </div>

            {/* Center: completion bar */}
            <div className="w-full lg:max-w-xs lg:pt-1">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <span>Campaign Completion</span>
                <span className="text-[#0B2C6B]">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B2C6B] to-[#0E4FA8] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-slate-400">{completedSteps} of {WIZARD_STEPS.length} steps</p>
            </div>

            {/* Right: meta pills + preview + close */}
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <MetaPill icon={User} label="Workflow Status" value={capitalize(form.status ?? 'draft')} />
              <MetaPill icon={Shield} label="Priority" value={capitalize(meta.priority ?? 'medium')} />
              <MetaPill icon={Calendar} label="End Date" value={formatEndDate(meta.endDate)} />
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0E4FA8] px-4 py-2 text-sm font-semibold text-[#0E4FA8] transition hover:bg-[#0E4FA8]/5"
              >
                <Eye size={16} />
                Preview Campaign
              </button>
              <button type="button" onClick={onClose} className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:block">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Step nav */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3 sm:px-6">
          {WIZARD_STEPS.map((label, i) => {
            const active = i === step
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                title={validations[i].message}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? 'bg-[#0B2C6B] text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-[#E5E7EB] hover:bg-slate-50'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {validations[i].status === 'complete' && !active ? '✓' : i + 1}
                </span>
                <span className="whitespace-nowrap">{label}</span>
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

function MetaPill({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2">
      <Icon size={16} className="shrink-0 text-[#0E4FA8]" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[#0B2C6B]">{value}</p>
        <p className="text-[10px] text-slate-400">{label}</p>
      </div>
    </div>
  )
}
