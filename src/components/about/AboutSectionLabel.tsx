import { ASSETS } from '../../constants/assets'

export default function AboutSectionLabel({
  children,
  center,
  light,
}: {
  children: React.ReactNode
  center?: boolean
  light?: boolean
}) {
  return (
    <h2
      style={{
        fontWeight: 600,
        fontSize: 'inherit',
        lineHeight: 'inherit',
        color: '#A9C74E',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        gap: 10,
        textAlign: center ? 'center' : 'left',
      }}
    >
      <span>
        <img src={ASSETS.aboutPeople} alt="" width={24} height={24} />
      </span>
      <span style={{ color: light ? undefined : '#A9C74E' }}>{children}</span>
    </h2>
  )
}
