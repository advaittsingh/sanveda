import { adminInputClass, adminLabelClass } from '../ui/adminStyles'
import {
  TESTIMONIAL_CATEGORIES,
  type TestimonialCategory,
  type TestimonialFilters,
  type TestimonialStatus,
} from '../../../lib/testimonialOperationsService'

interface Props {
  filters: TestimonialFilters
  onChange: (patch: Partial<TestimonialFilters>) => void
}

const STATUSES: TestimonialStatus[] = ['submitted', 'review', 'approved', 'published', 'featured', 'archived']

export default function TestimonialFiltersPanel({ filters, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className={adminLabelClass}>Category</label>
        <select className={adminInputClass} value={filters.category} onChange={(e) => onChange({ category: e.target.value as TestimonialCategory | 'all' })}>
          <option value="all">All Categories</option>
          {TESTIMONIAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Status</label>
        <select className={adminInputClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as TestimonialStatus | 'all' })}>
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Featured</label>
        <select className={adminInputClass} value={filters.featured} onChange={(e) => onChange({ featured: e.target.value as TestimonialFilters['featured'] })}>
          <option value="all">All</option>
          <option value="yes">Featured Only</option>
          <option value="no">Not Featured</option>
        </select>
      </div>
    </div>
  )
}
