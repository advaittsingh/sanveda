import { C } from '../../constants/brand'

interface Props {
  children: React.ReactNode
  mobile?: boolean
  maxWidth?: string
}

export default function SectionTitle({ children, mobile, maxWidth }: Props) {
  return (
    <h2
      style={{
        fontFamily: 'Red Hat Display',
        fontWeight: 800,
        fontSize: mobile ? '20px' : '36px',
        lineHeight: '140%',
        letterSpacing: '-0.01em',
        textAlign: 'center',
        textTransform: 'capitalize',
        color: C.primary,
        margin: 0,
        padding: 0,
        maxWidth: maxWidth ?? (mobile ? '280px' : '506px'),
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {children}
    </h2>
  )
}
