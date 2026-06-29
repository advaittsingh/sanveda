import { Link } from 'react-router-dom'
import { C } from '../constants/brand'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: C.grayBg }}>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: 72, color: C.gold, margin: '0 0 8px' }}>404</h1>
        <h2 style={{ fontWeight: 800, fontSize: 24, color: C.primary, margin: '0 0 12px' }}>Page Not Found</h2>
        <p style={{ color: C.textMuted, marginBottom: 24 }}>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
