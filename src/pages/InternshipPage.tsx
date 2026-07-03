import { Link } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function InternshipPage() {
  const mobile = useMediaQuery('(max-width: 600px)')

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Internships', path: null }]} />
      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner title="Internship Programme" subtitle="Gain hands-on experience in humanitarian operations, programme management, and community development." />
      </div>
      <section style={{ width: '94.44%', maxWidth: 800, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0', textAlign: 'center' }}>
        <p style={{ color: C.textMuted, lineHeight: 1.7, marginBottom: 32 }}>
          Sanveda offers structured internships for students and young professionals passionate about social impact.
          Interns work alongside our teams in healthcare, education, sports, and operations.
        </p>
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
          <Link to="/internship/apply" className="btn-primary" style={{ padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Apply Now</Link>
          <Link to="/internship/status" className="btn-secondary" style={{ padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Check Status</Link>
        </div>
      </section>
    </div>
  )
}
