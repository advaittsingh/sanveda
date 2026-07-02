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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  fontFamily: 'Red Hat Display, sans-serif',
  fontSize: 14,
  color: C.text,
  background: C.white,
  boxSizing: 'border-box',
}

export default function BlogsPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newsletterSent, setNewsletterSent] = useState(false)

  useEffect(() => {
    fetchBlogs()
      .then((items) => setBlogs(items.length ? items : DEMO_BLOGS))
      .catch(() => setBlogs(DEMO_BLOGS))
      .finally(() => setLoading(false))
  }, [])

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterSent(true)
  }

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

      <section
        style={{
          width: '94.44%',
          maxWidth: 1440,
          margin: `${mobile ? 40 : 64}px auto 0`,
          padding: mobile ? '28px 20px' : '36px 40px',
          background: C.primary,
          borderRadius: mobile ? 20 : 28,
          display: 'flex',
          flexDirection: tablet ? 'column' : 'row',
          alignItems: tablet ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: mobile ? 20 : 32,
        }}
      >
        <div style={{ flex: tablet ? undefined : '1 1 40%' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: mobile ? 20 : 26, fontWeight: 800, color: C.white }}>{BLOGS_PAGE.newsletterTitle}</h2>
          <p style={{ margin: 0, fontSize: mobile ? 14 : 15, color: C.goldLight, lineHeight: 1.5 }}>{BLOGS_PAGE.newsletterSubtitle}</p>
        </div>

        <form
          onSubmit={submitNewsletter}
          style={{
            flex: tablet ? undefined : '1 1 50%',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: 12,
            alignItems: mobile ? 'stretch' : 'center',
          }}
        >
          <input
            type="email"
            required
            placeholder={BLOGS_PAGE.newsletterPlaceholder}
            style={{ ...inputStyle, flex: 1, border: 'none', minWidth: 0 }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '14px 28px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'Red Hat Display, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Submit
          </button>
          {newsletterSent && (
            <p style={{ color: C.goldLight, fontSize: 13, margin: 0, fontWeight: 600, width: '100%' }}>Subscribed successfully!</p>
          )}
        </form>
      </section>
    </div>
  )
}
