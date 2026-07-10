import type { Receipt80GData } from './types'

export const RECEIPT80G_PRINT_CSS = `
@page { size: A4; margin: 14mm 12mm; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #1e293b;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.receipt { max-width: 210mm; margin: 0 auto; padding: 8mm; }
.header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.logo { height: 52px; width: auto; object-fit: contain; }
.header-center { flex: 1; text-align: center; padding: 0 12px; }
.org-name { font-size: 18px; font-weight: 800; letter-spacing: 0.04em; margin: 0; }
.org-tagline { font-size: 12px; color: #64748b; margin: 4px 0 0; }
.badge-wrap { text-align: right; }
.status-badge {
  display: inline-block;
  background: var(--accent, #059669);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 6px 12px;
  border-radius: 999px;
}
.receipt-type { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600; }
.divider { height: 1px; background: #e2e8f0; margin: 16px 0 20px; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}
.card h3 { margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
.row:last-child { border-bottom: none; }
.row dt { color: #64748b; font-weight: 500; }
.row dd { margin: 0; font-weight: 600; text-align: right; max-width: 55%; }
.amount-section {
  border: 2px solid var(--primary, #041B4D);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}
.amount-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.amount-value { font-size: 36px; font-weight: 800; color: var(--primary, #041B4D); margin: 0; }
.amount-words { font-size: 13px; color: #475569; margin-top: 8px; font-style: italic; }
.donation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-top: 20px; text-align: left; }
.declaration {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  font-size: 11px;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 20px;
  background: #fff;
}
.verify-row { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.qr { width: 120px; height: 120px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #fff; }
.verify-text { font-size: 12px; color: #64748b; }
.verify-link { font-size: 11px; color: var(--primary); word-break: break-all; margin-top: 4px; }
.signatory { text-align: right; margin-bottom: 24px; }
.sign-img { max-height: 48px; margin-bottom: 8px; }
.sign-line { font-size: 12px; font-weight: 600; color: #1e293b; }
.sign-sub { font-size: 11px; color: #64748b; }
.thank-you {
  background: var(--accent, #059669);
  color: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.65;
}
.thank-you strong { display: block; font-size: 15px; margin-bottom: 8px; }
.footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  font-size: 10px;
  color: #64748b;
  line-height: 1.6;
  text-align: center;
}
.footer strong { color: #1e293b; }
.disclaimer { margin-top: 12px; font-size: 9px; color: #94a3b8; font-style: italic; }
@media (max-width: 640px) {
  .cards, .donation-grid { grid-template-columns: 1fr; }
  .header { flex-direction: column; align-items: center; text-align: center; }
  .badge-wrap { text-align: center; }
}
@media print {
  body { background: #fff; }
  .receipt { padding: 0; }
}
`

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function detailRows(rows: [string, string][]): string {
  return rows
    .map(([label, value]) => `<div class="row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join('')
}

export function generateReceipt80GHtml(data: Receipt80GData, options?: { forPrint?: boolean }): string {
  const { ngo } = data
  const logoSrc = ngo.logo.startsWith('http') ? ngo.logo : `${typeof window !== 'undefined' ? window.location.origin : ''}${ngo.logo}`
  const signBlock = ngo.signatureImage
    ? `<img src="${esc(ngo.signatureImage)}" alt="Signature" class="sign-img" />`
    : '<p class="sign-sub" style="margin-bottom:8px">Digitally Generated</p>'

  const declaration = `This is to certify that the above donation has been received by ${esc(ngo.legalName)} through approved banking channels.

${esc(ngo.legalName)} is registered under Section 12A${data.twelveANumber !== '—' ? ` (Reg. No. ${esc(data.twelveANumber)})` : ''} and approved under Section 80G${data.eightyGNumber !== '—' ? ` (Reg. No. ${esc(data.eightyGNumber)})` : ''} of the Income Tax Act, 1961.

Subject to applicable provisions of the Income Tax Act, this donation may qualify for tax deduction under Section 80G.

No goods or services were provided in consideration of this voluntary contribution.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>80G Receipt — ${esc(data.receiptNumber)}</title>
  <style>
    :root { --primary: ${ngo.primaryColor}; --accent: ${ngo.accentColor}; }
    ${RECEIPT80G_PRINT_CSS}
  </style>
</head>
<body>
  <article class="receipt" id="receipt-80g">
    <header class="header">
      <img class="logo" src="${esc(logoSrc)}" alt="${esc(ngo.ngoName)} logo" />
      <div class="header-center">
        <h1 class="org-name">${esc(ngo.ngoName.toUpperCase())}</h1>
        <p class="org-tagline">"${esc(ngo.tagline)}"</p>
      </div>
      <div class="badge-wrap">
        <span class="status-badge">${esc(data.status)}</span>
        <p class="receipt-type">Section 80G Donation Receipt</p>
      </div>
    </header>
    <div class="divider"></div>

    <div class="cards">
      <section class="card">
        <h3>Receipt Details</h3>
        ${detailRows([
          ['Receipt Number', data.receiptNumber],
          ['Date', data.donationDate],
          ['Donation ID', data.donationId],
          ['80G Registration', data.eightyGNumber],
          ['12A Registration', data.twelveANumber],
          ['NGO PAN', data.ngoPan],
          ['Financial Year', data.financialYear],
        ])}
      </section>
      <section class="card">
        <h3>Donor Details</h3>
        ${detailRows([
          ['Full Name', data.donorName],
          ['Email', data.email],
          ['Phone', data.phone],
          ['Address', data.address],
          ['PAN Number', data.pan],
          ['City', data.city],
          ['State', data.state],
          ['Country', data.country],
        ])}
      </section>
    </div>

    <section class="amount-section">
      <p class="amount-label">Donation Amount</p>
      <p class="amount-value">₹${data.amount.toLocaleString('en-IN')}</p>
      <p class="amount-words">${esc(data.amountInWords)}</p>
      <div class="donation-grid">
        ${detailRows([
          ['Mode of Payment', data.paymentMethod],
          ['Transaction ID', data.transactionId],
          ['Payment Gateway', data.gateway],
          ['Donation Campaign', data.campaign],
          ['Donation Purpose', data.purpose],
          ['Donation Date', data.donationDate],
        ])}
      </div>
    </section>

    <section class="declaration">${declaration.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</section>

    <div class="verify-row">
      <img class="qr" src="${data.qrCodeDataUrl}" alt="Verification QR code" />
      <div>
        <p class="verify-text"><strong>Scan to verify this receipt.</strong></p>
        <p class="verify-link">${esc(data.verificationUrl)}</p>
      </div>
    </div>

    <div class="signatory">
      ${signBlock}
      <p class="sign-line">Authorized Signatory</p>
      <p class="sign-sub">${esc(ngo.legalName)}</p>
    </div>

    <div class="thank-you">
      <strong>Thank you for supporting ${esc(ngo.ngoName)}.</strong>
      Your contribution helps us continue creating meaningful impact across education, healthcare, environmental sustainability, and community development.
    </div>

    <footer class="footer">
      <strong>${esc(ngo.legalName)}</strong><br />
      ${esc(ngo.website)} · ${esc(ngo.supportEmail)} · ${esc(ngo.phone)}<br />
      ${esc(ngo.address)}<br />
      PAN: ${esc(data.ngoPan)} · 80G: ${esc(data.eightyGNumber)} · 12A: ${esc(data.twelveANumber)}
      <p class="disclaimer">This receipt is electronically generated and does not require a physical signature.</p>
    </footer>
  </article>
  ${options?.forPrint ? '<script>window.onload = () => { window.print(); }</script>' : ''}
</body>
</html>`
}
