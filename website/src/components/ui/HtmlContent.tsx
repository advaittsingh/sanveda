import DOMPurify from 'dompurify'

interface Props {
  html: string
  className?: string
}

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
  'a', 'blockquote', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}

export default function HtmlContent({ html, className }: Props) {
  if (!html) return null
  const safe = sanitizeHtml(html)
  return (
    <div
      className={['html-content', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
