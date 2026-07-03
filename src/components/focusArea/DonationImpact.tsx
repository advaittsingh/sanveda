import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent } from '../../constants/focusAreaContent'
import { FocusSection, FocusSectionHeader } from './FocusSection'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function DonationImpact({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)

  return (
    <FocusSection mobile={mobile} variant="cream" delay={240}>
      <FocusSectionHeader label="Your Impact" title="How Your Donation Helps" mobile={mobile} />
      <div className="focus-donation-ladder">
        {content.donationLadder.map((tier) => (
          <div key={tier.amount} className="focus-donation-tier">
            <div className="focus-donation-amount">{tier.amount}</div>
            <p className="focus-donation-desc">{tier.description}</p>
          </div>
        ))}
      </div>

      <div className="focus-partners-block">
        <h3 className="focus-partners-heading">Trusted Partners</h3>
        <div className="focus-partners-row">
          {content.partners.map((partner) => (
            <span key={partner} className="focus-partner-pill">
              {partner}
            </span>
          ))}
        </div>
      </div>
    </FocusSection>
  )
}
