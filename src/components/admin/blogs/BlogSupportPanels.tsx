import { ArrowDown, CheckCircle } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import StatusBadge from '../ui/StatusBadge'
import { adminBtnSecondary } from '../ui/adminStyles'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { BlogArticleProfile, BlogAuthor } from '../../../lib/blogOperationsService'
import { BLOG_CATEGORIES } from '../../../lib/blogOperationsService'

export function BlogFeaturedStory({ story }: { story: BlogArticleProfile }) {
  return (
    <AdminCard>
      <span className="text-xs font-semibold uppercase tracking-wide text-[#0E4FA8]">Featured Story</span>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row">
        {story.bannerImage ? (
          <img src={story.bannerImage} alt="" className="h-32 w-full rounded-xl object-cover sm:w-48" />
        ) : null}
        <div>
          <h3 className="text-lg font-semibold text-[#0B2C6B]">&ldquo;{story.title}&rdquo;</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <div><p className="text-slate-500">Views</p><p className="font-bold">{story.analytics.views.toLocaleString('en-IN')}</p></div>
            <div><p className="text-slate-500">Published</p><p className="font-bold">{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}</p></div>
          </div>
        </div>
      </div>
    </AdminCard>
  )
}

export function BlogAuthorsPanel({ authors }: { authors: BlogAuthor[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {authors.map((a) => (
        <AdminCard key={a.id}>
          <div className="flex gap-3">
            <img src={a.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <h4 className="font-semibold text-[#0B2C6B]">{a.name}</h4>
              <p className="text-sm text-slate-500">{a.designation}</p>
              <p className="mt-1 text-xs text-slate-400">Articles: {a.articlesCount}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{a.bio}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {a.socialLinks.map((s) => (
              <span key={s} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">{s}</span>
            ))}
          </div>
        </AdminCard>
      ))}
    </div>
  )
}

export function BlogCategoriesPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {BLOG_CATEGORIES.map((cat) => (
        <AdminCard key={cat}>
          <h4 className="text-sm font-semibold text-[#0B2C6B]">{cat}</h4>
          <p className="mt-1 text-xs text-slate-500">NGO content category</p>
        </AdminCard>
      ))}
    </div>
  )
}

export function BlogStoriesPanel({ articles }: { articles: BlogArticleProfile[] }) {
  const stories = articles.filter((a) => a.contentType === 'story' || a.beneficiaryStory)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(stories.length ? stories : articles.slice(0, 2)).map((s) => (
        <AdminCard key={s.id}>
          <h4 className="font-semibold text-[#0B2C6B]">{s.beneficiaryStory?.beneficiaryName ?? s.title}</h4>
          {s.beneficiaryStory ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Program</dt><dd>{s.beneficiaryStory.program}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Support Received</dt><dd className="font-bold">₹{formatIndianCompact(s.beneficiaryStory.supportAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-semibold text-emerald-700">{s.beneficiaryStory.outcomeStatus}</dd></div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{s.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {['Story', 'Gallery', 'Video', 'Outcome'].map((l) => (
              <span key={l} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{l}</span>
            ))}
          </div>
        </AdminCard>
      ))}
    </div>
  )
}

export function BlogProjectIntegrationPanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Project Integration</h3>
      <div className="mt-4 flex flex-col items-center gap-2 py-2 sm:flex-row sm:justify-center">
        {['Focus Area', 'Project', 'Campaign', 'Article'].map((step, i, arr) => (
          <div key={step} className="flex items-center gap-2">
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0B2C6B]">{step}</span>
            {i < arr.length - 1 ? <ArrowDown size={14} className="rotate-90 text-slate-400 sm:rotate-0" /> : null}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-slate-600">
        Healthcare → Cancer Care → Save Lives Campaign → Impact Story
      </p>
    </AdminCard>
  )
}

export function BlogMediaPanel() {
  const types = ['Images', 'Videos', 'Documents', 'Infographics', 'PDFs']
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Media Library</h3>
      <p className="mt-1 text-sm text-slate-500">Connected to Gallery DAM — reuse assets across stories and campaigns</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} type="button" className={adminBtnSecondary}>{t}</button>
        ))}
      </div>
    </AdminCard>
  )
}

export function BlogPublishingPanel({ articles }: { articles: BlogArticleProfile[] }) {
  const scheduled = articles.filter((a) => a.workflowStatus === 'scheduled')
  return (
    <div className="space-y-4">
      <AdminCard>
        <h3 className="font-semibold text-[#0B2C6B]">Publishing Workflow</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {['draft', 'review', 'approved', 'scheduled', 'published', 'archived'].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1 text-xs capitalize text-slate-600">
              {s}{i < arr.length - 1 ? ' →' : ''}
            </span>
          ))}
        </div>
      </AdminCard>
      {scheduled.length > 0 ? (
        <AdminCard>
          <h4 className="font-semibold text-[#0B2C6B]">Scheduled Posts</h4>
          {scheduled.map((a) => (
            <div key={a.id} className="mt-2 flex justify-between text-sm">
              <span>{a.title}</span>
              <span className="text-slate-500">{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('en-IN') : '—'}</span>
            </div>
          ))}
        </AdminCard>
      ) : (
        <AdminCard>
          <p className="text-sm text-slate-600">Example schedule: Publish 15 Jul 2026, 9:00 AM</p>
        </AdminCard>
      )}
    </div>
  )
}

export function BlogSeoOverviewPanel({ articles }: { articles: BlogArticleProfile[] }) {
  const missingSeo = articles.filter((a) => !a.seo.metaDescription?.trim())
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">SEO Overview</h3>
      <p className="mt-1 text-sm text-slate-500">{missingSeo.length} articles missing SEO metadata</p>
      <div className="mt-4 space-y-2">
        {articles.slice(0, 5).map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
            <span className="truncate">{a.title}</span>
            {a.seo.metaDescription ? <CheckCircle size={14} className="shrink-0 text-emerald-600" /> : <StatusBadge status="warning" />}
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function BlogAnalyticsDetail({ article }: { article: BlogArticleProfile }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        { label: 'Views', value: article.analytics.views.toLocaleString('en-IN') },
        { label: 'Shares', value: String(article.analytics.shares) },
        { label: 'Donations Generated', value: `₹${formatIndianCompact(article.analytics.donationsGenerated)}` },
        { label: 'Reading Time', value: `${article.analytics.readingTimeMinutes}m` },
        { label: 'CTR', value: `${article.analytics.ctr}%` },
      ].map((m) => (
        <div key={m.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
          <p className="text-xs font-semibold uppercase text-slate-500">{m.label}</p>
          <p className="mt-1 text-lg font-bold text-[#0B2C6B]">{m.value}</p>
        </div>
      ))}
    </div>
  )
}

export function BlogRelatedContent({ suggestions }: { suggestions: string[] }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Related Content Engine</h3>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s) => (
          <li key={s} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="text-emerald-600" /> {s}
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}

export function BlogSocialPublishing({ formats }: { formats: string[] }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Social Publishing</h3>
      <p className="mt-1 text-sm text-slate-500">Auto-generate social content from articles</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {formats.map((f) => (
          <button key={f} type="button" className={adminBtnSecondary}>{f}</button>
        ))}
      </div>
    </AdminCard>
  )
}

export function BlogArchitecturePanel() {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">Content Engine Architecture</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Content Engine</h4>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {['Blogs', 'Stories', 'News', 'Reports', 'Gallery', 'Documents', 'Testimonials', 'Media Assets', 'SEO', 'Social Publishing', 'AI Content'].map((i) => (
              <li key={i}>├── {i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <h4 className="text-sm font-semibold text-[#0B2C6B]">Fundraising Funnel</h4>
          <p className="mt-2 text-xs text-slate-600">
            Beneficiary → Story → Blog → Campaign → Donation → Impact
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Article model: Author · Category · Focus Area · Project · Campaign · Beneficiary · Gallery · Documents · SEO · Analytics
      </p>
    </AdminCard>
  )
}

export function BlogArticleAnalyticsTable({ articles }: { articles: BlogArticleProfile[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
            {['Article', 'Views', 'Shares', 'Donations', 'Reading Time', 'CTR'].map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.slice(0, 10).map((a) => (
            <tr key={a.id} className="border-b border-[#E5E7EB]">
              <td className="px-4 py-3 font-medium">{a.title}</td>
              <td className="px-4 py-3">{a.analytics.views.toLocaleString('en-IN')}</td>
              <td className="px-4 py-3">{a.analytics.shares}</td>
              <td className="px-4 py-3">₹{formatIndianCompact(a.analytics.donationsGenerated)}</td>
              <td className="px-4 py-3">{a.analytics.readingTimeMinutes}m</td>
              <td className="px-4 py-3">{a.analytics.ctr}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BlogAiWriterPanel({ onOpen }: { onOpen: () => void }) {
  return (
    <AdminCard>
      <h3 className="font-semibold text-[#0B2C6B]">AI Writing Assistant</h3>
      <p className="mt-2 text-sm text-slate-500">
        Prompt: &ldquo;Write an impact story about a healthcare camp that treated 500 patients.&rdquo;
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {['Headline', 'Summary', 'Article', 'SEO', 'Social Posts'].map((o) => (
          <span key={o} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">✓ {o}</span>
        ))}
      </div>
      <button type="button" className={`${adminBtnSecondary} mt-4`} onClick={onOpen}>Open AI Writer</button>
    </AdminCard>
  )
}
