import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchVendors, formatCurrency, getVendorSlug } from '../api'
import { C } from '../constants/brand'
import type { Vendor } from '../types'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'

function VendorCard({ vendor }: { vendor: Vendor }) {
  const slug = getVendorSlug(vendor)
  const image = vendor.thumbnail_image || vendor.banner_image || vendor.vendor_profile_photo
  const progress = vendor.goal_amount ? Math.min(Math.round(((vendor.raised_amount ?? 0) / vendor.goal_amount) * 100), 100) : 0

  return (
    <Link
      to={`/small-vendors/${slug}`}
      style={{ textDecoration: 'none', background: C.white, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, display: 'block' }}
    >
      {image && <img src={image} alt={vendor.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
      <div style={{ padding: 20 }}>
        {vendor.tag_field && (
          <span style={{ fontSize: 10, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' }}>{vendor.tag_field}</span>
        )}
        <h3 style={{ fontWeight: 700, fontSize: 16, color: C.primary, margin: '8px 0', lineHeight: 1.4 }}>{vendor.title}</h3>
        <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 12px' }}>{vendor.vendor_location}</p>
        {vendor.goal_amount ? (
          <div>
            <div style={{ height: 6, background: '#eee', borderRadius: 6, marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: C.gold, borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{formatCurrency(vendor.raised_amount ?? 0)} raised</div>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

export default function SmallVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors().then(setVendors).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero
          label="Small Vendors"
          title="Support Street Vendors, Uplift Communities"
          description="Purchase products from struggling vendors — your support feeds families and brings hope to those in need."
          compact
        />
      </div>
      <PageShell bg={C.grayBg}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginTop: 24 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 300, background: '#ddd', borderRadius: 16 }} />)
            : vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
        </div>
      </PageShell>
    </>
  )
}
