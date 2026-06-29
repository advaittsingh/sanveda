import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchVendors, formatCurrency, getVendorSlug } from '../api'
import { C } from '../constants/brand'
import type { Vendor } from '../types'
import PageShell from '../components/ui/PageShell'
import HtmlContent from '../components/ui/HtmlContent'

export default function VendorDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [vendor, setVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    fetchVendors().then((list) => {
      const found = list.find((v) => getVendorSlug(v) === slug)
      setVendor(found ?? null)
    })
  }, [slug])

  if (!vendor) {
    return (
      <PageShell>
        <p>Vendor not found.</p>
        <Link to="/small-vendors" style={{ color: C.secondary }}>← Back</Link>
      </PageShell>
    )
  }

  const image = vendor.banner_image || vendor.thumbnail_image
  const progress = vendor.goal_amount ? Math.min(Math.round(((vendor.raised_amount ?? 0) / vendor.goal_amount) * 100), 100) : 0

  return (
    <PageShell bg={C.grayBg}>
      <Link to="/small-vendors" style={{ color: C.secondary, textDecoration: 'none', fontWeight: 600 }}>← All vendors</Link>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginTop: 24 }}>
        <div>
          {image && <img src={image} alt={vendor.title} style={{ width: '100%', borderRadius: 20, maxHeight: 400, objectFit: 'cover' }} />}
          <div style={{ background: C.white, borderRadius: 16, padding: 24, marginTop: 20, border: `1px solid ${C.border}` }}>
            <h1 style={{ fontWeight: 800, fontSize: 26, color: C.primary, margin: '0 0 8px' }}>{vendor.title}</h1>
            <p style={{ color: C.textMuted, margin: '0 0 16px' }}>{vendor.vendor_name} · {vendor.vendor_location}</p>
            <HtmlContent html={vendor.main_description ?? ''} />
          </div>
        </div>
        <div>
          <div style={{ background: C.white, borderRadius: 16, padding: 24, border: `2px solid ${C.gold}`, position: 'sticky', top: 24 }}>
            {vendor.trust_verified ? (
              <div style={{ background: C.cream, padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
                <strong style={{ color: C.primary }}>{vendor.trust_name}</strong>
                <p style={{ margin: '8px 0 0', color: C.textMuted }}>{vendor.trust_description}</p>
              </div>
            ) : null}
            {vendor.goal_amount ? (
              <>
                <div style={{ height: 8, background: '#eee', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: C.secondary, borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: C.gold }}>{formatCurrency(vendor.raised_amount ?? 0)}</span>
                  <span style={{ color: C.textMuted }}>Goal {formatCurrency(vendor.goal_amount)}</span>
                </div>
              </>
            ) : null}
            {vendor.where_products_go_title && (
              <p style={{ fontWeight: 700, fontSize: 14, color: C.primary, marginBottom: 8 }}>{vendor.where_products_go_title}</p>
            )}
            {vendor.where_products_go_description && (
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>{vendor.where_products_go_description}</p>
            )}
            <button type="button" className="btn-donate" style={{ width: '100%', padding: 14, border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Red Hat Display' }}>
              Buy Now = Donate Now
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
