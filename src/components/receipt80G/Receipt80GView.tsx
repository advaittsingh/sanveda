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

export default function Receipt80GView({ data, className = '' }: Props) {
  const { ngo } = data

  return (
    <article
      className={`r80g-receipt ${className}`}
      style={{ '--r80g-primary': ngo.primaryColor, '--r80g-accent': ngo.accentColor } as CSSProperties}
    >
      <header className="r80g-header">
        <img className="r80g-logo" src={ngo.logo} alt={`${ngo.ngoName} logo`} />
        <div className="r80g-header-center">
          <h1 className="r80g-org-name">{ngo.ngoName.toUpperCase()}</h1>
          <p className="r80g-org-tagline">&ldquo;{ngo.tagline}&rdquo;</p>
        </div>
        <div className="r80g-badge-wrap">
          <span className="r80g-status-badge">{data.status}</span>
          <p className="r80g-receipt-type">Section 80G Donation Receipt</p>
        </div>
      </header>
      <div className="r80g-divider" />

      <div className="r80g-cards">
        <section className="r80g-card">
          <h3>Receipt Details</h3>
          <DetailRows rows={[
            ['Receipt Number', data.receiptNumber],
            ['Date', data.donationDate],
            ['Donation ID', data.donationId],
            ['80G Registration', data.eightyGNumber],
            ['12A Registration', data.twelveANumber],
            ['NGO PAN', data.ngoPan],
            ['Financial Year', data.financialYear],
          ]} />
        </section>
        <section className="r80g-card">
          <h3>Donor Details</h3>
          <DetailRows rows={[
            ['Full Name', data.donorName],
            ['Email', data.email],
            ['Phone', data.phone],
            ['Address', data.address],
            ['PAN Number', data.pan],
            ['City', data.city],
            ['State', data.state],
            ['Country', data.country],
          ]} />
        </section>
      </div>

      <section className="r80g-amount-section">
        <p className="r80g-amount-label">Donation Amount</p>
        <p className="r80g-amount-value">₹{data.amount.toLocaleString('en-IN')}</p>
        <p className="r80g-amount-words">{data.amountInWords}</p>
        <div className="r80g-donation-grid">
          <DetailRows rows={[
            ['Mode of Payment', data.paymentMethod],
            ['Transaction ID', data.transactionId],
            ['Payment Gateway', data.gateway],
            ['Donation Campaign', data.campaign],
            ['Donation Purpose', data.purpose],
            ['Donation Date', data.donationDate],
          ]} />
        </div>
      </section>

      <section className="r80g-declaration">
        <p>
          This is to certify that the above donation has been received by {ngo.legalName} through approved banking channels.
        </p>
        <p>
          {ngo.legalName} is registered under Section 12A
          {data.twelveANumber !== '—' ? ` (Reg. No. ${data.twelveANumber})` : ''} and approved under Section 80G
          {data.eightyGNumber !== '—' ? ` (Reg. No. ${data.eightyGNumber})` : ''} of the Income Tax Act, 1961.
        </p>
        <p>
          Subject to applicable provisions of the Income Tax Act, this donation may qualify for tax deduction under Section 80G.
        </p>
        <p>No goods or services were provided in consideration of this voluntary contribution.</p>
      </section>

      <div className="r80g-verify-row">
        <img className="r80g-qr" src={data.qrCodeDataUrl} alt="Verification QR code" />
        <div>
          <p className="r80g-verify-text"><strong>Scan to verify this receipt.</strong></p>
          <p className="r80g-verify-link">{data.verificationUrl}</p>
        </div>
      </div>

      <div className="r80g-signatory">
        {ngo.signatureImage ? (
          <img src={ngo.signatureImage} alt="Authorized signature" className="r80g-sign-img" />
        ) : (
          <p className="r80g-sign-digital">Digitally Generated</p>
        )}
        <p className="r80g-sign-line">Authorized Signatory</p>
        <p className="r80g-sign-sub">{ngo.legalName}</p>
      </div>

      <div className="r80g-thank-you">
        <strong>Thank you for supporting {ngo.ngoName}.</strong>
        Your contribution helps us continue creating meaningful impact across education, healthcare, environmental sustainability, and community development.
      </div>

      <footer className="r80g-footer">
        <strong>{ngo.legalName}</strong>
        <br />
        {ngo.website} · {ngo.supportEmail} · {ngo.phone}
        <br />
        {ngo.address}
        <br />
        PAN: {data.ngoPan} · 80G: {data.eightyGNumber} · 12A: {data.twelveANumber}
        <p className="r80g-disclaimer">This receipt is electronically generated and does not require a physical signature.</p>
      </footer>
    </article>
  )
}
