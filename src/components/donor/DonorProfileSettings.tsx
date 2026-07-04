import { useState, type ReactNode } from 'react'
import { C } from '../../constants/brand'
import type { DonorPreferences } from '../../lib/donorPortalService'
import { updateDonorProfile } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle, donorInput, donorLabel, donorBtnPrimary } from './donorStyles'

interface Props {
  userId: string
  name: string
  phone: string
  preferences: DonorPreferences
  onSaved: () => void
}

export default function DonorProfileSettings({ userId, name, phone, preferences, onSaved }: Props) {
  const [fullName, setFullName] = useState(name)
  const [phoneVal, setPhoneVal] = useState(phone)
  const [prefs, setPrefs] = useState(preferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateDonorProfile(userId, {
        fullName,
        phone: phoneVal,
        preferences: prefs,
      })
      setMessage('Profile saved successfully.')
      onSaved()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Profile Settings</h2>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Full Name">
            <input style={donorInput} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input style={donorInput} value={phoneVal} onChange={(e) => setPhoneVal(e.target.value)} />
          </Field>
          <Field label="Address">
            <input style={donorInput} value={prefs.address} onChange={(e) => setPrefs({ ...prefs, address: e.target.value })} />
          </Field>
          <Field label="PAN (for 80G receipts)">
            <input style={donorInput} value={prefs.pan} onChange={(e) => setPrefs({ ...prefs, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
          </Field>
          <Field label="Aadhaar (optional)">
            <input style={donorInput} value={prefs.aadhaar} onChange={(e) => setPrefs({ ...prefs, aadhaar: e.target.value })} />
          </Field>
        </div>

        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 12 }}>Tax Preferences</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs.taxOptIn80G} onChange={(e) => setPrefs({ ...prefs, taxOptIn80G: e.target.checked })} />
            Send me 80G tax exemption receipts automatically
          </label>
        </div>

        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 12 }}>Communication Preferences</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <Check label="Email updates" checked={prefs.emailUpdates} onChange={(v) => setPrefs({ ...prefs, emailUpdates: v })} />
            <Check label="SMS alerts" checked={prefs.smsUpdates} onChange={(v) => setPrefs({ ...prefs, smsUpdates: v })} />
            <Check label="WhatsApp updates" checked={prefs.whatsappUpdates} onChange={(v) => setPrefs({ ...prefs, whatsappUpdates: v })} />
          </div>
        </div>

        {message ? <p style={{ fontSize: 14, color: message.includes('success') ? '#15803d' : '#dc2626' }}>{message}</p> : null}

        <button type="submit" disabled={saving} style={{ ...donorBtnPrimary, opacity: saving ? 0.7 : 1, width: 'fit-content' }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <div style={donorLabel}>{label}</div>
      {children}
    </label>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
