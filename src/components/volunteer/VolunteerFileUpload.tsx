import { FileText, Upload, X } from 'lucide-react'

interface Props {
  label: string
  accept: string
  hint?: string
  file: File | null
  onChange: (file: File | null) => void
}

export default function VolunteerFileUpload({ label, accept, hint, file, onChange }: Props) {
  return (
    <div className="volunteer-upload">
      <span className="volunteer-upload-label">{label}</span>
      {file ? (
        <div className="volunteer-upload-file">
          <FileText size={18} />
          <span>{file.name}</span>
          <button type="button" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="volunteer-upload-dropzone">
          <Upload size={22} />
          <span>Click to upload or drag a file here</span>
          {hint ? <small>{hint}</small> : null}
          <input
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  )
}
