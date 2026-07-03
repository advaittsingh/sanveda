import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/campaigns', label: 'Campaigns' },
  { to: '/admin/blogs', label: 'Blogs' },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/memberships', label: 'Memberships' },
  { to: '/admin/volunteers', label: 'Volunteers' },
  { to: '/admin/internships', label: 'Internships' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/beneficiaries', label: 'Beneficiaries' },
  { to: '/admin/finance', label: 'Finance' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/audit', label: 'Audit' },
]

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AdminShell({ title, subtitle, children }: Props) {
  const { pathname } = useLocation()
  const { signOut } = useAdminAuth()

  return (
    <div className="volunteer-admin">
      <header className="volunteer-admin-header">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <button type="button" className="volunteer-btn volunteer-btn-secondary" onClick={signOut}>
          Sign Out
        </button>
      </header>

      <nav className="admin-nav">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="admin-nav-link"
            data-active={pathname === link.to || (link.to !== '/admin' && pathname.startsWith(link.to))}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
