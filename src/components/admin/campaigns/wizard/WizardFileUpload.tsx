import { useCallback, useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { fileToDataUrl, DOCUMENT_CATEGORIES } from '../../../../lib/campaignWizardValidation'
import type { CampaignUploadedFile } from '../../../../types/campaignAdmin'

interface Props {
  label: string
  accept?: string
  hint?: string
  multiple?: boolean
  value?: string | string[]
  onChange: (url: string | string[]) => void
}

export default function WizardFileUpload({ label, accept = 'image/*', hint, multiple, value, onChange }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    const urls: string[] = []
    for (const file of Array.from(files)) {
      urls.push(await fileToDataUrl(file))
    }
    if (multiple) {
      const existing = Array.isArray(value) ? value : value ? [value] : []
      onChange([...existing, ...urls])
    } else {
      onChange(urls[0])
    }
  }, [multiple, onChange, value])

  const previews = multiple
    ? (Array.isArray(value) ? value : [])
    : value && !Array.isArray(value) ? [value] : []

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-[#0E4FA8] bg-sky-50' : 'border-[#E5E7EB] bg-[#F8FAFC]'}`}
      >
        <Upload size={28} className="mx-auto mb-2 text-[#0E4FA8]" />
        <p className="text-sm font-medium text-slate-700">Drop files here</p>
        <p className="text-xs text-slate-500">or browse files</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        <label className="mt-3 inline-block cursor-pointer rounded-xl bg-[#0B2C6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2459]">
          Browse files
          <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
      {previews.length > 0 && (
        <div className={`mt-3 grid gap-2 ${multiple ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {previews.map((url, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-[#E5E7EB]">
              {url.startsWith('data:image') || url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                <img src={url} alt="" className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 items-center justify-center gap-2 bg-slate-50 text-sm text-slate-600">
                  <FileText size={18} /> File uploaded
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (multiple && Array.isArray(value)) {
                    onChange(value.filter((_, idx) => idx !== i))
                  } else {
                    onChange('')
                  }
                }}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface DocUploadProps {
  files: CampaignUploadedFile[]
  onChange: (files: CampaignUploadedFile[]) => void
}

export function WizardDocumentUpload({ files, onChange }: DocUploadProps) {
  const addDoc = async (file: File, category: string) => {
    const url = await fileToDataUrl(file)
    onChange([
      ...files,
      { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, url, category, verified: false },
    ])
  }

  return (
    <div className="space-y-4">
      {DOCUMENT_CATEGORIES.map((cat) => {
        const existing = files.filter((f) => f.category === cat)
        return (
          <div key={cat} className="rounded-xl border border-[#E5E7EB] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{cat}</span>
              <label className="cursor-pointer text-xs font-semibold text-[#0E4FA8] hover:underline">
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) addDoc(file, cat)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {existing.length === 0 ? (
              <p className="text-xs text-slate-400">No file uploaded</p>
            ) : (
              <ul className="space-y-1">
                {existing.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={14} className="shrink-0 text-[#0E4FA8]" />
                      {f.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onChange(files.map((x) => x.id === f.id ? { ...x, verified: !x.verified } : x))}
                        className={`text-xs font-semibold ${f.verified ? 'text-emerald-600' : 'text-slate-400'}`}
                      >
                        {f.verified ? 'verified ✓' : 'Mark verified'}
                      </button>
                      <button type="button" onClick={() => onChange(files.filter((x) => x.id !== f.id))} className="text-slate-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
