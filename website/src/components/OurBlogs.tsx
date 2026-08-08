import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBlogs, fetchCMS, getCMSSection } from '../api'
import BlogCard from './blogs/BlogCard'
import { C } from '../constants/brand'
import { sectionShellStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'
import { withTimeout } from '../lib/withTimeout'
import type { BlogPost } from '../types'
import { normalizeBlogPost } from '../utils/blogUtils'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import ViewAllButton from './ui/ViewAllButton'

function BlogCardSkeleton({ mobile }: { mobile: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        maxWidth: 417,
        height: mobile ? 320 : 380,
        background: '#e8e8e8',
        borderRadius: 16,
      }}
    />
  )
}

export default function OurBlogs() {
  const navigate = useNavigate()
  const { mobile, tablet } = useBreakpoints()
  const [title, setTitle] = useState('Stories of Hope and Change')
  // null = still in flight (never treat as empty). Array = settled fetch.
  const [blogs, setBlogs] = useState<BlogPost[] | null>(null)
  const [failed, setFailed] = useState(false)

  const gridColumns = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const loading = blogs === null && !failed

  useEffect(() => {
    let active = true

    withTimeout(fetchCMS(), 8_000, 'Blog CMS')
      .then((cms) => {
        if (!active) return
        const section = getCMSSection(cms, 'blog') ?? getCMSSection(cms, 'Blog')
        if (section?.title) setTitle(section.title)
      })
      .catch(() => {})

    setBlogs(null)
    setFailed(false)

    withTimeout(fetchBlogs(), 8_000, 'Featured blogs')
      .then((items) => {
        if (!active) return
        setFailed(false)
        setBlogs(Array.isArray(items) ? items.map(normalizeBlogPost).slice(0, 3) : [])
      })
      .catch(() => {
        if (!active) return
        // Keep blogs as null so we never flash the genuine-empty copy on failure.
        setFailed(true)
      })

    return () => {
      active = false
    }
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
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} mobile={mobile} />)
        ) : failed ? (
          <p style={{ color: C.textMuted, gridColumn: '1 / -1', textAlign: 'center', margin: 0 }}>
            Stories could not be loaded right now. Please try again shortly.
          </p>
        ) : blogs && blogs.length > 0 ? (
          blogs.map((post) => <BlogCard key={post.id} post={post} mobile={mobile} />)
        ) : (
          <p style={{ color: C.textMuted, gridColumn: '1 / -1', textAlign: 'center', margin: 0 }}>
            No published blog posts are available yet.
          </p>
        )}
      </div>

      <ViewAllButton text="View All Blogs" mobile={mobile} onClick={() => navigate('/blogs')} />
    </section>
  )
}
