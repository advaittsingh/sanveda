import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchBlogs, fetchCMS, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import { sectionShellStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import { DEMO_BLOGS } from '../constants/blogs'
import type { BlogPost } from '../types'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import ViewAllButton from './ui/ViewAllButton'

function blogExcerpt(post: BlogPost): string {
  const html = post.BlogDescs?.[0]?.description ?? post.description ?? ''
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

function BlogCard({ post, mobile }: { post: BlogPost; mobile?: boolean }) {
  const image = post.banner_image || ASSETS.fallBackCard

  return (
    <Link
      to={`/blogs/${post.id}`}
      style={{
        width: mobile ? '100%' : '100%',
        maxWidth: mobile ? '100%' : 417,
        minWidth: mobile ? 290 : undefined,
        background: '#FFFFFF',
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        borderRadius: mobile ? 12 : 16,
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: "'Red Hat Display', sans-serif",
      }}
    >
      <div style={{ padding: mobile ? 12 : 16, paddingBottom: mobile ? 16 : 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            width: '100%',
            height: mobile ? 156 : 217,
            borderRadius: mobile ? 12 : 16,
            overflow: 'hidden',
            marginBottom: mobile ? 14 : 18,
          }}
        >
          <img
            src={image}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <h3
          style={{
            fontWeight: 700,
            fontSize: mobile ? 14 : 18,
            lineHeight: mobile ? '18px' : '26px',
            color: '#1D1D1B',
            margin: `0 0 ${mobile ? 8 : 10}px`,
            minHeight: mobile ? 36 : 52,
            maxHeight: mobile ? 36 : 52,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textTransform: 'capitalize',
          }}
        >
          {post.title}
        </h3>
        {blogExcerpt(post) && (
          <p
            style={{
              fontWeight: 500,
              fontSize: mobile ? 12 : 14,
              lineHeight: mobile ? '18px' : '22px',
              color: '#686866',
              margin: 0,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {blogExcerpt(post)}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function OurBlogs() {
  const navigate = useNavigate()
  const { mobile, tablet } = useBreakpoints()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [title, setTitle] = useState('Stories of Hope and Change')
  const [loading, setLoading] = useState(true)

  const gridColumns = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  useEffect(() => {
    fetchCMS()
      .then((cms) => {
        const section = getCMSSection(cms, 'blog') ?? getCMSSection(cms, 'Blog')
        if (section?.title) setTitle(section.title)
      })
      .catch(() => {})
    fetchBlogs()
      .then((items) => setBlogs((items.length ? items : DEMO_BLOGS).slice(0, 3)))
      .catch(() => setBlogs(DEMO_BLOGS.slice(0, 3)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      style={{
        ...sectionShellStyle(mobile, {
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          padding: mobile ? '32px 0 24px' : '60px 34px 40px',
          backgroundColor: C.white,
        }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: mobile ? 24 : 40, width: '100%' }}>
        <SectionLabel mobile={mobile} center>Our Blogs</SectionLabel>
        <div style={{ marginTop: 12 }}>
          <SectionTitle mobile={mobile} maxWidth={mobile ? '280px' : '620px'}>
            {title}
          </SectionTitle>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: mobile ? 16 : tablet ? 20 : 24,
          justifyItems: 'center',
          width: '100%',
          marginBottom: mobile ? 24 : 40,
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '100%',
                  maxWidth: 417,
                  height: mobile ? 320 : 380,
                  background: '#e8e8e8',
                  borderRadius: 16,
                }}
              />
            ))
          : blogs.map((post) => <BlogCard key={post.id} post={post} mobile={mobile} />)}
      </div>

      <ViewAllButton text="View All Blogs" mobile={mobile} onClick={() => navigate('/blogs')} />
    </section>
  )
}
