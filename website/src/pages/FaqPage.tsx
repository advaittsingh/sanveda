import { useMemo, useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import FaqAccordion from '../components/faq/FaqAccordion'
import FaqTabs from '../components/faq/FaqTabs'
import SubPageBanner from '../components/ui/SubPageBanner'
import { ASSETS } from '../constants/assets'
import { FAQ_PAGE, SANVEDA_FAQS, type FaqTabKey } from '../constants/faqContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function FaqPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 899px)')
  const compact = useMediaQuery('(max-width: 1300px)')
  const [activeTab, setActiveTab] = useState<FaqTabKey>('donors')

  const activeItems = useMemo(() => SANVEDA_FAQS[activeTab], [activeTab])

  return (
    <div className="faq-page" data-mobile={mobile}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'FAQ', path: null }]} />

      <div className="page-banner-wrap" data-mobile={mobile}>
        <SubPageBanner title={FAQ_PAGE.bannerTitle} subtitle={FAQ_PAGE.description} />
      </div>

      <div className="faq-shell" data-mobile={mobile} data-tablet={tablet} data-compact={compact}>
        {!tablet && (
          <aside className="faq-sidebar" data-compact={compact}>
            <div>
              <p className="faq-eyebrow" data-compact={compact}>
                {FAQ_PAGE.eyebrow}
              </p>
              <h2 className="faq-title" data-compact={compact}>
                {FAQ_PAGE.title}{' '}
                <span className="faq-title-accent">{FAQ_PAGE.titleAccent}</span>
              </h2>
              <p className="faq-description" data-compact={compact}>
                {FAQ_PAGE.sidebarDescription}
              </p>
            </div>
            <img src={ASSETS.ourImpact} alt="Sanveda humanitarian impact" className="faq-illustration" />
          </aside>
        )}

        <div className="faq-main">
          {tablet && (
            <div className="faq-mobile-intro">
              <p className="faq-eyebrow" data-compact={compact}>
                {FAQ_PAGE.eyebrow}
              </p>
              <h2 className="faq-title" data-compact={compact} data-mobile={mobile}>
                {FAQ_PAGE.title}{' '}
                <span className="faq-title-accent">{FAQ_PAGE.titleAccent}</span>
              </h2>
              <p className="faq-description" data-compact={compact} data-mobile={mobile}>
                {FAQ_PAGE.sidebarDescription}
              </p>
            </div>
          )}

          <FaqTabs active={activeTab} onChange={setActiveTab} />
          <FaqAccordion items={activeItems} />
        </div>
      </div>
    </div>
  )
}
