import { useEffect, useState } from 'react'
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Image, Video, Quote, Table, Link2, LayoutGrid, X,
} from 'lucide-react'
import {
  BLOG_CATEGORIES,
  CONTENT_TYPE_LABELS,
  WORKFLOW_STEPS,
  type BlogArticleProfile,
  type BlogAuthor,
  type ContentType,
  type ArticleWorkflowStatus,
} from '../../../lib/blogOperationsService'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass, adminLabelClass } from '../ui/adminStyles'

interface Props {
  open: boolean
  article: Partial<BlogArticleProfile> | null
  authors: BlogAuthor[]
  onClose: () => void
  onSave: (article: Partial<BlogArticleProfile> & { title: string }) => void
}

const TOOLBAR = [
  { icon: Bold, action: '**', label: 'Bold' },
  { icon: Italic, action: '*', label: 'Italic' },
  { icon: Underline, action: '__', label: 'Underline' },
  { icon: Heading1, action: '# ', label: 'H1' },
  { icon: Heading2, action: '## ', label: 'H2' },
  { icon: Heading3, action: '### ', label: 'H3' },
  { icon: List, action: '- ', label: 'List' },
  { icon: ListOrdered, action: '1. ', label: 'Ordered' },
  { icon: Image, action: '![image](url)', label: 'Image' },
  { icon: Video, action: '[video](url)', label: 'Video' },
  { icon: Quote, action: '> ', label: 'Quote' },
  { icon: Table, action: '| col | col |', label: 'Table' },
  { icon: Link2, action: '[link](url)', label: 'Link' },
  { icon: LayoutGrid, action: '[gallery]', label: 'Gallery' },
]

const EMPTY: Partial<BlogArticleProfile> = {
  title: '',
  slug: '',
  category: 'Impact Stories',
  description: '',
  bannerImage: '/assets/fallBackBanner',
  contentType: 'blog',
  workflowStatus: 'draft',
  focusArea: 'Healthcare',
  project: 'Community Outreach',
  campaign: 'Save Lives Campaign',
  tags: [],
  bodyHtml: '',
  isFeatured: false,
  seo: {
    seoTitle: '',
    metaDescription: '',
    keywords: '',
    ogImage: '',
    canonicalUrl: '',
    schemaType: 'Article',
  },
}

export default function BlogEditorModal({ open, article, authors, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<BlogArticleProfile>>(EMPTY)
  const [tab, setTab] = useState<'content' | 'seo' | 'publishing'>('content')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (!open) return
    if (article) {
      setForm({ ...EMPTY, ...article })
      setTagsInput(article.tags?.join(', ') ?? '')
    } else {
      setForm({ ...EMPTY, authorId: authors[0]?.id, authorName: authors[0]?.name })
      setTagsInput('')
    }
    setTab('content')
  }, [open, article, authors])

  if (!open) return null

  const set = (patch: Partial<BlogArticleProfile>) => setForm((f) => ({ ...f, ...patch }))
  const setSeo = (patch: Partial<BlogArticleProfile['seo']>) =>
    setForm((f) => ({ ...f, seo: { ...EMPTY.seo!, ...f.seo, ...patch } }))

  const insertFormat = (action: string) => {
    set({ bodyHtml: `${form.bodyHtml ?? ''}\n${action}` })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) return
    onSave({
      ...form,
      title: form.title.trim(),
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      authorName: authors.find((a) => a.id === form.authorId)?.name ?? form.authorName,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8">
      <div className="mb-8 w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0B2C6B]">{form.id ? 'Edit Article' : 'New Article'}</h2>
            <p className="text-sm text-slate-500">Rich editor with SEO, publishing, and project integration</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 border-b border-[#E5E7EB] px-5 pt-3">
            {(['content', 'seo', 'publishing'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`border-b-2 px-3 py-2 text-sm font-semibold capitalize ${
                  tab === t ? 'border-[#0B2C6B] text-[#0B2C6B]' : 'border-transparent text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-5">
            {tab === 'content' ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={adminLabelClass}>Title *</label>
                    <input className={adminInputClass} value={form.title ?? ''} onChange={(e) => set({ title: e.target.value })} required />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Slug</label>
                    <input className={adminInputClass} value={form.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Category</label>
                    <select className={adminInputClass} value={form.category ?? ''} onChange={(e) => set({ category: e.target.value })}>
                      {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={adminLabelClass}>Author</label>
                    <select className={adminInputClass} value={form.authorId ?? ''} onChange={(e) => set({ authorId: e.target.value })}>
                      {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={adminLabelClass}>Content Type</label>
                    <select className={adminInputClass} value={form.contentType ?? 'blog'} onChange={(e) => set({ contentType: e.target.value as ContentType })}>
                      {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
                        <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={adminLabelClass}>Focus Area</label>
                    <input className={adminInputClass} value={form.focusArea ?? ''} onChange={(e) => set({ focusArea: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Project</label>
                    <input className={adminInputClass} value={form.project ?? ''} onChange={(e) => set({ project: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Campaign</label>
                    <input className={adminInputClass} value={form.campaign ?? ''} onChange={(e) => set({ campaign: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Featured Image</label>
                    <input className={adminInputClass} value={form.bannerImage ?? ''} onChange={(e) => set({ bannerImage: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={adminLabelClass}>Tags</label>
                    <input className={adminInputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="impact, healthcare, community" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={adminLabelClass}>Summary</label>
                    <textarea className={`${adminInputClass} min-h-[80px]`} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={adminLabelClass}>Content Editor</label>
                  <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                    <div className="flex flex-wrap gap-1 border-b border-[#E5E7EB] bg-[#F8FAFC] p-2">
                      {TOOLBAR.map(({ icon: Icon, action, label }) => (
                        <button key={label} type="button" title={label} onClick={() => insertFormat(action)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-[#0B2C6B]">
                          <Icon size={16} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="min-h-[240px] w-full resize-y border-0 p-4 text-sm outline-none"
                      value={form.bodyHtml ?? ''}
                      onChange={(e) => set({ bodyHtml: e.target.value })}
                      placeholder="Write your impact story…"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Example structure: Introduction → Section 1 → Section 2 → Beneficiary Story → Impact Metrics
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isFeatured ?? false} onChange={(e) => set({ isFeatured: e.target.checked })} />
                  Featured Story
                </label>
              </div>
            ) : null}

            {tab === 'seo' ? (
              <div className="space-y-4">
                <div>
                  <label className={adminLabelClass}>SEO Title</label>
                  <input className={adminInputClass} value={form.seo?.seoTitle ?? ''} onChange={(e) => setSeo({ seoTitle: e.target.value })} />
                </div>
                <div>
                  <label className={adminLabelClass}>Meta Description</label>
                  <textarea className={`${adminInputClass} min-h-[80px]`} value={form.seo?.metaDescription ?? ''} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
                </div>
                <div>
                  <label className={adminLabelClass}>Keywords</label>
                  <input className={adminInputClass} value={form.seo?.keywords ?? ''} onChange={(e) => setSeo({ keywords: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>OG Image</label>
                    <input className={adminInputClass} value={form.seo?.ogImage ?? ''} onChange={(e) => setSeo({ ogImage: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Schema Type</label>
                    <input className={adminInputClass} value={form.seo?.schemaType ?? 'Article'} onChange={(e) => setSeo({ schemaType: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={adminLabelClass}>Canonical URL</label>
                  <input className={adminInputClass} value={form.seo?.canonicalUrl ?? ''} onChange={(e) => setSeo({ canonicalUrl: e.target.value })} />
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Google Search Preview</p>
                  <p className="mt-2 text-lg text-[#1a0dab]">{form.seo?.seoTitle || form.title || 'How Community Support…'}</p>
                  <p className="text-sm text-emerald-700">{form.seo?.canonicalUrl || 'www.sanveda.org/blogs/…'}</p>
                  <p className="mt-1 text-sm text-slate-600">{form.seo?.metaDescription || form.description || 'Meta description preview…'}</p>
                </div>
              </div>
            ) : null}

            {tab === 'publishing' ? (
              <div className="space-y-4">
                <div>
                  <label className={adminLabelClass}>Workflow Status</label>
                  <select className={adminInputClass} value={form.workflowStatus ?? 'draft'} onChange={(e) => set({ workflowStatus: e.target.value as ArticleWorkflowStatus })}>
                    {WORKFLOW_STEPS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 py-2">
                  {WORKFLOW_STEPS.map((step, i) => (
                    <span key={step} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${form.workflowStatus === step ? 'bg-[#0B2C6B] text-white' : 'bg-slate-100'}`}>
                        {step}
                      </span>
                      {i < WORKFLOW_STEPS.length - 1 ? '→' : null}
                    </span>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>Publish Date</label>
                    <input type="datetime-local" className={adminInputClass}
                      value={form.scheduledAt?.slice(0, 16) ?? ''}
                      onChange={(e) => set({ scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Reviewer</label>
                    <input className={adminInputClass} value={form.reviewer ?? ''} onChange={(e) => set({ reviewer: e.target.value })} />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Expiry Date</label>
                    <input type="date" className={adminInputClass} value={form.expiryDate?.slice(0, 10) ?? ''} onChange={(e) => set({ expiryDate: e.target.value })} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] p-5">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary}>{form.id ? 'Update Article' : 'Save Article'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
