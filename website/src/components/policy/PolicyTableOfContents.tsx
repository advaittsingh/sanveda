import { ASSETS } from '../../constants/assets'

export interface TocSection {
  id: string
  title: string
}

interface Props {
  sections: TocSection[]
  onNavigate?: () => void
}

export default function PolicyTableOfContents({ sections, onNavigate }: Props) {
  return (
    <nav className="policy-toc" aria-label="Table of contents">
      <h2 className="policy-toc-title">
        <img src={ASSETS.starIcon} alt="" width={18} height={18} />
        Table of Contents
      </h2>
      <ol className="policy-toc-list">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="policy-toc-link"
              onClick={onNavigate}
            >
              {index + 1}. {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
