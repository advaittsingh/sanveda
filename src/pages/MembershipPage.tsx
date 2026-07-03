import { Link } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'

const TIERS = [
  { name: 'Standard Member', price: 'Free', benefits: ['Newsletter updates', 'Event invitations', 'Volunteer priority'] },
  { name: 'Patron Member', price: '₹5,000/yr', benefits: ['All Standard benefits', 'Annual impact report', 'Recognition on website'] },
  { name: 'Founding Member', price: '₹25,000/yr', benefits: ['All Patron benefits', 'Founding member certificate', 'Advisory roundtables'] },
]

export default function MembershipPage() {
  const mobile = useMediaQuery('(max-width: 600px)')

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Membership', path: null }]} />

      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner
          title="Become a Sanveda Member"
          subtitle="Join a community committed to humanitarian impact across healthcare, education, sports, and community upliftment."
        />
      </div>

      <section style={{ width: '94.44%', maxWidth: 1100, margin: '0 auto', padding: mobile ? '24px 16px' : '40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          {TIERS.map((tier) => (
            <div key={tier.name} style={{ border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 8px', color: C.primary, fontWeight: 800 }}>{tier.name}</h3>
              <p style={{ color: C.secondary, fontWeight: 700, margin: '0 0 16px' }}>{tier.price}</p>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.textMuted, lineHeight: 1.7 }}>
                {tier.benefits.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
          <Link to="/membership/apply" className="btn-primary" style={{ padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            Apply for Membership
          </Link>
          <Link to="/membership/status" className="btn-secondary" style={{ padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            Check Application Status
          </Link>
        </div>
      </section>
    </div>
  )
}
