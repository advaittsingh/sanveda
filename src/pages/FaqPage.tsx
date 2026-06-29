import { useEffect, useState } from 'react'
import { fetchCMS, getCMSSection } from '../api'
import type { CMSItem } from '../types'
import { C } from '../constants/brand'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import FaqList from '../components/ui/FaqList'

export default function FaqPage() {
  const [faqs, setFaqs] = useState<CMSItem[]>([])
  const [title, setTitle] = useState('Frequently Asked Questions')

  useEffect(() => {
    fetchCMS().then((cms) => {
      const general = getCMSSection(cms, 'campaign faq')
      const life = getCMSSection(cms, 'Life donation faq')
      if (general?.title) setTitle(general.title)
      const items = [
        ...(general?.relatedCMS ?? []),
        ...(life?.relatedCMS ?? []),
      ].filter((s) => s.status === 1 || s.status === true)
      setFaqs(items)
    }).catch(() => {})
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero label="FAQ" title={title} description="Find answers to common questions about donating, campaigns, and monthly giving." compact />
      </div>
      <PageShell bg={C.white}>
        <div style={{ maxWidth: 800, margin: '32px auto 0' }}>
          <FaqList items={faqs} />
        </div>
      </PageShell>
    </>
  )
}
