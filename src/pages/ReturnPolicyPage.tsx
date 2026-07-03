import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import SubPageBanner from '../components/ui/SubPageBanner'
import { RETURN_POLICY_HTML, RETURN_POLICY_PAGE } from '../constants/returnPolicyContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function ReturnPolicyPage() {
  const heroMobile = useMediaQuery('(max-width: 600px)')

  return (
    <div className="return-policy-page">
      <AboutBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: RETURN_POLICY_PAGE.breadcrumb, path: null }]}
      />

      <div className="page-banner-wrap" data-mobile={heroMobile}>
        <SubPageBanner
          title={RETURN_POLICY_PAGE.title}
          subtitle={RETURN_POLICY_PAGE.description}
        />
      </div>

      <div className="return-policy-shell">
        <div className="return-policy-panel">
          <div
            className="return-policy-content"
            dangerouslySetInnerHTML={{ __html: RETURN_POLICY_HTML }}
          />
        </div>
      </div>
    </div>
  )
}
