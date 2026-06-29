interface Props {
  html: string
  className?: string
}

export default function HtmlContent({ html, className }: Props) {
  if (!html) return null
  return (
    <div
      className={className}
      style={{ fontSize: 15, lineHeight: 1.7, color: '#1B1B1B' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
