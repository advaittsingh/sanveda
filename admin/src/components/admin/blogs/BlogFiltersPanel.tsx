import { adminInputClass, adminLabelClass } from '../ui/adminStyles'
import {
  BLOG_CATEGORIES,
  CONTENT_TYPE_LABELS,
  type BlogFilters,
  type ContentType,
  type ArticleWorkflowStatus,
} from '../../../lib/blogOperationsService'
import type { BlogAuthor } from '../../../lib/blogOperationsService'

interface Props {
  filters: BlogFilters
  authors: BlogAuthor[]
  onChange: (patch: Partial<BlogFilters>) => void
}

const WORKFLOW_STATUSES: ArticleWorkflowStatus[] = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived']

export default function BlogFiltersPanel({ filters, authors, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className={adminLabelClass}>Category</label>
        <select className={adminInputClass} value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
          <option value="all">All Categories</option>
          {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Content Type</label>
        <select className={adminInputClass} value={filters.contentType} onChange={(e) => onChange({ contentType: e.target.value as ContentType | 'all' })}>
          <option value="all">All Types</option>
          {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
            <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Status</label>
        <select className={adminInputClass} value={filters.workflowStatus} onChange={(e) => onChange({ workflowStatus: e.target.value as ArticleWorkflowStatus | 'all' })}>
          <option value="all">All Statuses</option>
          {WORKFLOW_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className={adminLabelClass}>Author</label>
        <select className={adminInputClass} value={filters.authorId} onChange={(e) => onChange({ authorId: e.target.value })}>
          <option value="all">All Authors</option>
          {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
    </div>
  )
}
