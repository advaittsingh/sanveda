import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  FORM_STEPS,
  VOLUNTEER_ROLE_OPTIONS,
  VOLUNTEER_TYPE_OPTIONS,
} from '../../constants/volunteerContent'
import { submitVolunteerApplication } from '../../lib/volunteerStore'
import { validateStep } from '../../lib/volunteerValidation'
import type { VolunteerFormData, VolunteerRole } from '../../types/volunteer'
import { EMPTY_VOLUNTEER_FORM } from '../../types/volunteer'
import VolunteerFileUpload from './VolunteerFileUpload'
import VolunteerFormStepper from './VolunteerFormStepper'

function Field({
  label,
  required,
  error,
  className = '',
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  className?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className={`volunteer-field ${className}`.trim()}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      {hint ? <small className="volunteer-field-hint">{hint}</small> : null}
      {children}
      {error ? <em>{error}</em> : null}
    </label>
  )
}

export default function VolunteerApplicationForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') as VolunteerRole | null

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<VolunteerFormData>(() => ({
    ...EMPTY_VOLUNTEER_FORM,
    preferredRoles: initialRole && VOLUNTEER_ROLE_OPTIONS.some((r) => r.value === initialRole)
      ? [initialRole]
      : [],
  }))

  const update = <K extends keyof VolunteerFormData>(key: K, value: VolunteerFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const toggleRole = (role: VolunteerRole) => {
    setForm((prev) => ({
      ...prev,
      preferredRoles: prev.preferredRoles.includes(role)
        ? prev.preferredRoles.filter((r) => r !== role)
        : [...prev.preferredRoles, role],
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.preferredRoles
      return next
    })
  }

  const goNext = () => {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return
    }
    setStep((s) => Math.min(s + 1, FORM_STEPS.length - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return
    }

    setSubmitting(true)
    try {
      const application = await submitVolunteerApplication(form)
      navigate(`/volunteer/thank-you?id=${application.id}`)
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Could not submit application. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="volunteer-form-card">
      <VolunteerFormStepper step={step} />

      <div className="volunteer-form-body">
        {step === 0 && (
          <div className="volunteer-form-grid">
            <Field label="Full Name" required error={errors.fullName}>
              <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </Field>
            <Field label="Email" required error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="Address" required error={errors.address} className="volunteer-field-full">
              <textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
            </Field>
            <Field label="City" required error={errors.city}>
              <input value={form.city} onChange={(e) => update('city', e.target.value)} />
            </Field>
            <Field label="State" required error={errors.state}>
              <input value={form.state} onChange={(e) => update('state', e.target.value)} />
            </Field>
            <Field label="Country" required error={errors.country}>
              <input value={form.country} onChange={(e) => update('country', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="volunteer-form-grid">
            <Field label="Occupation">
              <input value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
            </Field>
            <Field label="Organization">
              <input value={form.organization} onChange={(e) => update('organization', e.target.value)} />
            </Field>
            <Field label="LinkedIn Profile">
              <input value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
            </Field>
            <Field label="Education" className="volunteer-field-full">
              <input value={form.education} onChange={(e) => update('education', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="volunteer-form-stack">
            <div className="volunteer-form-section">
              <div className="volunteer-form-section-head">
                <h3>Preferred Volunteer Roles</h3>
                <p>Select one or more areas where you&apos;d like to contribute.</p>
              </div>
              {errors.preferredRoles ? <em className="volunteer-section-error">{errors.preferredRoles}</em> : null}
              <div className="volunteer-role-grid">
                {VOLUNTEER_ROLE_OPTIONS.map((role) => {
                  const selected = form.preferredRoles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      className="volunteer-role-card"
                      data-selected={selected}
                      onClick={() => toggleRole(role.value)}
                    >
                      <span className="volunteer-role-emoji">{role.emoji}</span>
                      <span className="volunteer-role-label">{role.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="volunteer-form-section">
              <div className="volunteer-form-section-head">
                <h3>Volunteer Type</h3>
                <p>How would you like to participate with Sanveda?</p>
              </div>
              {errors.volunteerType ? <em className="volunteer-section-error">{errors.volunteerType}</em> : null}
              <div className="volunteer-type-grid">
                {VOLUNTEER_TYPE_OPTIONS.map((type) => {
                  const selected = form.volunteerType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      className="volunteer-type-card"
                      data-selected={selected}
                      onClick={() => update('volunteerType', type.value)}
                    >
                      <span className="volunteer-type-label">{type.label}</span>
                      <span className="volunteer-type-hint">{type.hint}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Field label="Hours Per Week" hint="Approximate time you can dedicate each week.">
              <input
                type="number"
                min={0}
                max={168}
                value={form.hoursPerWeek}
                onChange={(e) => update('hoursPerWeek', e.target.value)}
                placeholder="e.g. 10"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="volunteer-form-grid">
            <Field label="Skills">
              <textarea rows={3} value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="e.g. teaching, first aid, graphic design" />
            </Field>
            <Field label="Experience">
              <textarea rows={3} value={form.experience} onChange={(e) => update('experience', e.target.value)} />
            </Field>
            <Field label="Languages Known">
              <input value={form.languages} onChange={(e) => update('languages', e.target.value)} placeholder="e.g. English, Hindi, Marathi" />
            </Field>
            <Field label="Certifications">
              <input value={form.certifications} onChange={(e) => update('certifications', e.target.value)} />
            </Field>
            <Field label="Why do you want to volunteer with Sanveda?" required error={errors.motivation} className="volunteer-field-full">
              <textarea rows={4} value={form.motivation} onChange={(e) => update('motivation', e.target.value)} />
            </Field>
            <Field label="Tell us about yourself" required error={errors.aboutYourself} className="volunteer-field-full">
              <textarea rows={4} value={form.aboutYourself} onChange={(e) => update('aboutYourself', e.target.value)} />
            </Field>
            <Field label="Previous volunteering experience" className="volunteer-field-full">
              <textarea rows={3} value={form.previousExperience} onChange={(e) => update('previousExperience', e.target.value)} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="volunteer-form-stack">
            <div className="volunteer-form-section">
              <div className="volunteer-form-section-head">
                <h3>Upload Documents</h3>
                <p>PDF or image files. All uploads are optional but help us process your application faster.</p>
              </div>
              <div className="volunteer-upload-grid">
                <VolunteerFileUpload
                  label="Resume"
                  accept=".pdf,.doc,.docx"
                  hint="PDF, DOC, or DOCX"
                  file={form.resumeFile}
                  onChange={(file) => update('resumeFile', file)}
                />
                <VolunteerFileUpload
                  label="ID Proof"
                  accept="image/*,.pdf"
                  hint="Aadhaar, passport, or driving licence"
                  file={form.idProofFile}
                  onChange={(file) => update('idProofFile', file)}
                />
                <VolunteerFileUpload
                  label="Photograph"
                  accept="image/*"
                  hint="Recent passport-size photo"
                  file={form.photoFile}
                  onChange={(file) => update('photoFile', file)}
                />
              </div>
            </div>

            <div className="volunteer-consent-panel">
              <h3>Consent &amp; Agreements</h3>
              <p>Please review and accept the following before submitting your application.</p>

              <label className="volunteer-consent">
                <input type="checkbox" checked={form.agreedPolicies} onChange={(e) => update('agreedPolicies', e.target.checked)} />
                <span>I agree to Sanveda volunteer policies and code of conduct</span>
              </label>
              {errors.agreedPolicies ? <em className="volunteer-consent-error">{errors.agreedPolicies}</em> : null}

              <label className="volunteer-consent">
                <input type="checkbox" checked={form.agreedBackgroundCheck} onChange={(e) => update('agreedBackgroundCheck', e.target.checked)} />
                <span>I agree to background verification if required for my role</span>
              </label>
              {errors.agreedBackgroundCheck ? <em className="volunteer-consent-error">{errors.agreedBackgroundCheck}</em> : null}

              <label className="volunteer-consent">
                <input type="checkbox" checked={form.agreedDataProcessing} onChange={(e) => update('agreedDataProcessing', e.target.checked)} />
                <span>I consent to the processing of my personal data for volunteer recruitment</span>
              </label>
              {errors.agreedDataProcessing ? <em className="volunteer-consent-error">{errors.agreedDataProcessing}</em> : null}
            </div>
          </div>
        )}
      </div>

      {errors.submit ? <p className="volunteer-form-error">{errors.submit}</p> : null}

      <div className="volunteer-form-actions">
        <button type="button" className="volunteer-btn volunteer-btn-secondary" onClick={goBack} disabled={step === 0 || submitting}>
          <ChevronLeft size={18} />
          Back
        </button>
        {step < FORM_STEPS.length - 1 ? (
          <button type="button" className="volunteer-btn volunteer-btn-primary" onClick={goNext}>
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" className="volunteer-btn volunteer-btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 size={18} className="volunteer-spin" /> : null}
            Submit Application
          </button>
        )}
      </div>
    </div>
  )
}
