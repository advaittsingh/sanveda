/// <reference lib="webworker" />
import { jsPDF } from 'jspdf'
import type { ReportPdfRequest, ReportPdfResponse } from '../lib/reportPdfTypes'

const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_BOTTOM = 278
const LINE = 5.5
const BRAND = {
  primary: [4, 27, 77] as const,
  secondary: [14, 79, 168] as const,
  muted: [74, 74, 73] as const,
  border: [221, 221, 221] as const,
  rowAlt: [245, 247, 250] as const,
  white: [255, 255, 255] as const,
  name: 'Sanveda Global Humanitarian Foundation',
  shortName: 'Sanveda',
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= CONTENT_BOTTOM) return y
  doc.addPage()
  drawHeader(doc)
  drawFooter(doc, doc.getNumberOfPages())
  return 36
}

function drawHeader(doc: jsPDF) {
  doc.setFillColor(...BRAND.primary)
  doc.rect(0, 0, PAGE_W, 22, 'F')
  doc.setFillColor(...BRAND.secondary)
  doc.rect(0, 22, PAGE_W, 1.5, 'F')

  doc.setTextColor(...BRAND.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(BRAND.shortName, MARGIN, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('NGO Operating System · Report Export', MARGIN, 16)
}

function drawFooter(doc: jsPDF, page: number) {
  const y = PAGE_H - 10
  doc.setDrawColor(...BRAND.border)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4)

  doc.setTextColor(...BRAND.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(BRAND.name, MARGIN, y)
  doc.text(`Page ${page}`, PAGE_W - MARGIN, y, { align: 'right' })
}

function drawWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE)
    doc.text(line, x, y)
    y += LINE
  }
  return y
}

function buildPdf(payload: ReportPdfRequest): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const width = PAGE_W - MARGIN * 2
  drawHeader(doc)
  drawFooter(doc, 1)

  let y = 34

  doc.setTextColor(...BRAND.primary)
  doc.setFont('helvetica', 'bold')
  y = drawWrapped(doc, payload.title, MARGIN, y, width, 16)

  doc.setTextColor(...BRAND.muted)
  doc.setFont('helvetica', 'normal')
  y = drawWrapped(doc, payload.subtitle, MARGIN, y + 1, width, 9)

  const generated = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.setFontSize(8)
  doc.text(`Generated ${generated}`, MARGIN, y + 2)
  y += 10

  if (payload.metrics?.length) {
    y = ensureSpace(doc, y, 28)
    const cols = Math.min(payload.metrics.length, 4)
    const gap = 3
    const cardW = (width - gap * (cols - 1)) / cols
    const cardH = 18

    payload.metrics.slice(0, 4).forEach((metric, index) => {
      const x = MARGIN + index * (cardW + gap)
      doc.setFillColor(...BRAND.rowAlt)
      doc.setDrawColor(...BRAND.border)
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD')

      doc.setTextColor(...BRAND.muted)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text(metric.label, x + 3, y + 6)

      doc.setTextColor(...BRAND.primary)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      const valueLines = doc.splitTextToSize(metric.value, cardW - 6) as string[]
      doc.text(valueLines[0] ?? '', x + 3, y + 13)
    })
    y += cardH + 8
  }

  for (const table of payload.tables ?? []) {
    y = ensureSpace(doc, y, 20)
    doc.setTextColor(...BRAND.primary)
    doc.setFont('helvetica', 'bold')
    y = drawWrapped(doc, table.title, MARGIN, y, width, 11)
    y += 3

    const colCount = Math.max(table.headers.length, 1)
    const colWidth = width / colCount
    const cellPadX = 1.5

    const drawRow = (cells: string[], bold: boolean, fill: readonly [number, number, number] | null) => {
      const wrapped = cells.map(
        (cell) => doc.splitTextToSize(String(cell ?? ''), colWidth - cellPadX * 2) as string[],
      )
      const rowHeight = Math.max(LINE + 1, ...wrapped.map((lines) => lines.length * LINE)) + 2
      y = ensureSpace(doc, y, rowHeight + 1)

      if (fill) {
        doc.setFillColor(...fill)
        doc.rect(MARGIN, y - 3.5, width, rowHeight, 'F')
      }

      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(8)
      const textColor = bold ? BRAND.white : BRAND.primary
      doc.setTextColor(textColor[0], textColor[1], textColor[2])

      wrapped.forEach((lines, index) => {
        let cellY = y
        for (const line of lines) {
          doc.text(line, MARGIN + index * colWidth + cellPadX, cellY)
          cellY += LINE
        }
      })
      y += rowHeight

      doc.setDrawColor(...BRAND.border)
      doc.setLineWidth(0.2)
      doc.line(MARGIN, y - 3.5, MARGIN + width, y - 3.5)
    }

    drawRow(table.headers, true, BRAND.secondary)

    table.rows.forEach((row, rowIndex) => {
      const cells = table.headers.map((_, index) => row[index] ?? '')
      drawRow(cells, false, rowIndex % 2 === 0 ? null : BRAND.rowAlt)
    })
    y += 6
  }

  const total = doc.getNumberOfPages()
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page)
    drawHeader(doc)
    drawFooter(doc, page)
  }

  return doc.output('arraybuffer')
}

self.onmessage = (event: MessageEvent<ReportPdfRequest>) => {
  const payload = event.data
  try {
    const buffer = buildPdf(payload)
    const response: ReportPdfResponse = {
      requestId: payload.requestId,
      ok: true,
      filename: payload.filename,
      buffer,
    }
    ;(self as DedicatedWorkerGlobalScope).postMessage(response, [buffer])
  } catch (error) {
    const response: ReportPdfResponse = {
      requestId: payload.requestId,
      ok: false,
      error: error instanceof Error ? error.message : 'PDF generation failed',
    }
    ;(self as DedicatedWorkerGlobalScope).postMessage(response)
  }
}

export {}
