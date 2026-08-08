import { FAQ_TABS, type FaqTabKey } from '../../constants/faqContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Props {
  active: FaqTabKey
  onChange: (key: FaqTabKey) => void
}

export default function FaqTabs({ active, onChange }: Props) {
  const mobile = useMediaQuery('(max-width: 600px)')
  const compact = useMediaQuery('(max-width: 1300px)')
  const tablet = useMediaQuery('(max-width: 899px)')

  return (
    <div className="faq-tabs" role="tablist" aria-label="FAQ categories" data-mobile={mobile} data-compact={compact} data-tablet={tablet}>
      {FAQ_TABS.map((tab) => {
        const selected = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className="faq-tab"
            data-selected={selected}
            data-mobile={mobile}
            data-compact={compact}
            data-tablet={tablet}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
