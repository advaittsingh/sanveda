import { FOCUS_AREAS } from '../constants/focusAreas'
import { sectionShellStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import FocusAreaCard from './FocusAreaCard'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'

export default function KeyFocusAreas() {
  const { mobile, tablet } = useBreakpoints()
  const isDesktop = !mobile && !tablet
  const firstRow = FOCUS_AREAS.slice(0, 3)
  const secondRow = FOCUS_AREAS.slice(3)

  const gridColumns = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const gap = mobile ? 16 : tablet ? 20 : 24

  return (
    <section
      style={{
        ...sectionShellStyle(mobile, { padding: mobile ? '32px 16px' : '60px 34px 40px' }),
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: mobile ? 24 : 40 }}>
        <SectionLabel mobile={mobile} center>Our Key Focus Area</SectionLabel>
        <div style={{ marginTop: 12 }}>
          <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '720px'}>
            Where Your Compassion
            <br />
            Creates Lasting Change
          </SectionTitle>
        </div>
      </div>

      {isDesktop ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap,
              justifyItems: 'center',
            }}
          >
            {firstRow.map((area) => (
              <FocusAreaCard key={area.slug} area={area} mobile={mobile} />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap,
              marginTop: gap,
              flexWrap: 'wrap',
            }}
          >
            {secondRow.map((area) => (
              <FocusAreaCard key={area.slug} area={area} mobile={mobile} />
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap,
            justifyItems: 'center',
          }}
        >
          {FOCUS_AREAS.map((area) => (
            <FocusAreaCard key={area.slug} area={area} mobile={mobile} />
          ))}
        </div>
      )}
    </section>
  )
}
