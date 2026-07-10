import { jsPDF } from 'jspdf'
import type { Receipt80GData } from './types'

const MARGIN = 14
const PAGE_W = 210
const CONTENT_W = PAGE_W - MARGIN * 2

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

export async function generateReceipt80GPdf(data: Receipt80GData): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { ngo } = data
  let y = MARGIN

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(ngo.primaryColor)
  doc.text(ngo.ngoName.toUpperCase(), PAGE_W / 2, y, { align: 'center' })
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(ngo.tagline, PAGE_W / 2, y, { align: 'center' })
  y += 5

  doc.setFontSize(8)
  doc.setTextColor(5, 150, 105)
  doc.text(`[ ${data.status} ]  Section 80G Donation Receipt`, PAGE_W - MARGIN, y, { align: 'right' })
  y += 8

  doc.setDrawColor(226, 232, 240)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 8

  const colW = CONTENT_W / 2 - 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('RECEIPT DETAILS', MARGIN, y)
  doc.text('DONOR DETAILS', MARGIN + colW + 8, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30)

  const leftRows: [string, string][] = [
    ['Receipt No.', data.receiptNumber],
    ['Date', data.donationDate],
    ['Donation ID', data.donationId.slice(0, 18)],
    ['80G Reg.', data.eightyGNumber],
    ['12A Reg.', data.twelveANumber],
    ['NGO PAN', data.ngoPan],
    ['Financial Year', data.financialYear],
  ]
  const rightRows: [string, string][] = [
    ['Name', data.donorName],
    ['Email', data.email],
    ['Phone', data.phone],
    ['PAN', data.pan],
    ['City', data.city],
    ['State', data.state],
    ['Country', data.country],
  ]

  const startY = y
  leftRows.forEach(([k, v], i) => {
    doc.setTextColor(100)
    doc.text(k, MARGIN, startY + i * 5)
    doc.setTextColor(30)
    doc.text(v, MARGIN + 32, startY + i * 5)
  })
  rightRows.forEach(([k, v], i) => {
    doc.setTextColor(100)
    doc.text(k, MARGIN + colW + 8, startY + i * 5)
    doc.setTextColor(30)
    doc.text(v, MARGIN + colW + 40, startY + i * 5)
  })
  y = startY + Math.max(leftRows.length, rightRows.length) * 5 + 10

  doc.setDrawColor(ngo.primaryColor)
  doc.setLineWidth(0.4)
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 3, 3)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text('DONATION AMOUNT', PAGE_W / 2, y, { align: 'center' })
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(ngo.primaryColor)
  doc.text(`₹${data.amount.toLocaleString('en-IN')}`, PAGE_W / 2, y, { align: 'center' })
  y += 7
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(data.amountInWords, PAGE_W / 2, y, { align: 'center' })
  y += 14

  const payRows: [string, string][] = [
    ['Payment', data.paymentMethod],
    ['Transaction', data.transactionId],
    ['Gateway', data.gateway],
    ['Campaign', data.campaign],
  ]
  payRows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(k, MARGIN, y)
    doc.setTextColor(30)
    y = addWrappedText(doc, v, MARGIN + 28, y, CONTENT_W - 28, 4.5)
    y += 2
  })
  y += 4

  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  const declaration = `This is to certify that the above donation has been received by ${ngo.legalName} through approved banking channels. ${ngo.legalName} is registered under Section 12A and approved under Section 80G of the Income Tax Act, 1961. Subject to applicable provisions, this donation may qualify for tax deduction under Section 80G. No goods or services were provided in consideration of this voluntary contribution.`
  y = addWrappedText(doc, declaration, MARGIN, y, CONTENT_W, 4.2)
  y += 6

  try {
    doc.addImage(data.qrCodeDataUrl, 'PNG', MARGIN, y, 28, 28)
  } catch {
    /* QR optional in PDF */
  }
  doc.setFontSize(8)
  doc.text('Scan to verify this receipt.', MARGIN + 32, y + 6)
  y = addWrappedText(doc, data.verificationUrl, MARGIN + 32, y + 11, CONTENT_W - 32, 4)
  y += 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30)
  doc.text('Authorized Signatory', PAGE_W - MARGIN, y, { align: 'right' })
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(ngo.signatureImage ? 'Digitally Signed' : 'Digitally Generated', PAGE_W - MARGIN, y, { align: 'right' })
  y += 4
  doc.text(ngo.legalName, PAGE_W - MARGIN, y, { align: 'right' })
  y += 10

  doc.setFillColor(5, 150, 105)
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`Thank you for supporting ${ngo.ngoName}.`, MARGIN + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  y = addWrappedText(
    doc,
    'Your contribution helps us create meaningful impact across education, healthcare, and community development.',
    MARGIN + 4,
    y + 12,
    CONTENT_W - 8,
    3.8,
  )

  doc.setFontSize(7)
  doc.setTextColor(100)
  doc.text(
    `${ngo.legalName} · ${ngo.supportEmail} · ${ngo.phone}`,
    PAGE_W / 2,
    285,
    { align: 'center' },
  )
  doc.text(
    'This receipt is electronically generated and does not require a physical signature.',
    PAGE_W / 2,
    290,
    { align: 'center' },
  )

  return doc.output('blob')
}

export function downloadReceipt80GPdfBlob(blob: Blob, receiptNumber: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${receiptNumber}-80G-receipt.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}
