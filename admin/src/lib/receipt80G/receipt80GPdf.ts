import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { generateReceipt80GHtml } from './generateReceiptHtml'
import type { Receipt80GData } from './types'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

/**
 * Build the downloadable PDF from the same HTML used for View / Print,
 * so layout, fields, and styling stay in sync.
 */
export async function generateReceipt80GPdf(data: Receipt80GData): Promise<Blob> {
  const html = generateReceipt80GHtml(data)
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = [
    'position:fixed',
    'left:-10000px',
    'top:0',
    'width:794px', // ~A4 at 96dpi
    'background:#fff',
    'pointer-events:none',
    'z-index:-1',
  ].join(';')

  const iframe = document.createElement('iframe')
  iframe.title = 'receipt-pdf-render'
  iframe.style.cssText = 'border:0;width:794px;height:1123px;background:#fff'
  host.appendChild(iframe)
  document.body.appendChild(host)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error('Could not prepare receipt for PDF export')

    doc.open()
    doc.write(html)
    doc.close()

    await waitForImages(doc)
    // Allow layout/fonts to settle before capture.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    const article = doc.getElementById('receipt-80g') ?? doc.body
    const canvas = await html2canvas(article, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    })

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
    const pageWidth = A4_WIDTH_MM
    const pageHeight = A4_HEIGHT_MM
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
    heightLeft -= pageHeight

    while (heightLeft > 2) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pageHeight
    }

    return pdf.output('blob')
  } finally {
    host.remove()
  }
}

function waitForImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images)
  if (!images.length) return Promise.resolve()
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  ).then(() => undefined)
}

/** Stable download name — never includes the literal word "undefined". */
export function receiptPdfFilename(receiptNumber: string | null | undefined): string {
  const cleaned = String(receiptNumber ?? '')
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const safe =
    cleaned && cleaned.toLowerCase() !== 'undefined' && cleaned.toLowerCase() !== 'null'
      ? cleaned
      : 'PENDING'
  return `Sanveda_Donation_Receipt_${safe}.pdf`
}

export function downloadReceipt80GPdfBlob(blob: Blob, receiptNumber: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = receiptPdfFilename(receiptNumber)
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
