import { ExternalLink, FileText, Pencil, Play, Share2, Sparkles, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AlbumProfile } from '../../../lib/galleryOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  album: AlbumProfile | null
  onClose: () => void
  onEdit: () => void
  onUploadMedia: () => void
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#0B2C6B]">{title}</h3>
      {children}
    </section>
  )
}

const APPROVAL_STEPS = ['uploaded', 'pending_review', 'approved', 'published'] as const

export default function GalleryAlbumProfileDrawer({ album, onClose, onEdit, onUploadMedia }: Props) {
  if (!album) return null

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' })

  const currentStep = APPROVAL_STEPS.indexOf(
    album.status === 'draft' ? 'uploaded' : album.status as typeof APPROVAL_STEPS[number],
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close album" />
      <aside className="relative flex h-full w-full max-w-3xl flex-col border-l border-[#E5E7EB] bg-white shadow-2xl">
        <div className="relative h-44 overflow-hidden">
          <img src={album.coverImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C6B]/90 via-[#0B2C6B]/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-xl font-semibold text-white">{album.title}</h2>
            <p className="text-sm text-white/80">{album.albumId} · {album.categoryLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-lg bg-black/30 p-2 text-white hover:bg-black/50">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
          <StatusBadge status={album.status} />
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
            {album.totalItems} items
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {album.storageGb} GB
          </span>
          <div className="ml-auto flex gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onUploadMedia}>
              Upload Media
            </button>
            <button type="button" className={adminBtnSecondary} onClick={onEdit}>
              <Pencil size={14} className="mr-1" />
              Edit
            </button>
            <Link to={album.publicUrl} className={adminBtnPrimary} target="_blank" rel="noreferrer">
              <ExternalLink size={14} className="mr-1" />
              Public Page
            </Link>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <Section title="Basic Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Album Name" value={album.title} />
              <Info label="Album ID" value={album.albumId} />
              <Info label="Category" value={album.categoryLabel} />
              <Info label="Project" value={album.project ?? '—'} />
              <Info label="Campaign" value={album.campaign ?? '—'} />
              <Info label="Created By" value={album.createdBy} />
              <Info label="Created Date" value={formatDate(album.createdDate)} />
              <Info label="Status" value={album.status.replace(/_/g, ' ')} />
            </div>
            {album.description ? (
              <p className="mt-3 text-sm text-slate-600">{album.description}</p>
            ) : null}
          </Section>

          <Section title="Statistics">
            <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4 sm:grid-cols-3">
              <Info label="Photos" value={album.photoCount} />
              <Info label="Videos" value={album.videoCount} />
              <Info label="Documents" value={album.documentCount} />
              <Info label="Downloads" value={album.downloads} />
              <Info label="Shares" value={album.shares} />
              <Info label="Storage" value={`${album.storageGb} GB`} />
            </div>
          </Section>

          <Section title="Approval Workflow">
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
              {APPROVAL_STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    i <= currentStep ? 'bg-[#0B2C6B] text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.replace(/_/g, ' ')}
                  </div>
                  {i < APPROVAL_STEPS.length - 1 ? (
                    <span className="mx-1 text-slate-300">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Media Grid">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {album.media.slice(0, 12).map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E5E7EB] bg-slate-100">
                  {item.mediaType === 'video' ? (
                    <div className="flex h-full items-center justify-center bg-slate-800">
                      <Play size={24} className="text-white/80" />
                    </div>
                  ) : item.mediaType === 'document' ? (
                    <div className="flex h-full flex-col items-center justify-center bg-slate-100 p-2">
                      <FileText size={20} className="text-slate-500" />
                      <span className="mt-1 truncate text-[10px] text-slate-500">{item.title}</span>
                    </div>
                  ) : (
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                    <p className="truncate text-[10px] font-medium text-white">{item.title}</p>
                    <p className="text-[9px] text-white/70">{item.docType}</p>
                  </div>
                </div>
              ))}
            </div>
            {album.media.length > 12 ? (
              <p className="mt-2 text-xs text-slate-500">+ {album.media.length - 12} more items</p>
            ) : null}
          </Section>

          <Section title="Media Metadata (Sample)">
            {album.media[0] ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
                <p className="font-semibold text-[#0B2C6B]">{album.media[0].title}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                  <Info label="Location" value={album.media[0].location ?? '—'} />
                  <Info label="Project" value={album.media[0].project ?? '—'} />
                  <Info label="Focus Area" value={album.media[0].focusArea ?? '—'} />
                  <Info label="Beneficiaries" value={album.media[0].beneficiaries ?? '—'} />
                  <Info label="Photographer" value={album.media[0].photographer ?? '—'} />
                  <Info label="Date" value={formatDate(album.media[0].date)} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {album.media[0].tags.map((t) => (
                    <span key={t} className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 border border-[#E5E7EB]">{t}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>

          <Section title="Project Integration">
            <ul className="space-y-1 rounded-xl border border-[#E5E7EB] p-3">
              {album.linkedProjects.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-[#0E4FA8]">├──</span> {p}
                </li>
              ))}
            </ul>
          </Section>

          {album.beforeAfterPairs.length > 0 ? (
            <Section title="Before / After Impact">
              {album.beforeAfterPairs.map((pair) => (
                <div key={pair.id} className="rounded-xl border border-[#E5E7EB] p-4">
                  <p className="mb-3 text-sm font-semibold text-[#0B2C6B]">{pair.title}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-500">Before Support</p>
                      <img src={pair.beforeUrl} alt="Before" className="aspect-video w-full rounded-lg object-cover" />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-500">After Support</p>
                      <img src={pair.afterUrl} alt="After" className="aspect-video w-full rounded-lg object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          ) : null}

          {album.successStories.length > 0 ? (
            <Section title="Success Stories">
              {album.successStories.map((story) => (
                <blockquote key={story.title} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="font-semibold text-emerald-900">{story.title}</p>
                  <p className="mt-2 italic text-emerald-800">&ldquo;{story.quote}&rdquo;</p>
                  <p className="mt-2 text-xs text-emerald-700">
                    {story.beneficiary} · {story.project} · Impact Score: {story.impactScore}
                  </p>
                </blockquote>
              ))}
            </Section>
          ) : null}

          <Section title="AI Tags">
            <div className="flex flex-wrap gap-2">
              {album.aiTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <Sparkles size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Social Media Integration">
            <div className="flex flex-wrap gap-2">
              {['Instagram Post', 'Facebook Album', 'LinkedIn Carousel', 'WhatsApp Media Pack'].map((label) => (
                <button key={label} type="button" className={adminBtnSecondary}>
                  <Share2 size={12} className="mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </aside>
    </div>
  )
}
