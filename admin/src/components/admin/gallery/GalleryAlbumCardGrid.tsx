import { ArrowRight, FileText, Play } from 'lucide-react'
import type { AlbumProfile } from '../../../lib/galleryOperationsService'
import { adminBtnSecondary } from '../ui/adminStyles'
import StatusBadge from '../ui/StatusBadge'

interface Props {
  albums: AlbumProfile[]
  onOpen: (album: AlbumProfile) => void
}

export default function GalleryAlbumCardGrid({ albums, onOpen }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {albums.map((album) => (
        <article
          key={album.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition hover:border-[#0B2C6B]/20 hover:shadow-md"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              src={album.coverImage}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {album.categoryLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="text-base font-semibold text-[#0B2C6B]">{album.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {album.photoCount} Photos
              {album.videoCount > 0 ? ` • ${album.videoCount} Videos` : ''}
              {album.documentCount > 0 ? ` • ${album.documentCount} Docs` : ''}
            </p>

            {album.project ? (
              <p className="mt-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Project:</span> {album.project}
              </p>
            ) : null}

            <div className="mt-3">
              <StatusBadge status={album.status} />
            </div>

            <button
              type="button"
              className={`${adminBtnSecondary} mt-4 w-full justify-center`}
              onClick={() => onOpen(album)}
            >
              Open
              <ArrowRight size={14} className="ml-1.5" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export function MediaTypeIcon({ type }: { type: 'image' | 'video' | 'document' }) {
  if (type === 'video') return <Play size={14} className="text-white" />
  if (type === 'document') return <FileText size={14} className="text-white" />
  return null
}
