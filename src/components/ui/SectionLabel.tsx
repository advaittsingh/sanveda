import { C } from '../../constants/brand'

interface Props {
  children: React.ReactNode
  mobile?: boolean
  center?: boolean
}

export default function SectionLabel({ children, mobile, center }: Props) {
  return (
    <h3
      style={{
        fontFamily: mobile ? 'Red Hat Display' : 'Nunito',
        fontWeight: 700,
        fontSize: mobile ? '12px' : '18px',
        lineHeight: mobile ? '12px' : '18px',
        textAlign: center || mobile ? 'center' : 'left',
        color: C.gold,
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </h3>
  )
}
