import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '../../constants/faqContent'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Props {
  items: FaqItem[]
}

export default function FaqAccordion({ items }: Props) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([])
  const mobile = useMediaQuery('(max-width: 600px)')
  const compact = useMediaQuery('(max-width: 1300px)')

  const toggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  if (!items.length) {
    return <p className="faq-empty">No questions available for this category.</p>
  }

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const open = openIndexes.includes(index)
        return (
          <article
            key={item.id}
            className="faq-accordion-item"
            data-open={open}
            data-mobile={mobile}
            data-compact={compact}
          >
            <button
              type="button"
              className="faq-accordion-trigger"
              onClick={() => toggle(index)}
              aria-expanded={open}
            >
              <span className="faq-accordion-question">{item.question}</span>
              <span className="faq-accordion-toggle" data-open={open} aria-hidden>
                <ChevronDown size={mobile ? 16 : 20} strokeWidth={2.5} />
              </span>
            </button>
            {open && item.html ? (
              <div
                className="faq-accordion-answer"
                data-compact={compact}
                dangerouslySetInnerHTML={{ __html: item.html }}
              />
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
