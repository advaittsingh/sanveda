import { ArrowDown, GripVertical, Star } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnSecondary } from '../ui/adminStyles'
import {
  FORM_FIELD_TYPES,
  WORKFLOW_STEPS,
  type AnnouncementBar,
  type CmsDashboardData,
  type CmsForm,
  type CmsTestimonial,
  type FocusAreaCms,
  type HeroBanner,
  type HomepageSection,
  type NavLink,
  type SectionBlock,
  type UrlRedirect,
  type WebsitePage,
} from '../../../lib/cmsOperationsService'

export function CmsHomepageBuilder({
  sections,
  onReorder,
  onToggle,
}: {
  sections: HomepageSection[]
  onReorder: (from: number, to: number) => void
  onToggle: (id: string, enabled: boolean) => void
}) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Homepage Builder</h3>
      <p className="mt-1 text-sm text-slate-500">Drag to reorder sections — changes reflect on the public homepage</p>
      <div className="mt-4 space-y-2">
        {sections.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <GripVertical size={16} className="cursor-grab text-slate-400" />
            <span className="flex-1 text-sm font-medium text-[#0B2C6B]">☰ {s.label}</span>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={s.enabled} onChange={(e) => onToggle(s.id, e.target.checked)} />
              Visible
            </label>
            <div className="flex gap-1">
              {i > 0 ? (
                <button type="button" className={adminBtnSecondary} onClick={() => onReorder(i, i - 1)}>↑</button>
              ) : null}
              {i < sections.length - 1 ? (
                <button type="button" className={adminBtnSecondary} onClick={() => onReorder(i, i + 1)}>↓</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function CmsHeroBannersPanel({ banners }: { banners: HeroBanner[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {banners.map((b) => (
        <AdminCard key={b.id}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase text-[#0E4FA8]">Banner #{b.id}</span>
            <StatusBadge status={b.status} />
          </div>
          {b.image ? <img src={b.image} alt="" className="mt-3 h-32 w-full rounded-xl object-cover" /> : null}
          <h4 className="mt-3 font-semibold text-[#0B2C6B]">{b.title}</h4>
          <p className="text-sm text-slate-500">{b.subtitle}</p>
          <p className="mt-2 text-sm"><span className="text-slate-500">Button:</span> {b.buttonText} → {b.buttonUrl}</p>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsSectionBlocksPanel({ blocks }: { blocks: SectionBlock[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {blocks.map((b) => (
        <AdminCard key={b.id}>
          <h4 className="text-sm font-semibold text-[#0B2C6B]">{b.name}</h4>
          <p className="mt-1 text-xs text-slate-500">{b.reusable ? 'Reusable block' : 'Single use'}</p>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsNavigationPanel({ links }: { links: NavLink[] }) {
  const groups = ['main', 'footer', 'quick', 'mobile', 'social'] as const
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const items = links.filter((l) => l.group === group)
        if (items.length === 0) return null
        return (
          <AdminCard key={group}>
            <h3 className="font-semibold capitalize text-[#0B2C6B]">{group.replace('_', ' ')} Navigation</h3>
            <ul className="mt-3 space-y-2">
              {items.map((l) => (
                <li key={l.id} className="flex justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
                  <span className="font-medium">{l.label}</span>
                  <span className="text-slate-500">{l.url}</span>
                </li>
              ))}
            </ul>
          </AdminCard>
        )
      })}
    </div>
  )
}

export function CmsStatisticsPanel({ statistics }: { statistics: CmsDashboardData['statistics'] }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Homepage Statistics</h3>
      <p className="mt-1 text-sm text-slate-500">Live counters displayed on the public website</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((s) => (
          <div key={s.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-center">
            <p className="text-2xl font-bold text-[#0B2C6B]">{s.value}</p>
            <p className="text-xs font-semibold uppercase text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function CmsTestimonialsPanel({ testimonials }: { testimonials: CmsTestimonial[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {testimonials.map((t) => (
        <AdminCard key={t.id}>
          <div className="flex gap-3">
            <img src={t.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h4 className="font-semibold text-[#0B2C6B]">{t.name}</h4>
              <p className="text-sm text-slate-500">{t.designation}</p>
              {t.featured ? <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600"><Star size={12} /> Featured</span> : null}
            </div>
          </div>
          <p className="mt-3 text-sm italic text-slate-600">&ldquo;{t.quote}&rdquo;</p>
          <p className="mt-2 text-xs text-slate-400">{t.category} · {'★'.repeat(t.rating)}</p>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsFocusAreasPanel({ focusAreas }: { focusAreas: FocusAreaCms[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {focusAreas.map((f) => (
        <AdminCard key={f.id}>
          <img src={f.image} alt="" className="h-28 w-full rounded-xl object-cover" />
          <h4 className="mt-3 font-semibold text-[#0B2C6B]">{f.title}</h4>
          <p className="mt-1 text-sm text-slate-500">{f.description}</p>
          <div className="mt-3 flex gap-4 text-xs text-slate-600">
            <span>{f.projects} projects</span>
            <span>{f.campaigns} campaigns</span>
            <span>{f.beneficiaries.toLocaleString('en-IN')} beneficiaries</span>
          </div>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsFormsPanel({ forms }: { forms: CmsForm[] }) {
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Form Builder</h3>
        <p className="mt-1 text-sm text-slate-500">Drag-and-drop field types: {FORM_FIELD_TYPES.join(' · ')}</p>
      </AdminCard>
      <div className="grid gap-4 sm:grid-cols-2">
        {forms.map((f) => (
          <AdminCard key={f.id}>
            <h4 className="font-semibold text-[#0B2C6B]">{f.name}</h4>
            <p className="mt-1 text-sm text-slate-500">{f.submissions.toLocaleString('en-IN')} submissions</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {f.fields.map((field) => (
                <span key={field} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{field}</span>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

export function CmsAnnouncementsPanel({ announcements }: { announcements: AnnouncementBar[] }) {
  return (
    <div className="space-y-4">
      {announcements.map((a) => (
        <AdminCard key={a.id}>
          <div className="rounded-xl bg-[#0B2C6B] px-4 py-3 text-center text-sm font-semibold text-white">
            {a.message} <span className="ml-2 underline">[{a.ctaText}]</span>
          </div>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Start</dt><dd>{a.startDate}</dd></div>
            <div><dt className="text-slate-500">End</dt><dd>{a.endDate}</dd></div>
            <div><dt className="text-slate-500">Priority</dt><dd>{a.priority}</dd></div>
          </dl>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsFooterPanel({ footer }: { footer: CmsDashboardData['footer'] }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Footer Manager</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div><dt className="text-slate-500">About</dt><dd className="mt-1">{footer.aboutText}</dd></div>
        <div className="flex gap-6">
          <div><dt className="text-slate-500">Address</dt><dd>{footer.address}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd>{footer.phone}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd>{footer.email}</dd></div>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {footer.policies.map((p) => (
          <span key={p} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{p}</span>
        ))}
      </div>
    </AdminCard>
  )
}

export function CmsSeoPanel({ pages }: { pages: WebsitePage[] }) {
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">SEO Center</h3>
        <p className="mt-1 text-sm text-slate-500">Meta title, description, keywords, schema, OG image, canonical URL, robots</p>
      </AdminCard>
      {pages.slice(0, 4).map((p) => (
        <AdminCard key={p.id}>
          <h4 className="font-medium text-[#0B2C6B]">{p.title} — {p.url}</h4>
          <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Google Preview</p>
            <p className="mt-2 text-lg text-[#1a0dab]">{p.metaTitle ?? p.title}</p>
            <p className="text-sm text-emerald-700">www.sanveda.org{p.url}</p>
            <p className="mt-1 text-sm text-slate-600">{p.metaDescription ?? 'Meta description for this page…'}</p>
          </div>
        </AdminCard>
      ))}
    </div>
  )
}

export function CmsRedirectsPanel({ redirects }: { redirects: UrlRedirect[] }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Redirect Manager</h3>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="pb-2 text-xs font-semibold uppercase text-slate-500">Old URL</th>
            <th className="pb-2 text-xs font-semibold uppercase text-slate-500">New URL</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map((r) => (
            <tr key={r.id} className="border-b border-[#E5E7EB]">
              <td className="py-2 font-mono text-xs">{r.oldUrl}</td>
              <td className="py-2 font-mono text-xs">{r.newUrl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  )
}

export function CmsMediaPanel() {
  const types = ['Images', 'Videos', 'PDFs', 'Documents', 'Icons', 'Banners']
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Media Library</h3>
      <p className="mt-1 text-sm text-slate-500">Connected to Gallery DAM — reuse assets across the website</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} type="button" className={adminBtnSecondary}>{t}</button>
        ))}
      </div>
    </AdminCard>
  )
}

export function CmsPublishingPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Draft & Publishing Workflow</h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 py-2">
        {WORKFLOW_STEPS.map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1 text-sm capitalize text-slate-600">
            {step}{i < arr.length - 1 ? <ArrowDown size={14} className="rotate-90 text-slate-400" /> : null}
          </span>
        ))}
      </div>
    </AdminCard>
  )
}

export function CmsSettingsPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">CMS Settings</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        <li>Site name: Sanveda Global Humanitarian Foundation</li>
        <li>Default language: English</li>
        <li>Timezone: Asia/Kolkata (IST)</li>
        <li>Public URL: https://sanveda.vercel.app</li>
      </ul>
    </AdminCard>
  )
}

export function CmsArchitecturePanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Content Engine Architecture</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Content Engine</h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {['CMS', 'Blogs', 'Stories', 'Gallery', 'Documents', 'Testimonials', 'SEO', 'Media Library', 'Forms', 'Announcements', 'Navigation', 'Publishing', 'Analytics', 'AI Content'].map((i) => (
              <li key={i}>├── {i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Website Flow</h4>
          <p className="mt-2 text-xs text-slate-600">
            CMS → Homepage → Focus Areas → Projects → Campaigns → Events → Blogs → Gallery → Documents → Forms
          </p>
          <p className="mt-3 text-xs text-slate-500">Beneficiary → Story → Blog → Campaign → Donation → Impact</p>
        </div>
      </div>
    </AdminCard>
  )
}

export function CmsPreviewPanel({ onPreview }: { onPreview: (device: 'desktop' | 'tablet' | 'mobile') => void }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Website Preview</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
          <button key={d} type="button" className={adminBtnSecondary} onClick={() => onPreview(d)}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
    </AdminCard>
  )
}
