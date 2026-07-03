import { useState } from 'react'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import PolicyTableOfContents from '../components/policy/PolicyTableOfContents'
import SubPageBanner from '../components/ui/SubPageBanner'
import {
  REFUND_POLICY_PAGE,
  REFUND_POLICY_SECTIONS,
} from '../constants/refundPolicyContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function RefundPolicyPage() {
  const heroMobile = useMediaQuery('(max-width: 600px)')
  const mobile = useMediaQuery('(max-width: 899px)')
  const [tocOpen, setTocOpen] = useState(false)

  const closeToc = () => setTocOpen(false)

  return (
    <div className="policy-doc-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: REFUND_POLICY_PAGE.breadcrumb, path: null }]}
      />

      <div className="page-banner-wrap" data-mobile={heroMobile}>
        <SubPageBanner
          title={REFUND_POLICY_PAGE.title}
          subtitle={REFUND_POLICY_PAGE.description}
        />
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
              <PolicyTableOfContents sections={REFUND_POLICY_SECTIONS} />
            </aside>
          )}

          <div className="policy-doc-panel">
            {REFUND_POLICY_SECTIONS.map((section, index) => (
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
            <PolicyTableOfContents sections={REFUND_POLICY_SECTIONS} onNavigate={closeToc} />
          </div>
        </div>
      )}
    </div>
  )
}
