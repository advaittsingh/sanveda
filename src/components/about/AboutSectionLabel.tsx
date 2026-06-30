import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'

export default function AboutSectionLabel({
  children,
  center,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <h2
      style={{
        fontWeight: 600,
        fontSize: 'inherit',
        lineHeight: 'inherit',
        color: C.gold,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        gap: 10,
        textAlign: center ? 'center' : 'left',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <span>
        <img src={ASSETS.aboutPeople} alt="" width={24} height={24} style={{ filter: 'none' }} />
      </span>
      <span>{children}</span>
    </h2>
  )
}
