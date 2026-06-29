import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchCMS, fetchMonthlyDonations } from '../api'
import type { CMSItem, MonthlyDonation } from '../types'
import MonthlyHeroSection from '../components/monthly/MonthlyHeroSection'
import MonthlyStepsSection from '../components/monthly/MonthlyStepsSection'
import MonthlyProgramsSection from '../components/monthly/MonthlyProgramsSection'
import WhyChooseUsSection from '../components/monthly/WhyChooseUsSection'

export default function MonthlyDonationPage() {
  const [searchParams] = useSearchParams()
  const [cms, setCms] = useState<CMSItem[]>([])
  const [programs, setPrograms] = useState<MonthlyDonation[]>([])
  const [loading, setLoading] = useState(true)

  const initialCauseId = searchParams.get('id') ?? undefined

  useEffect(() => {
    let active = true
    Promise.all([fetchCMS(), fetchMonthlyDonations()])
      .then(([cmsData, programData]) => {
        if (!active) return
        setCms(cmsData)
        setPrograms(programData)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div style={{ paddingTop: 24 }}>
      <MonthlyHeroSection cms={cms} programs={programs} initialCauseId={initialCauseId} />
      <div style={{ marginBottom: 60 }}>
        <MonthlyStepsSection cms={cms} />
      </div>
      <MonthlyProgramsSection cms={cms} programs={programs} loading={loading} />
      <WhyChooseUsSection cms={cms} />
    </div>
  )
}
