import HtmlContent from '../ui/HtmlContent'
import { ASSETS } from '../../constants/assets'
import { CD } from './campaignDetailTheme'

interface ProjectBlock {
  id: number | string
  description?: string
  image?: string
}

interface Props {
  projects: ProjectBlock[]
  mobile?: boolean
}

export default function CampaignProjectSection({ projects, mobile }: Props) {
  if (!projects.length) return null

  return (
    <section id="project">
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: mobile ? 0 : 12,
          border: `1px solid ${CD.border}`,
          padding: mobile ? '20px 16px' : '30px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: mobile ? 10 : 20 }}>
          <img src={ASSETS.starIcon} alt="" width={mobile ? 14 : 24} height={mobile ? 14 : 24} />
          <h2 style={{ margin: 0, fontSize: mobile ? 14 : 24, fontWeight: 700, color: CD.primary }}>Project</h2>
        </div>
        <div style={{ height: 1, background: CD.border, marginBottom: mobile ? 16 : 20 }} />

        {projects.map((block) => (
          <div key={block.id} style={{ marginBottom: mobile ? 20 : 0 }}>
            {block.image && (
              <img
                src={block.image}
                alt=""
                style={{
                  width: '100%',
                  borderRadius: 10,
                  marginBottom: 16,
                  maxHeight: 420,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
            {block.description && <HtmlContent html={block.description} />}
          </div>
        ))}
      </div>
    </section>
  )
}
