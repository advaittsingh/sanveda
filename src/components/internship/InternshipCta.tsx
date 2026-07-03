import { Link } from 'react-router-dom'

interface Props {
  className?: string
  centered?: boolean
}

export default function InternshipCta({ className = '', centered = true }: Props) {
  return (
    <div className={`internship-cta ${className}`.trim()} data-centered={centered}>
      <Link to="/internship/apply" className="internship-btn internship-btn-primary">
        Apply for Internship
      </Link>
      <Link to="/internship/status" className="internship-btn internship-btn-secondary">
        Check Status
      </Link>
    </div>
  )
}
