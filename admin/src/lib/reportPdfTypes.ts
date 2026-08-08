export type ReportPdfMetric = { label: string; value: string }

export type ReportPdfTable = {
  title: string
  headers: string[]
  rows: string[][]
}

export type ReportPdfRequest = {
  requestId: string
  title: string
  subtitle: string
  filename: string
  metrics?: ReportPdfMetric[]
  tables?: ReportPdfTable[]
}

export type ReportPdfSuccess = {
  requestId: string
  ok: true
  filename: string
  buffer: ArrayBuffer
}

export type ReportPdfFailure = {
  requestId: string
  ok: false
  error: string
}

export type ReportPdfResponse = ReportPdfSuccess | ReportPdfFailure
