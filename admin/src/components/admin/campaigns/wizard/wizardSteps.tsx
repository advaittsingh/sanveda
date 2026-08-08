import type { CampaignRecord, CampaignStatus } from '../../../../lib/campaignService'
import type { CampaignAdminMeta, CampaignType, CampaignVisibility, CampaignPriority } from '../../../../types/campaignAdmin'
import { STAFF_MEMBERS } from '../../../../lib/campaignWizardValidation'
import { adminInputClass, adminLabelClass } from '../../ui/adminStyles'
import WizardFileUpload, { WizardDocumentUpload } from './WizardFileUpload'

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'sports', label: 'Sports' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'animal_welfare', label: 'Animal Welfare' },
]

const VISIBILITY: { value: CampaignVisibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'invite_only', label: 'Invite Only' },
]

const PRIORITIES: { value: CampaignPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'emergency', label: 'Emergency' },
]

const WORKFLOW_STATUSES: CampaignStatus[] = [
  'draft', 'review', 'pending', 'approved', 'published', 'paused', 'completed', 'archived', 'rejected',
]

interface StepProps {
  form: Partial<CampaignRecord>
  setForm: (f: Partial<CampaignRecord>) => void
  meta: CampaignAdminMeta
  setMeta: (patch: Partial<CampaignAdminMeta>) => void
}

export function StepBasic({ form, setForm, meta, setMeta }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Campaign Title *" value={form.title ?? ''} onChange={(v) => setForm({ ...form, title: v })} />
        <div>
          <Field label="URL Slug *" value={form.slug ?? ''} onChange={(v) => setForm({ ...form, slug: v })} />
          {form.slug ? (
            <p className="mt-1 text-xs text-slate-500">
              https://sanveda.org/campaigns/{form.slug}
            </p>
          ) : null}
        </div>
        <Field label="Category" value={String(form.category ?? '["General"]')} onChange={(v) => setForm({ ...form, category: v })} />
        <Field label="Focus Area" value={meta.focusArea ?? ''} onChange={(v) => setMeta({ focusArea: v })} />
        <Field label="Tax Benefit" value={form.exemption_tag ?? 'Tax Benefit'} onChange={(v) => setForm({ ...form, exemption_tag: v })} />
        <label className="block">
          <span className={adminLabelClass}>Campaign Owner</span>
          <select className={adminInputClass} value={meta.campaignOwner ?? 'Admin'} onChange={(e) => setMeta({ campaignOwner: e.target.value })}>
            {STAFF_MEMBERS.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <RadioGroup
        label="Campaign Type"
        value={meta.campaignType ?? ''}
        options={CAMPAIGN_TYPES}
        onChange={(v) => setMeta({ campaignType: v as CampaignType })}
      />
      <RadioGroup
        label="Campaign Visibility"
        value={meta.visibility ?? 'public'}
        options={VISIBILITY}
        onChange={(v) => setMeta({ visibility: v as CampaignVisibility })}
      />
      <RadioGroup
        label="Campaign Priority"
        value={meta.priority ?? 'medium'}
        options={PRIORITIES}
        onChange={(v) => setMeta({ priority: v as CampaignPriority })}
        priorityColors
      />
    </div>
  )
}

export function StepBeneficiary({ meta, setMeta }: Pick<StepProps, 'meta' | 'setMeta'>) {
  const b = meta.beneficiary ?? { name: '', verified: false }
  const setB = (patch: Partial<typeof b>) => setMeta({ beneficiary: { ...b, ...patch } })

  return (
    <div className="space-y-5">
      <WizardFileUpload
        label="Beneficiary Photo"
        accept="image/*"
        value={b.photo}
        onChange={(url) => setB({ photo: url as string })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Beneficiary Name *" value={b.name} onChange={(v) => setB({ name: v })} />
        <Field label="Age" type="number" value={String(b.age ?? '')} onChange={(v) => setB({ age: Number(v) })} />
        <Field label="Gender" value={b.gender ?? ''} onChange={(v) => setB({ gender: v })} />
        <Field label="Phone Number" value={b.phone ?? ''} onChange={(v) => setB({ phone: v })} />
        <Field label="Location" value={b.location ?? ''} onChange={(v) => setB({ location: v })} />
        <Field label="Category" value={b.category ?? ''} onChange={(v) => setB({ category: v })} />
        <Field label="Aadhaar / PAN" value={b.aadhaarPan ?? ''} onChange={(v) => setB({ aadhaarPan: v })} />
        <Field label="Family Income (₹/year)" type="number" value={String(b.familyIncome ?? '')} onChange={(v) => setB({ familyIncome: Number(v) })} />
      </div>
      <Field label="Medical Condition" value={b.medicalCondition ?? ''} onChange={(v) => setB({ medicalCondition: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Guardian Name" value={b.guardianName ?? ''} onChange={(v) => setB({ guardianName: v })} />
        <Field label="Guardian Phone" value={b.guardianPhone ?? ''} onChange={(v) => setB({ guardianPhone: v })} />
      </div>
      <Field label="Bank Account (for disbursement)" value={b.bankAccount ?? ''} onChange={(v) => setB({ bankAccount: v })} />
      <label className="block">
        <span className={adminLabelClass}>NGO Verification Notes</span>
        <textarea className={adminInputClass} rows={3} value={b.verificationNotes ?? ''} onChange={(e) => setB({ verificationNotes: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={b.verified ?? false} onChange={(e) => setB({ verified: e.target.checked })} />
        Beneficiary verified by NGO
      </label>
    </div>
  )
}

export function StepStory({ form, setForm, meta, setMeta }: StepProps) {
  const story = meta.story ?? {}
  const setStory = (patch: Partial<typeof story>) => setMeta({ story: { ...story, ...patch } })

  return (
    <div className="space-y-5">
      <label className="block">
        <span className={adminLabelClass}>Short Summary (150 chars)</span>
        <input
          className={adminInputClass}
          maxLength={150}
          value={story.summary ?? ''}
          onChange={(e) => setStory({ summary: e.target.value })}
          placeholder="One-line pitch for donors"
        />
        <span className="mt-1 block text-right text-xs text-slate-400">{(story.summary ?? '').length}/150</span>
      </label>
      <label className="block">
        <span className={adminLabelClass}>Full Story</span>
        <textarea className={adminInputClass} rows={5} value={story.fullStory ?? form.description ?? ''} onChange={(e) => { setStory({ fullStory: e.target.value }); setForm({ ...form, description: e.target.value }) }} />
      </label>
      <Field label="Problem Statement" value={story.problemStatement ?? ''} onChange={(v) => setStory({ problemStatement: v })} multiline />
      <Field label="How Funds Will Help" value={story.howFundsHelp ?? ''} onChange={(v) => setStory({ howFundsHelp: v })} multiline />
      <Field label="Expected Impact" value={story.expectedImpact ?? ''} onChange={(v) => setStory({ expectedImpact: v })} multiline />
      <Field label="Beneficiary Quote" value={story.beneficiaryQuote ?? ''} onChange={(v) => setStory({ beneficiaryQuote: v })} multiline />
      <Field label="CTA Message" value={story.ctaMessage ?? ''} onChange={(v) => setStory({ ctaMessage: v })} placeholder="Every Dream Matters. Every Family Deserves Support." />
    </div>
  )
}

export function StepMedia({ form, setForm, meta, setMeta }: StepProps) {
  return (
    <div className="space-y-5">
      <WizardFileUpload
        label="Hero Banner"
        accept="image/*"
        value={form.banner_image}
        onChange={(url) => setForm({ ...form, banner_image: url as string, thumbnail_image: url as string })}
      />
      <WizardFileUpload
        label="Gallery Images"
        accept="image/*"
        multiple
        value={meta.gallery ?? []}
        onChange={(urls) => setMeta({ gallery: urls as string[] })}
      />
      <WizardFileUpload
        label="Videos"
        accept="video/*"
        multiple
        value={meta.videos ?? []}
        onChange={(urls) => setMeta({ videos: urls as string[] })}
        hint="MP4, WebM supported"
      />
      <WizardFileUpload
        label="Thumbnail (optional override)"
        accept="image/*"
        value={form.thumbnail_image}
        onChange={(url) => setForm({ ...form, thumbnail_image: url as string })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <WizardFileUpload label="Before Image" accept="image/*" value={meta.beforeImage} onChange={(url) => setMeta({ beforeImage: url as string })} />
        <WizardFileUpload label="After Image" accept="image/*" value={meta.afterImage} onChange={(url) => setMeta({ afterImage: url as string })} />
      </div>
    </div>
  )
}

export function StepFinancials({ form, setForm, meta, setMeta }: StepProps) {
  const fin = meta.financials ?? { fundBreakdown: [] }
  const breakdown = fin.fundBreakdown ?? []
  const setFin = (patch: Partial<typeof fin>) => setMeta({ financials: { ...fin, ...patch } })

  const updateBreakdown = (index: number, field: 'label' | 'amount', value: string) => {
    const next = [...breakdown]
    next[index] = { ...next[index], [field]: field === 'amount' ? Number(value) : value }
    setFin({ fundBreakdown: next })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fundraising Goal (₹) *" type="number" value={String(form.goal ?? 0)} onChange={(v) => setForm({ ...form, goal: Number(v) })} />
        <Field label="Amount Raised (₹)" type="number" value={String(form.raised ?? 0)} onChange={(v) => setForm({ ...form, raised: Number(v) })} />
        <Field label="Total Donors" type="number" value={String(form.total_donors ?? 0)} onChange={(v) => setForm({ ...form, total_donors: Number(v) })} />
        <Field label="Campaign End Date" type="date" value={meta.endDate?.slice(0, 10) ?? ''} onChange={(v) => setMeta({ endDate: v ? new Date(v).toISOString() : undefined })} />
        <Field label="Monthly Target (₹)" type="number" value={String(fin.monthlyTarget ?? '')} onChange={(v) => setFin({ monthlyTarget: Number(v) })} />
        <Field label="Minimum Donation (₹)" type="number" value={String(fin.minimumDonation ?? '')} onChange={(v) => setFin({ minimumDonation: Number(v) })} />
        <Field label="Platform Fee (%)" type="number" value={String(fin.platformFee ?? '')} onChange={(v) => setFin({ platformFee: Number(v) })} />
        <Field label="NGO Fee (%)" type="number" value={String(fin.ngoFee ?? '')} onChange={(v) => setFin({ ngoFee: Number(v) })} />
      </div>
      <Field label="Tax Benefit" value={fin.taxBenefit ?? form.exemption_tag ?? ''} onChange={(v) => setFin({ taxBenefit: v })} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={fin.emergencyFlag ?? false} onChange={(e) => setFin({ emergencyFlag: e.target.checked })} />
        Emergency fundraising flag
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={adminLabelClass}>Fund Breakdown</span>
          <button
            type="button"
            className="text-xs font-semibold text-[#0E4FA8] hover:underline"
            onClick={() => setFin({ fundBreakdown: [...breakdown, { label: '', amount: 0 }] })}
          >
            + Add line item
          </button>
        </div>
        <div className="space-y-2">
          {breakdown.map((item: { label: string; amount: number }, i: number) => (
            <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-2">
              <input className={adminInputClass} placeholder="e.g. Hospital Fee" value={item.label} onChange={(e) => updateBreakdown(i, 'label', e.target.value)} />
              <input className={adminInputClass} type="number" placeholder="₹" value={item.amount || ''} onChange={(e) => updateBreakdown(i, 'amount', e.target.value)} />
              <button type="button" className="text-slate-400 hover:text-red-600" onClick={() => setFin({ fundBreakdown: breakdown.filter((_: { label: string; amount: number }, idx: number) => idx !== i) })}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StepDocuments({ meta, setMeta }: Pick<StepProps, 'meta' | 'setMeta'>) {
  return (
    <WizardDocumentUpload
      files={meta.documentFiles ?? []}
      onChange={(files) => setMeta({ documentFiles: files, documents: files.map((f) => f.name) })}
    />
  )
}

export function StepPublishing({ form, setForm, meta, setMeta }: StepProps) {
  const pub = meta.publishing ?? {}

  return (
    <div className="space-y-5">
      <label className="block">
        <span className={adminLabelClass}>Workflow Status</span>
        <select className={adminInputClass} value={form.status ?? 'draft'} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
          {WORKFLOW_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </label>

      <div>
        <span className={adminLabelClass}>Campaign Flags</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle label="Featured" checked={Boolean(meta.featured ?? form.featured)} onChange={(v) => { setMeta({ featured: v }); setForm({ ...form, featured: v ? 1 : 0 }) }} />
          <Toggle label="Trending" checked={meta.trending ?? false} onChange={(v) => setMeta({ trending: v })} />
          <Toggle label="Urgent" checked={meta.urgent ?? false} onChange={(v) => { setMeta({ urgent: v }); setForm({ ...form, featureUrgent: v ? 1 : 0 }) }} />
          <Toggle label="Recommended" checked={meta.recommended ?? false} onChange={(v) => setMeta({ recommended: v })} />
          <Toggle label="Staff Pick" checked={pub.staffPick ?? false} onChange={(v) => setMeta({ publishing: { ...pub, staffPick: v } })} />
          <Toggle label="Homepage" checked={pub.homepage ?? false} onChange={(v) => setMeta({ publishing: { ...pub, homepage: v } })} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm">
          <input type="radio" name="publishMode" checked={pub.publishNow !== false} onChange={() => setMeta({ publishing: { ...pub, publishNow: true, scheduledPublish: undefined } })} />
          Publish Now
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm">
          <input type="radio" name="publishMode" checked={pub.publishNow === false} onChange={() => setMeta({ publishing: { ...pub, publishNow: false } })} />
          Schedule Publish
        </label>
      </div>
      {pub.publishNow === false && (
        <Field label="Scheduled Publish Date" type="datetime-local" value={pub.scheduledPublish?.slice(0, 16) ?? ''} onChange={(v) => setMeta({ publishing: { ...pub, scheduledPublish: v ? new Date(v).toISOString() : undefined } })} />
      )}
      <Field label="Expiry Date" type="date" value={pub.expiryDate?.slice(0, 10) ?? ''} onChange={(v) => setMeta({ publishing: { ...pub, expiryDate: v ? new Date(v).toISOString() : undefined } })} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Approved By" value={pub.approvedBy ?? ''} onChange={(v) => setMeta({ publishing: { ...pub, approvedBy: v } })} />
        <Field label="Approval Notes" value={pub.approvalNotes ?? ''} onChange={(v) => setMeta({ publishing: { ...pub, approvalNotes: v } })} multiline />
      </div>

      {form.slug ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Public URL</p>
          <p className="break-all text-sm font-medium text-[#0E4FA8]">/campaign/{form.slug}</p>
        </div>
      ) : null}
    </div>
  )
}

export function StepCommunication({ meta, setMeta }: Pick<StepProps, 'meta' | 'setMeta'>) {
  const comm = meta.communication ?? {}
  const setComm = (patch: Partial<typeof comm>) => setMeta({ communication: { ...comm, ...patch } })

  return (
    <div className="space-y-5">
      <Field label="Campaign Updates (one per line)" value={(comm.updates ?? []).join('\n')} onChange={(v) => setComm({ updates: v.split('\n').filter(Boolean) })} multiline />
      <Field label="Donor Email Template" value={comm.donorEmailTemplate ?? ''} onChange={(v) => setComm({ donorEmailTemplate: v })} multiline />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={comm.whatsappEnabled ?? false} onChange={(e) => setComm({ whatsappEnabled: e.target.checked })} />
        Enable WhatsApp notifications to donors
      </label>
      <Field label="Progress Updates" value={comm.progressUpdates ?? ''} onChange={(v) => setComm({ progressUpdates: v })} multiline />
      <Field label="FAQs (format: Question? | Answer)" value={(comm.faqs ?? []).map((f: { question: string; answer: string }) => `${f.question} | ${f.answer}`).join('\n')} onChange={(v) => setComm({ faqs: v.split('\n').filter(Boolean).map((line) => { const [q, a] = line.split('|').map((s) => s.trim()); return { question: q ?? '', answer: a ?? '' } }) })} multiline />
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean; placeholder?: string
}) {
  return (
    <label className="block">
      <span className={adminLabelClass}>{label}</span>
      {multiline ? (
        <textarea className={adminInputClass} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input type={type} className={adminInputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  )
}

function RadioGroup<T extends string>({ label, value, options, onChange, priorityColors }: {
  label: string; value: string; options: { value: T; label: string }[]; onChange: (v: T) => void; priorityColors?: boolean
}) {
  const priorityCls: Record<string, string> = {
    low: 'border-slate-200',
    medium: 'border-amber-200 bg-amber-50/50',
    high: 'border-orange-200 bg-orange-50/50',
    emergency: 'border-red-200 bg-red-50/50',
  }

  return (
    <fieldset>
      <legend className={adminLabelClass}>{label}</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-[#F8FAFC] ${
              priorityColors && value === opt.value ? priorityCls[opt.value] ?? 'border-[#0E4FA8] bg-[#0E4FA8]/5' : 'border-[#E5E7EB]'
            } ${!priorityColors && value === opt.value ? 'border-[#0E4FA8] bg-[#0E4FA8]/5' : ''}`}
          >
            <input type="radio" name={label} checked={value === opt.value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="font-medium text-slate-700">{label}</span>
    </label>
  )
}
