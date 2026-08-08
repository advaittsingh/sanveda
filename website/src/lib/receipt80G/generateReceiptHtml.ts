import type { Receipt80GData } from './types'

export const RECEIPT80G_PRINT_CSS = `
@page { size: A4; margin: 10mm 10mm; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.receipt {
  max-width: 210mm;
  margin: 0 auto;
  padding: 6mm 7mm;
  color: #0f172a;
}
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: start;
  margin-bottom: 10px;
}
.logo {
  height: 56px;
  width: 56px;
  object-fit: contain;
  border-radius: 50%;
}
.brand h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: #041B4D;
  text-transform: uppercase;
}
.brand .tagline {
  margin: 4px 0 0;
  font-size: 11px;
  font-style: italic;
  color: #64748b;
}
.title-block { text-align: right; }
.title-block h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #041B4D;
}
.title-block .subtitle {
  margin: 4px 0 8px;
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #059669;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 5px 12px;
  border-radius: 999px;
}
.rule {
  height: 2px;
  background: #041B4D;
  margin: 10px 0 12px;
  border: 0;
}
.meta-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}
.meta-cell {
  padding: 10px 12px;
  border-right: 1px solid #e2e8f0;
  min-width: 0;
}
.meta-cell:last-child { border-right: 0; }
.meta-cell .label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
}
.meta-cell .value {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #041B4D;
  word-break: break-word;
  line-height: 1.35;
}
.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.panel {
  border: 1px solid #dbe3f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.panel-head {
  background: #041B4D;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 12px;
}
.panel-body { padding: 4px 12px 8px; }
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px dotted #cbd5e1;
  font-size: 11px;
}
.row:last-child { border-bottom: none; }
.row dt {
  margin: 0;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
}
.row dd {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
  text-align: right;
  max-width: 62%;
  word-break: break-word;
}
.amount-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border: 1.5px solid #c7d2e5;
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 12px;
  background: #f8fafc;
}
.amount-box .label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 6px;
}
.amount-value {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  color: #059669;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.amount-words {
  margin: 6px 0 0;
  font-size: 12px;
  font-style: italic;
  color: #475569;
}
.campaign-name {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #041B4D;
  line-height: 1.35;
}
.payment-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  background: #fff;
}
.purpose-row {
  border: 1px solid #e2e8f0;
  border-top: 0;
  border-radius: 0 0 8px 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: #fff;
}
.purpose-row .label {
  display: inline;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin-right: 8px;
}
.purpose-row .value {
  font-size: 12px;
  font-weight: 700;
  color: #041B4D;
}
.declaration {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 10.5px;
  line-height: 1.65;
  color: #475569;
}
.declaration-bar {
  width: 4px;
  flex-shrink: 0;
  border-radius: 4px;
  background: #059669;
}
.declaration p { margin: 0 0 8px; }
.declaration p:last-child { margin-bottom: 0; }
.thank-you {
  background: #059669;
  color: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  font-size: 12px;
  line-height: 1.55;
}
.thank-you strong {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}
.bottom {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: center;
  margin-bottom: 14px;
}
.qr-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.qr {
  width: 88px;
  height: 88px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  background: #fff;
}
.qr-text {
  font-size: 10px;
  color: #64748b;
  line-height: 1.45;
  max-width: 160px;
  margin: 0;
}
.qr-text strong {
  display: block;
  color: #041B4D;
  font-size: 11px;
  margin-bottom: 2px;
}
.digital-note {
  text-align: right;
  font-size: 11px;
  color: #475569;
  line-height: 1.5;
}
.digital-note strong {
  display: block;
  color: #041B4D;
  font-size: 12px;
  margin-bottom: 4px;
}
.footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  font-size: 9px;
  color: #64748b;
  line-height: 1.55;
  text-align: center;
}
@media (max-width: 640px) {
  .header, .panels, .amount-box, .meta-bar, .payment-bar, .bottom {
    grid-template-columns: 1fr;
  }
  .title-block { text-align: left; }
  .meta-cell, .payment-bar .meta-cell { border-right: 0; border-bottom: 1px solid #e2e8f0; }
  .digital-note { text-align: left; }
}
@media print {
  body { background: #fff; }
  .receipt { padding: 0; }
}
`

function esc(s: string | null | undefined): string {
  const text = s == null ? '—' : String(s)
  const safe = !text || text === 'undefined' || text === 'null' ? '—' : text
  return safe
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

function displayWebsite(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function metaCell(label: string, value: string): string {
  return `<div class="meta-cell"><span class="label">${esc(label)}</span><span class="value">${esc(value)}</span></div>`
}

export function generateReceipt80GHtml(data: Receipt80GData, options?: { forPrint?: boolean }): string {
  const { ngo } = data
  const logoSrc = ngo.logo.startsWith('http')
    ? ngo.logo
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${ngo.logo}`
  const websiteDisplay = displayWebsite(ngo.website)
  const statusLabel = data.status === 'REISSUED' ? 'REISSUED' : 'PAID'
  const statusIcon = data.status === 'REISSUED' ? '↻' : '✓'

  const declarationParas = [
    `This is to certify that the above donation has been received by ${esc(ngo.legalName)} through approved banking channels. ${esc(ngo.legalName)} is registered under Section 12A and approved under Section 80G of the Income Tax Act, 1961.`,
    `Subject to applicable provisions of the Income Tax Act, this donation may qualify for tax deduction under Section 80G. No goods or services were provided in consideration of this voluntary contribution.`,
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Donation Receipt — ${esc(data.receiptNumber)}</title>
  <style>${RECEIPT80G_PRINT_CSS}</style>
</head>
<body>
  <article class="receipt" id="receipt-80g">
    <header class="header">
      <img class="logo" src="${esc(logoSrc)}" alt="${esc(ngo.ngoName)} logo" />
      <div class="brand">
        <h1>${esc(ngo.legalName || ngo.ngoName)}</h1>
        <p class="tagline">“${esc(ngo.tagline)}”</p>
      </div>
      <div class="title-block">
        <h2>DONATION RECEIPT</h2>
        <p class="subtitle">Section 80G · Income Tax Act, 1961</p>
        <span class="status-badge">${statusIcon} ${esc(statusLabel)}</span>
      </div>
    </header>

    <hr class="rule" />

    <div class="meta-bar">
      ${metaCell('Receipt Number', data.receiptNumber)}
      ${metaCell('Date', data.donationDate)}
      ${metaCell('Financial Year', data.financialYear)}
      ${metaCell('Donation ID', data.donationId)}
    </div>

    <div class="panels">
      <section class="panel">
        <div class="panel-head">Donor Details</div>
        <div class="panel-body">
          ${detailRows([
            ['Full Name', data.donorName],
            ['Email', data.email],
            ['Phone', data.phone],
            ['PAN Number', data.pan],
            ['Address', data.address],
            ['City / State', [data.city, data.state].filter((v) => v && v !== '—').join(', ') || '—'],
            ['Country', data.country],
          ])}
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">Organization Registration</div>
        <div class="panel-body">
          ${detailRows([
            ['Registered Name', ngo.legalName],
            ['12A Registration', data.twelveANumber],
            ['80G Registration', data.eightyGNumber],
            ['NGO PAN', data.ngoPan],
            ['Registered Office', ngo.address],
            ['Website', websiteDisplay],
            ['Contact', ngo.phone],
          ])}
        </div>
      </section>
    </div>

    <section class="amount-box">
      <div>
        <span class="label">Donation Amount</span>
        <p class="amount-value">₹${data.amount.toLocaleString('en-IN')}</p>
        <p class="amount-words">${esc(data.amountInWords)}</p>
      </div>
      <div>
        <span class="label">Donation Campaign</span>
        <p class="campaign-name">${esc(data.campaign)}</p>
      </div>
    </section>

    <div class="payment-bar">
      ${metaCell('Mode of Payment', data.paymentMethod)}
      ${metaCell('Payment Gateway', data.gateway)}
      ${metaCell('Transaction ID', data.transactionId)}
      ${metaCell('Donation Date', data.donationDate)}
    </div>
    <div class="purpose-row">
      <span class="label">Donation Purpose</span>
      <span class="value">${esc(data.purpose)}</span>
    </div>

    <section class="declaration">
      <div class="declaration-bar" aria-hidden="true"></div>
      <div>
        ${declarationParas.map((p) => `<p>${p}</p>`).join('')}
      </div>
    </section>

    <div class="thank-you">
      <strong>Thank you for supporting ${esc(ngo.legalName)}.</strong>
      Your contribution helps us continue creating meaningful impact across education, healthcare, environmental sustainability, and community development.
    </div>

    <div class="bottom">
      <div class="qr-wrap">
        <img class="qr" src="${data.qrCodeDataUrl}" alt="Verification QR code" />
        <p class="qr-text">
          <strong>Scan to verify</strong>
          this receipt is authentic and digitally issued by ${esc(ngo.legalName)}.
        </p>
      </div>
      <div class="digital-note">
        <strong>Digitally Generated Receipt</strong>
        This receipt is generated electronically and does not require a signature.
        ${ngo.signatureImage ? `<div style="margin-top:8px"><img src="${esc(ngo.signatureImage)}" alt="Authorized signature" style="max-height:40px" /></div>` : ''}
      </div>
    </div>

    <footer class="footer">
      ${esc(ngo.legalName)} · ${esc(ngo.address)}<br />
      ${esc(websiteDisplay)} · ${esc(ngo.supportEmail)} · ${esc(ngo.phone)} · PAN: ${esc(data.ngoPan)} · 80G: ${esc(data.eightyGNumber)} · 12A: ${esc(data.twelveANumber)}
    </footer>
  </article>
  ${options?.forPrint ? '<script>window.onload = () => { window.print(); }</script>' : ''}
</body>
</html>`
}
