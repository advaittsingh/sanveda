import QRCode from 'qrcode'

/** Document palette — aligned with the official donation receipt family. */
export const DOC_NAVY = '#1B2A4A'
export const DOC_NAVY_BRAND = '#041B4D'
export const DOC_TEAL = '#1F8A5F'
export const DOC_TEAL_ALT = '#059669'
export const DOC_PALE_GRAY = '#F4F6F8'
export const DOC_PALE_MINT = '#EAF7F0'
export const DOC_NEAR_BLACK = '#1A1A1A'
export const DOC_MEDIUM_GRAY = '#6B7280'

export function escapeHtml(value: unknown): string {
  const text = value == null ? '—' : String(value)
  const safe = !text || text === 'undefined' || text === 'null' ? '—' : text
  return safe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** health_camps → Health Camps; social-media → Social Media */
export function humanizeLabel(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function buildVerifyUrl(code: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://sanveda.vercel.app'
  return `${origin}/verify/${encodeURIComponent(code)}`
}

export async function makeQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 160,
    color: { dark: DOC_NAVY_BRAND, light: '#FFFFFF' },
  })
}

export function wrapDocumentHtml(options: { title: string; css: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <style>${options.css}</style>
</head>
<body>
${options.body}
</body>
</html>`
}

export function renderHeaderBand(options: {
  logoUrl?: string
  orgName: string
  tagline: string
  documentTitle: string
  subtitle: string
  statusPill: string
}): string {
  const logo = options.logoUrl
    ? `<img class="doc-logo" src="${escapeHtml(options.logoUrl)}" alt="${escapeHtml(options.orgName)} logo" />`
    : ''
  return `<header class="doc-header" data-component="HeaderBand">
  ${logo}
  <div class="doc-brand">
    <h1>${escapeHtml(options.orgName)}</h1>
    <p class="doc-tagline">“${escapeHtml(options.tagline)}”</p>
  </div>
  <div class="doc-title-block">
    <h2>${escapeHtml(options.documentTitle)}</h2>
    <p class="doc-subtitle">${escapeHtml(options.subtitle)}</p>
    <span class="doc-status-pill">${escapeHtml(options.statusPill)}</span>
  </div>
</header>
<hr class="doc-rule" />`
}

export function renderMetaStrip(columns: Array<{ label: string; value: string }>): string {
  const cells = columns
    .map(
      (col) =>
        `<div class="doc-meta-cell"><span class="doc-meta-label">${escapeHtml(col.label)}</span><span class="doc-meta-value">${escapeHtml(col.value)}</span></div>`,
    )
    .join('')
  return `<div class="doc-meta-strip" data-component="MetaStrip" style="--doc-meta-cols:${columns.length || 1}">${cells}</div>`
}

export function renderDetailCard(options: {
  title: string
  rows: Array<{ label: string; value: string }>
}): string {
  const rows = options.rows
    .map(
      (row) =>
        `<div class="doc-row"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`,
    )
    .join('')
  return `<section class="doc-panel" data-component="DetailCard">
  <div class="doc-panel-head">${escapeHtml(options.title)}</div>
  <div class="doc-panel-body">${rows}</div>
</section>`
}

export function renderHeroBox(options: {
  label: string
  headline: string
  caption?: string
  secondaryLabel?: string
  secondaryValue?: string
}): string {
  const secondary =
    options.secondaryLabel || options.secondaryValue
      ? `<div>
  <span class="doc-hero-label">${escapeHtml(options.secondaryLabel ?? '')}</span>
  <p class="doc-hero-secondary">${escapeHtml(options.secondaryValue ?? '—')}</p>
</div>`
      : ''
  return `<section class="doc-hero" data-component="HeroBox">
  <div>
    <span class="doc-hero-label">${escapeHtml(options.label)}</span>
    <p class="doc-hero-headline">${escapeHtml(options.headline)}</p>
    ${options.caption ? `<p class="doc-hero-caption">${escapeHtml(options.caption)}</p>` : ''}
  </div>
  ${secondary}
</section>`
}

export function renderComplianceNote(paragraphs: string[]): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
  return `<section class="doc-compliance" data-component="ComplianceNote">
  <div class="doc-compliance-bar" aria-hidden="true"></div>
  <div>${body}</div>
</section>`
}

export function renderClosingBanner(options: { headline: string; body: string }): string {
  return `<div class="doc-closing" data-component="ClosingBanner">
  <strong>${escapeHtml(options.headline)}</strong>
  ${escapeHtml(options.body)}
</div>`
}

export function renderDocumentFooter(options: {
  qrDataUrl?: string
  verifyText: string
  documentTypeLabel: string
  legalLine: string
}): string {
  const qr = options.qrDataUrl
    ? `<img class="doc-qr" src="${escapeHtml(options.qrDataUrl)}" alt="Verification QR code" />`
    : ''
  return `<div class="doc-bottom" data-component="DocumentFooter">
  <div class="doc-qr-wrap">
    ${qr}
    <p class="doc-qr-text">
      <strong>Scan to verify</strong>
      ${escapeHtml(options.verifyText)}
    </p>
  </div>
  <div class="doc-digital-note">
    <strong>Digitally Generated ${escapeHtml(options.documentTypeLabel)}</strong>
    This document is generated electronically and does not require a signature.
  </div>
</div>
<footer class="doc-footer">${escapeHtml(options.legalLine)}</footer>`
}

export const DOCUMENT_DESIGN_CSS = `
@page { size: A4; margin: 10mm 10mm; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: ${DOC_NEAR_BLACK};
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.doc-page {
  max-width: 210mm;
  margin: 0 auto;
  padding: 6mm 7mm;
  color: ${DOC_NEAR_BLACK};
}
.doc-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: start;
  margin-bottom: 10px;
}
.doc-logo {
  height: 56px;
  width: 56px;
  object-fit: contain;
  border-radius: 50%;
}
.doc-brand h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: ${DOC_NAVY_BRAND};
  text-transform: uppercase;
}
.doc-tagline {
  margin: 4px 0 0;
  font-size: 11px;
  font-style: italic;
  color: ${DOC_MEDIUM_GRAY};
}
.doc-title-block { text-align: right; }
.doc-title-block h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${DOC_NAVY};
}
.doc-subtitle {
  margin: 4px 0 8px;
  font-size: 10px;
  color: ${DOC_MEDIUM_GRAY};
  font-weight: 600;
}
.doc-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${DOC_TEAL_ALT};
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 5px 12px;
  border-radius: 999px;
}
.doc-rule {
  height: 2px;
  background: ${DOC_NAVY};
  margin: 10px 0 12px;
  border: 0;
}
.doc-meta-strip {
  display: grid;
  grid-template-columns: repeat(var(--doc-meta-cols, 4), 1fr);
  gap: 0;
  background: ${DOC_PALE_GRAY};
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}
.doc-meta-cell {
  padding: 10px 12px;
  border-right: 1px solid #e2e8f0;
  min-width: 0;
}
.doc-meta-cell:last-child { border-right: 0; }
.doc-meta-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${DOC_MEDIUM_GRAY};
  margin-bottom: 4px;
}
.doc-meta-value {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: ${DOC_NAVY};
  word-break: break-word;
  line-height: 1.35;
}
.doc-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.doc-panel {
  border: 1px solid #dbe3f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.doc-panel-head {
  background: ${DOC_NAVY};
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 12px;
}
.doc-panel-body { padding: 4px 12px 8px; }
.doc-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px dotted #cbd5e1;
  font-size: 11px;
}
.doc-row:last-child { border-bottom: none; }
.doc-row dt {
  margin: 0;
  color: ${DOC_MEDIUM_GRAY};
  font-weight: 500;
  flex-shrink: 0;
}
.doc-row dd {
  margin: 0;
  font-weight: 700;
  color: ${DOC_NEAR_BLACK};
  text-align: right;
  max-width: 62%;
  word-break: break-word;
}
.doc-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border: 1.5px solid ${DOC_TEAL};
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 12px;
  background: ${DOC_PALE_MINT};
}
.doc-hero-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${DOC_MEDIUM_GRAY};
  margin-bottom: 6px;
}
.doc-hero-headline {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${DOC_TEAL};
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.doc-hero-caption {
  margin: 6px 0 0;
  font-size: 12px;
  font-style: italic;
  color: ${DOC_MEDIUM_GRAY};
}
.doc-hero-secondary {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${DOC_NAVY};
  line-height: 1.35;
}
.doc-compliance {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 10.5px;
  line-height: 1.65;
  color: ${DOC_MEDIUM_GRAY};
  background: ${DOC_PALE_MINT};
  border-radius: 8px;
  padding: 12px;
}
.doc-compliance-bar {
  width: 4px;
  flex-shrink: 0;
  border-radius: 4px;
  background: ${DOC_TEAL_ALT};
}
.doc-compliance p { margin: 0 0 8px; }
.doc-compliance p:last-child { margin-bottom: 0; }
.doc-closing {
  background: ${DOC_TEAL};
  color: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  font-size: 12px;
  line-height: 1.55;
}
.doc-closing strong {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}
.doc-letter-body {
  font-size: 12px;
  line-height: 1.75;
  color: ${DOC_NEAR_BLACK};
  margin: 0 0 14px;
}
.doc-letter-body p { margin: 0 0 12px; }
.doc-signatory {
  margin: 0 0 16px;
  font-size: 12px;
  line-height: 1.55;
  color: ${DOC_NEAR_BLACK};
}
.doc-signatory strong { color: ${DOC_NAVY}; }
.doc-bottom {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: center;
  margin-bottom: 14px;
}
.doc-qr-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.doc-qr {
  width: 88px;
  height: 88px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px;
  background: #fff;
}
.doc-qr-text {
  font-size: 10px;
  color: ${DOC_MEDIUM_GRAY};
  line-height: 1.45;
  max-width: 160px;
  margin: 0;
}
.doc-qr-text strong {
  display: block;
  color: ${DOC_NAVY};
  font-size: 11px;
  margin-bottom: 2px;
}
.doc-digital-note {
  text-align: right;
  font-size: 11px;
  color: ${DOC_MEDIUM_GRAY};
  line-height: 1.5;
}
.doc-digital-note strong {
  display: block;
  color: ${DOC_NAVY};
  font-size: 12px;
  margin-bottom: 4px;
}
.doc-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  font-size: 9px;
  color: ${DOC_MEDIUM_GRAY};
  line-height: 1.55;
  text-align: center;
}
@media (max-width: 640px) {
  .doc-header, .doc-panels, .doc-hero, .doc-meta-strip, .doc-bottom {
    grid-template-columns: 1fr;
  }
  .doc-title-block { text-align: left; }
  .doc-meta-cell { border-right: 0; border-bottom: 1px solid #e2e8f0; }
  .doc-digital-note { text-align: left; }
}
@media print {
  body { background: #fff; }
  .doc-page { padding: 0; }
}
`

export const DOCUMENT_CARD_CSS = `
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 24px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: ${DOC_PALE_GRAY};
  color: ${DOC_NEAR_BLACK};
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.doc-card {
  width: 340px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #dbe3f0;
  background: #fff;
  box-shadow: 0 8px 28px rgba(27, 42, 74, 0.12);
}
.doc-card-header {
  background: ${DOC_NAVY};
  color: #fff;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.doc-card-header h1 {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  font-weight: 800;
  text-transform: uppercase;
}
.doc-card-header p {
  margin: 4px 0 0;
  font-size: 11px;
  opacity: 0.9;
}
.doc-card-pill {
  display: inline-flex;
  align-items: center;
  background: ${DOC_TEAL_ALT};
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.doc-card-body { padding: 18px; }
.doc-card-photo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${DOC_PALE_MINT};
  border: 2px solid ${DOC_TEAL};
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: ${DOC_TEAL};
  font-size: 28px;
  font-weight: 800;
}
.doc-card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.doc-card-name {
  margin: 0 0 4px;
  text-align: center;
  font-size: 17px;
  font-weight: 800;
  color: ${DOC_NAVY};
}
.doc-card-role {
  margin: 0 0 14px;
  text-align: center;
  font-size: 12px;
  color: ${DOC_MEDIUM_GRAY};
  font-weight: 600;
}
.doc-card-hero {
  background: ${DOC_PALE_MINT};
  border: 1px solid ${DOC_TEAL};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  text-align: center;
}
.doc-card-hero .label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${DOC_MEDIUM_GRAY};
  margin-bottom: 4px;
}
.doc-card-hero .value {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: ${DOC_TEAL};
}
.doc-card-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  padding: 7px 0;
  border-bottom: 1px dotted #cbd5e1;
}
.doc-card-row:last-of-type { border-bottom: none; }
.doc-card-row span:first-child { color: ${DOC_MEDIUM_GRAY}; }
.doc-card-row span:last-child {
  font-weight: 700;
  color: ${DOC_NAVY};
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
.doc-card-qr {
  display: block;
  width: 72px;
  height: 72px;
  margin: 14px auto 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px;
  background: #fff;
}
.doc-card-footer {
  background: ${DOC_NAVY};
  color: #fff;
  padding: 10px 14px;
  text-align: center;
  font-size: 9px;
  line-height: 1.45;
}
@media print {
  body { background: #fff; padding: 0; }
  .doc-card { box-shadow: none; }
}
`
