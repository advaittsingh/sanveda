import type { CSSProperties } from 'react'
import type { Receipt80GData } from '../../lib/receipt80G/types'
import './receipt80G.css'

interface Props {
  data: Receipt80GData
  className?: string
}

function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <>
      {rows.map(([label, value]) => (
        <div key={label} className="r80g-row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="r80g-meta-cell">
      <span className="r80g-meta-label">{label}</span>
      <span className="r80g-meta-value">{value}</span>
    </div>
  )
}

function displayWebsite(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export default function Receipt80GView({ data, className = '' }: Props) {
  const { ngo } = data
  const websiteDisplay = displayWebsite(ngo.website)
  const statusLabel = data.status === 'REISSUED' ? 'REISSUED' : 'PAID'
  const statusIcon = data.status === 'REISSUED' ? '↻' : '✓'
  const cityState = [data.city, data.state].filter((v) => v && v !== '—').join(', ') || '—'

  return (
    <article
      className={`r80g-receipt ${className}`}
      style={{ '--r80g-primary': ngo.primaryColor, '--r80g-accent': ngo.accentColor } as CSSProperties}
    >
      <header className="r80g-header">
        <img className="r80g-logo" src={ngo.logo} alt={`${ngo.ngoName} logo`} />
        <div className="r80g-brand">
          <h1>{ngo.legalName || ngo.ngoName}</h1>
          <p className="r80g-tagline">&ldquo;{ngo.tagline}&rdquo;</p>
        </div>
        <div className="r80g-title-block">
          <h2>DONATION RECEIPT</h2>
          <p className="r80g-subtitle">Section 80G · Income Tax Act, 1961</p>
          <span className="r80g-status-badge">
            {statusIcon} {statusLabel}
          </span>
        </div>
      </header>

      <hr className="r80g-rule" />

      <div className="r80g-meta-bar">
        <MetaCell label="Receipt Number" value={data.receiptNumber} />
        <MetaCell label="Date" value={data.donationDate} />
        <MetaCell label="Financial Year" value={data.financialYear} />
        <MetaCell label="Donation ID" value={data.donationId} />
      </div>

      <div className="r80g-panels">
        <section className="r80g-panel">
          <div className="r80g-panel-head">Donor Details</div>
          <div className="r80g-panel-body">
            <DetailRows
              rows={[
                ['Full Name', data.donorName],
                ['Email', data.email],
                ['Phone', data.phone],
                ['PAN Number', data.pan],
                ['Address', data.address],
                ['City / State', cityState],
                ['Country', data.country],
              ]}
            />
          </div>
        </section>
        <section className="r80g-panel">
          <div className="r80g-panel-head">Organization Registration</div>
          <div className="r80g-panel-body">
            <DetailRows
              rows={[
                ['Registered Name', ngo.legalName],
                ['12A Registration', data.twelveANumber],
                ['80G Registration', data.eightyGNumber],
                ['NGO PAN', data.ngoPan],
                ['Registered Office', ngo.address],
                ['Website', websiteDisplay],
                ['Contact', ngo.phone],
              ]}
            />
          </div>
        </section>
      </div>

      <section className="r80g-amount-box">
        <div>
          <span className="r80g-amount-label">Donation Amount</span>
          <p className="r80g-amount-value">₹{data.amount.toLocaleString('en-IN')}</p>
          <p className="r80g-amount-words">{data.amountInWords}</p>
        </div>
        <div>
          <span className="r80g-amount-label">Donation Campaign</span>
          <p className="r80g-campaign-name">{data.campaign}</p>
        </div>
      </section>

      <div className="r80g-payment-bar">
        <MetaCell label="Mode of Payment" value={data.paymentMethod} />
        <MetaCell label="Payment Gateway" value={data.gateway} />
        <MetaCell label="Transaction ID" value={data.transactionId} />
        <MetaCell label="Donation Date" value={data.donationDate} />
      </div>
      <div className="r80g-purpose-row">
        <span className="r80g-purpose-label">Donation Purpose</span>
        <span className="r80g-purpose-value">{data.purpose}</span>
      </div>

      <section className="r80g-declaration">
        <div className="r80g-declaration-bar" aria-hidden="true" />
        <div>
          <p>
            This is to certify that the above donation has been received by {ngo.legalName} through approved banking
            channels. {ngo.legalName} is registered under Section 12A and approved under Section 80G of the Income Tax
            Act, 1961.
          </p>
          <p>
            Subject to applicable provisions of the Income Tax Act, this donation may qualify for tax deduction under
            Section 80G. No goods or services were provided in consideration of this voluntary contribution.
          </p>
        </div>
      </section>

      <div className="r80g-thank-you">
        <strong>Thank you for supporting {ngo.legalName}.</strong>
        Your contribution helps us continue creating meaningful impact across education, healthcare, environmental
        sustainability, and community development.
      </div>

      <div className="r80g-bottom">
        <div className="r80g-qr-wrap">
          <img className="r80g-qr" src={data.qrCodeDataUrl} alt="Verification QR code" />
          <p className="r80g-qr-text">
            <strong>Scan to verify</strong>
            this receipt is authentic and digitally issued by {ngo.legalName}.
          </p>
        </div>
        <div className="r80g-digital-note">
          <strong>Digitally Generated Receipt</strong>
          This receipt is generated electronically and does not require a signature.
          {ngo.signatureImage ? (
            <div>
              <img src={ngo.signatureImage} alt="Authorized signature" className="r80g-sign-img" />
            </div>
          ) : null}
        </div>
      </div>

      <footer className="r80g-footer">
        {ngo.legalName} · {ngo.address}
        <br />
        {websiteDisplay} · {ngo.supportEmail} · {ngo.phone} · PAN: {data.ngoPan} · 80G: {data.eightyGNumber} · 12A:{' '}
        {data.twelveANumber}
      </footer>
    </article>
  )
}
