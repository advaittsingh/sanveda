import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBlogs, fetchCMS, getCMSSection } from '../api'
import BlogCard from './blogs/BlogCard'
import { C } from '../constants/brand'
import { sectionShellStyle } from '../constants/sectionStyles'
import { DEMO_BLOGS } from '../constants/blogs'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { BlogPost } from '../types'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import ViewAllButton from './ui/ViewAllButton'

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
