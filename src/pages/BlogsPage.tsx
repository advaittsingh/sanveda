import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import BlogCard from '../components/blogs/BlogCard'
import { fetchBlogs } from '../api'
import { BLOGS_PAGE } from '../constants/blogContent'
import { C } from '../constants/brand'
import { DEMO_BLOGS } from '../constants/blogs'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { BlogPost } from '../types'

export default function BlogsPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
      .then((items) => setBlogs(items.length ? items : DEMO_BLOGS))
      .catch(() => setBlogs(DEMO_BLOGS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: BLOGS_PAGE.breadcrumb, path: null }]} />

      <section
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: mobile ? '8px 0 28px' : '16px 0 40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontSize: mobile ? 14 : 18,
            fontWeight: 600,
            color: C.gold,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {BLOGS_PAGE.label}
        </p>
        <h1
          style={{
            margin: `0 0 ${mobile ? 10 : 14}px`,
            fontSize: mobile ? 24 : tablet ? 30 : 42,
            fontWeight: 800,
            lineHeight: 1.2,
            color: C.primary,
          }}
        >
          {BLOGS_PAGE.title}
        </h1>
        <p style={{ margin: 0, fontSize: mobile ? 13 : 15, lineHeight: 1.65, color: C.textMuted, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          {BLOGS_PAGE.tagline}
        </p>
      </section>

      <section style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto 40px' }}>
        <div
          style={{
            background: C.primary,
            borderRadius: mobile ? 16 : 24,
            padding: mobile ? '24px 20px' : '32px 40px',
            display: 'flex',
            flexDirection: tablet ? 'column' : 'row',
            alignItems: tablet ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: mobile ? 18 : 24, fontWeight: 800, color: C.white }}>{BLOGS_PAGE.ctaTitle}</h2>
            <p style={{ margin: 0, fontSize: mobile ? 13 : 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>{BLOGS_PAGE.ctaDescription}</p>
          </div>
          <Link
            to="/campaigns"
            className="btn-primary"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {BLOGS_PAGE.ctaButton}
          </Link>
        </div>
      </section>

      <section style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', paddingBottom: mobile ? 8 : 16 }}>
        <div
          className="blogs-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: mobile ? 360 : 420, background: C.cream, borderRadius: 16 }} />
              ))
            : blogs.map((post) => <BlogCard key={post.id} post={post} mobile={mobile} />)}
        </div>
      </section>
    </div>
  )
}
