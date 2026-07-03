import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { C } from '../constants/brand'
import { INTERNSHIP_DOMAINS } from '../constants/internshipContent'
import { submitInternshipApplication } from '../lib/internshipService'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function InternshipApplyPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const departmentParam = searchParams.get('department')
  const matchedDomain = INTERNSHIP_DOMAINS.find((d) => d.id === departmentParam)
  const initialDepartment = matchedDomain?.title ?? ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', university: '', course: '', semester: '',
    preferredDepartment: initialDepartment, durationWeeks: 8, motivation: '', skills: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const app = await submitInternshipApplication(form)
      navigate(`/internship/status?id=${app.applicationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>{label} *</span>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} required style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }} />
    </label>
  )

  return (
    <div style={{ background: C.white, paddingBottom: 40 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Internships', path: '/internship' }, { label: 'Apply', path: null }]} />
      <div style={{ width: '94.44%', maxWidth: 640, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.primary, marginBottom: 24 }}>Internship Application</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {field('Full Name', 'fullName')}
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
          {field('University / Institution', 'university')}
          {field('Course', 'course')}
          {field('Semester / Year', 'semester')}
          {field('Preferred Department', 'preferredDepartment')}
          {field('Duration (weeks)', 'durationWeeks', 'number')}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>Motivation *</span>
            <textarea required rows={4} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>Skills</span>
            <textarea rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }} />
          </label>
          {error && <p style={{ color: '#c0392b' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 14, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
