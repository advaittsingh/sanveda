import { useNavigate } from 'react-router-dom'
import { C } from '../../constants/brand'
import { useMediaQuery } from '../../hooks/useMediaQuery'

interface Crumb {
  label: string
  path: string | null
}

export default function AboutBreadcrumb({ items }: { items: Crumb[] }) {
  const navigate = useNavigate()
  const mobile = useMediaQuery('(max-width: 600px)')

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingBottom: mobile ? 16 : 0,
        paddingTop: mobile ? 0 : 26,
        width: '94.44%',
        maxWidth: 1440,
        margin: '0 auto',
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, i) => (
        <span key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{ color: C.primary, fontSize: 18, fontWeight: 500, margin: '0 6px' }}>&gt;</span>
          )}
          {item.path ? (
            <button
              type="button"
              onClick={() => navigate(item.path!)}
              style={{
                color: C.textMuted,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1,
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: C.primary, fontSize: 14, fontWeight: 600, lineHeight: 1 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
