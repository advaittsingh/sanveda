import type { ReportPdfRequest, ReportPdfResponse } from './reportPdfTypes'
import ReportPdfWorker from '../workers/reportPdf.worker?worker'

type Pending = {
  resolve: (buffer: ArrayBuffer) => void
  reject: (error: Error) => void
  filename: string
}

let worker: Worker | null = null
const pending = new Map<string, Pending>()

function getWorker(): Worker {
  if (worker) return worker
  worker = new ReportPdfWorker()
  worker.onmessage = (event: MessageEvent<ReportPdfResponse>) => {
    const response = event.data
    const entry = pending.get(response.requestId)
    if (!entry) return
    pending.delete(response.requestId)
    if (response.ok) entry.resolve(response.buffer)
    else entry.reject(new Error(response.error))
  }
  worker.onerror = (event) => {
    const error = new Error(event.message || 'PDF worker failed')
    for (const [id, entry] of pending) {
      pending.delete(id)
      entry.reject(error)
    }
  }
  return worker
}

function downloadBuffer(filename: string, buffer: ArrayBuffer) {
  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function downloadReportPdf(
  input: Omit<ReportPdfRequest, 'requestId'>,
): Promise<void> {
  const requestId = crypto.randomUUID()
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    pending.set(requestId, { resolve, reject, filename: input.filename })
    getWorker().postMessage({ ...input, requestId } satisfies ReportPdfRequest)
  })
  downloadBuffer(input.filename, buffer)
}
