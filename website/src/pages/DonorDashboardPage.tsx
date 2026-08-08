import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import DonorProfileCard from '../components/donor/DonorProfileCard'
import DonorStatsRow from '../components/donor/DonorStatsRow'
import DonorImpactSection from '../components/donor/DonorImpactSection'
import DonorHistoryTable from '../components/donor/DonorHistoryTable'
import MonthlyGivingWidget from '../components/donor/MonthlyGivingWidget'
import TaxReceiptCenter from '../components/donor/TaxReceiptCenter'
import SavedCampaignsWidget from '../components/donor/SavedCampaignsWidget'
import DonorNotifications from '../components/donor/DonorNotifications'
import DonorImpactTimeline from '../components/donor/DonorImpactTimeline'
import DonorProfileSettings from '../components/donor/DonorProfileSettings'
import { useAuth } from '../context/AuthContext'
import { C } from '../constants/brand'
import { getDonorPortalData, type DonorPortalData } from '../lib/donorPortalService'
import { useMediaQuery } from '../hooks/useMediaQuery'

type Tab = 'overview' | 'profile'

export default function DonorDashboardPage() {
  const mobile = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const [data, setData] = useState<DonorPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get('tab') === 'profile' ? 'profile' : 'overview',
  )

  useEffect(() => {
    if (searchParams.get('tab') === 'profile') setTab('profile')
  }, [searchParams])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setData(await getDonorPortalData(user, profile))
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login?redirect=/dashboard')
      return
    }
    load()
  }, [user, authLoading, navigate, load])

  useEffect(() => {
    if (!user) return
    const onSavedChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId && detail.userId !== user.id) return
      void load()
    }
    window.addEventListener('sanveda:saved-campaigns-changed', onSavedChange)
    return () => window.removeEventListener('sanveda:saved-campaigns-changed', onSavedChange)
  }, [user, load])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading || loading || !data || !user) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: C.textMuted }}>
        Loading your dashboard…
      </div>
    )
  }

  return (
    <div style={{ background: C.grayBg, paddingBottom: mobile ? 40 : 80, minHeight: '60vh' }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Dashboard', path: null }]} />

      <div style={{ width: '94.44%', maxWidth: 1100, margin: '0 auto', padding: mobile ? '20px 16px' : '32px 0', display: 'grid', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: mobile ? 26 : 34, fontWeight: 800, color: C.primary, margin: '0 0 4px' }}>
            Donor Dashboard
          </h1>
          <p style={{ color: C.textMuted, margin: 0, fontSize: 14 }}>Your giving, impact, and tax compliance in one place</p>
        </div>

        <DonorProfileCard profile={data.profile} onSignOut={handleSignOut} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['overview', 'profile'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                border: tab === t ? 'none' : `1px solid ${C.border}`,
                background: tab === t ? C.primary : C.white,
                color: tab === t ? C.white : C.primary,
                borderRadius: 999,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t === 'overview' ? 'Overview' : 'Profile Settings'}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <>
            <DonorStatsRow kpis={data.kpis} mobile={mobile} />

            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <DonorImpactSection impact={data.impact} />
              <MonthlyGivingWidget monthlyGiving={data.monthlyGiving} />
            </div>

            <DonorHistoryTable donations={data.donations} mobile={mobile} />

            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <TaxReceiptCenter receipts={data.taxReceipts} allReceipts={data.allTaxReceipts} />
              <SavedCampaignsWidget savedCampaigns={data.savedCampaigns} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <DonorNotifications notifications={data.notifications} />
              <DonorImpactTimeline timeline={data.timeline} />
            </div>
          </>
        ) : (
          <DonorProfileSettings
            userId={user.id}
            name={data.profile.name}
            phone={data.profile.phone}
            preferences={data.preferences}
            onSaved={async () => {
              await refreshProfile()
              await load()
            }}
          />
        )}
      </div>
    </div>
  )
}
