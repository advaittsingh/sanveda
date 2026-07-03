import { useCallback, useEffect, useMemo, useState } from 'react'
import { X, ChevronLeft, ChevronRight, ExternalLink, Monitor, Smartphone } from 'lucide-react'
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

export default function CampaignWizard({ open, initial, onClose, onSave }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<CampaignRecord>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | null>(null)

  const editing = Boolean(initial?.id)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setError('')
    setPreviewMode(null)
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
      <div className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#0B2C6B]">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
            <p className="text-sm text-slate-500">Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Campaign Completion</p>
              <p className="text-2xl font-bold text-[#0B2C6B]">{completion}%</p>
              <ul className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                {WIZARD_STEPS.slice(0, 6).map((label, i) => (
                  <li key={label}>
                    {stepIndicator(validations[i])} {label.split(' ')[0]}
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
          </div>
        </div>

        {/* Step nav with validation */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-4 py-3 sm:px-6">
          {WIZARD_STEPS.map((label, i) => {
            const v = validations[i]
            const active = i === step
            const done = v.status === 'complete'
            const warn = v.status === 'warning'
            const invalid = v.status === 'invalid'
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                title={v.message}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold sm:px-3 ${
                  active ? 'bg-[#0B2C6B] text-white'
                    : done ? 'bg-emerald-50 text-emerald-700'
                      : warn ? 'bg-amber-50 text-amber-700'
                        : invalid ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span>{stepIndicator(v)}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === 0 && <StepBasic {...stepProps} />}
          {step === 1 && <StepBeneficiary meta={meta} setMeta={setMeta} />}
          {step === 2 && <StepStory {...stepProps} />}
          {step === 3 && <StepMedia {...stepProps} />}
          {step === 4 && <StepFinancials {...stepProps} />}
          {step === 5 && <StepDocuments meta={meta} setMeta={setMeta} />}
          {step === 6 && <StepPublishing {...stepProps} />}
          {step === 7 && <StepCommunication meta={meta} setMeta={setMeta} />}

          {step === 6 && form.slug && (
            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <p className="mb-3 text-sm font-semibold text-[#0B2C6B]">Preview before publishing</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminBtnSecondary} onClick={() => setPreviewMode('desktop')}>
                  <Monitor size={14} className="mr-1" />Desktop Preview
                </button>
                <button type="button" className={adminBtnSecondary} onClick={() => setPreviewMode('mobile')}>
                  <Smartphone size={14} className="mr-1" />Mobile Preview
                </button>
                <button type="button" className={adminBtnSecondary} onClick={handlePreview}>
                  <ExternalLink size={14} className="mr-1" />Open Public URL
                </button>
              </div>
              {previewMode && (
                <div className={`mt-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white ${previewMode === 'mobile' ? 'mx-auto max-w-[375px]' : ''}`}>
                  <iframe title="Campaign preview" src={`/campaign/${form.slug}`} className="h-64 w-full" />
                </div>
              )}
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span>Auto-saved · Last saved {formatLastSaved(lastSavedAt)}</span>
            {validations[step].message && validations[step].status !== 'complete' ? (
              <span className={validations[step].status === 'invalid' ? 'text-red-600' : 'text-amber-600'}>
                {stepIndicator(validations[step])} {validations[step].message}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" className={adminBtnSecondary} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={16} className="mr-1" />Back
            </button>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnSecondary} disabled={saving} onClick={() => handleSave(true)}>
                Save Draft
              </button>
              <button type="button" className={adminBtnSecondary} onClick={handlePreview}>
                <ExternalLink size={14} className="mr-1" />Preview
              </button>
              {step < WIZARD_STEPS.length - 1 ? (
                <button type="button" className={adminBtnPrimary} onClick={() => setStep((s) => s + 1)}>
                  Next<ChevronRight size={16} className="ml-1" />
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
