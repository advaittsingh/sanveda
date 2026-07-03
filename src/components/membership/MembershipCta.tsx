import { Link } from 'react-router-dom'

interface Props {
  className?: string
  centered?: boolean
}

export default function MembershipCta({ className = '', centered = true }: Props) {
  return (
    <div className={`membership-cta ${className}`.trim()} data-centered={centered}>
      <Link to="/membership/apply" className="membership-btn membership-btn-primary">
        Apply for Membership
      </Link>
      <Link to="/membership/status" className="membership-btn membership-btn-secondary">
        Check Status
      </Link>
    </div>
  )
}
