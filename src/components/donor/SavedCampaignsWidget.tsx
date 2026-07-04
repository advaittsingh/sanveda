import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { C } from '../../constants/brand'
import type { SavedCampaign } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  savedCampaigns: SavedCampaign[]
}

export default function SavedCampaignsWidget({ savedCampaigns }: Props) {
  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Saved Campaigns</h2>

      {!savedCampaigns.length ? (
        <div>
          <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>
            Save campaigns while browsing to donate later.
          </p>
          <Link to="/campaigns" style={{ color: C.secondary, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Browse campaigns →
          </Link>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {savedCampaigns.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/campaigns/${c.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: C.primary,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <Bookmark size={16} color={C.secondary} />
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
