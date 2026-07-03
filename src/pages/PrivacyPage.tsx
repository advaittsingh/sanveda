import { useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import PolicyTableOfContents from '../components/policy/PolicyTableOfContents'
import SubPageBanner from '../components/ui/SubPageBanner'
import {
  PRIVACY_INTRO_HTML,
  PRIVACY_PAGE,
  PRIVACY_SECTIONS,
} from '../constants/privacyContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function PrivacyPage() {
  const heroMobile = useMediaQuery('(max-width: 600px)')
  const mobile = useMediaQuery('(max-width: 899px)')
  const [tocOpen, setTocOpen] = useState(false)

  const closeToc = () => setTocOpen(false)

  return (
    <div className="policy-doc-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: PRIVACY_PAGE.breadcrumb, path: null }]}
      />

      <div className="page-banner-wrap" data-mobile={heroMobile}>
        <SubPageBanner title={PRIVACY_PAGE.title} subtitle={PRIVACY_PAGE.description} />
      </div>

      <div className="policy-doc-shell">
        {mobile && (
          <button type="button" className="policy-doc-toc-toggle" onClick={() => setTocOpen(true)}>
            Table of Contents
          </button>
        )}

        <div className="policy-doc-layout">
          {!mobile && (
            <aside className="policy-doc-sidebar">
              <PolicyTableOfContents sections={PRIVACY_SECTIONS} />
            </aside>
          )}

          <div className="policy-doc-panel">
            <div className="policy-doc-intro">
              <h2 className="policy-doc-section-title">{PRIVACY_PAGE.title}</h2>
              <div
                className="policy-doc-section-body"
                dangerouslySetInnerHTML={{ __html: PRIVACY_INTRO_HTML }}
              />
            </div>

            {PRIVACY_SECTIONS.map((section, index) => (
              <section key={section.id} id={section.id} className="policy-doc-section">
                <h2 className="policy-doc-section-title">
                  {index + 1}. {section.title}
                </h2>
                <div
                  className="policy-doc-section-body"
                  dangerouslySetInnerHTML={{ __html: section.html }}
                />
              </section>
            ))}
          </div>
        </div>
      </div>

      {mobile && tocOpen && (
        <div className="policy-doc-drawer" role="dialog" aria-modal="true" aria-label="Table of contents">
          <button type="button" className="policy-doc-drawer-backdrop" onClick={closeToc} aria-label="Close" />
          <div className="policy-doc-drawer-panel">
            <div className="policy-doc-drawer-header">
              <h2>Navigate</h2>
              <button type="button" onClick={closeToc} aria-label="Close table of contents">
                ×
              </button>
            </div>
            <PolicyTableOfContents sections={PRIVACY_SECTIONS} onNavigate={closeToc} />
          </div>
        </div>
      )}
    </div>
  )
}
