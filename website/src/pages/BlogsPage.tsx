import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import BlogCard from '../components/blogs/BlogCard'
import { fetchBlogs } from '../api'
import { BLOGS_PAGE } from '../constants/blogContent'
import { C } from '../constants/brand'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { withTimeout } from '../lib/withTimeout'
import type { BlogPost } from '../types'

function BlogCardSkeleton({ mobile }: { mobile: boolean }) {
  return (
    <div
      aria-hidden
      style={{ height: mobile ? 360 : 420, background: C.cream, borderRadius: 16 }}
    />
  )
}

type SettledList = { status: 'ready'; blogs: BlogPost[] } | { status: 'error' }

export default function BlogsPage() {
  const mobile = useMediaQuery('(max-width: 600px)')
  const tablet = useMediaQuery('(max-width: 900px)')
  // null = in flight; never show empty-state copy until settled.
  const [featured, setFeatured] = useState<SettledList | null>(null)
  const [rest, setRest] = useState<SettledList | null>(null)

  useEffect(() => {
    let active = true
    setFeatured(null)
    setRest(null)

    withTimeout(fetchBlogs(), 8_000, 'Blogs')
      .then((blogs) => {
        if (!active) return
        const list = Array.isArray(blogs) ? blogs : []
        setFeatured({ status: 'ready', blogs: list.slice(0, 3) })
        setRest({ status: 'ready', blogs: list.slice(3) })
      })
      .catch(() => {
        if (!active) return
        setFeatured({ status: 'error' })
        setRest({ status: 'error' })
      })

    return () => {
      active = false
    }
  }, [])

  const gridColumns = mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  const renderList = (
    state: SettledList | null,
    skeletonCount: number,
    emptyText: string,
    errorText: string,
  ) => {
    if (state === null) {
      return Array.from({ length: skeletonCount }).map((_, i) => (
        <BlogCardSkeleton key={i} mobile={mobile} />
      ))
    }
    if (state.status === 'error') {
      return <p style={{ color: C.textMuted, gridColumn: '1 / -1', margin: 0 }}>{errorText}</p>
    }
    if (state.blogs.length > 0) {
      return state.blogs.map((post) => <BlogCard key={post.id} post={post} mobile={mobile} />)
    }
    return <p style={{ color: C.textMuted, gridColumn: '1 / -1', margin: 0 }}>{emptyText}</p>
  }

  const showRestSection =
    rest === null || rest.status === 'error' || (rest.status === 'ready' && rest.blogs.length > 0)

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

      <section style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto 36px' }}>
        <h2 style={{ margin: `0 0 ${mobile ? 14 : 18}px`, fontSize: mobile ? 18 : 22, fontWeight: 800, color: C.primary }}>
          Featured stories
        </h2>
        <div
          style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 20, alignItems: 'stretch' }}
          aria-busy={featured === null}
        >
          {renderList(
            featured,
            3,
            'No featured stories are available yet.',
            'Featured stories could not be loaded right now. Please try again shortly.',
          )}
        </div>
      </section>

      {showRestSection ? (
        <section style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', paddingBottom: mobile ? 8 : 16 }}>
          <h2 style={{ margin: `0 0 ${mobile ? 14 : 18}px`, fontSize: mobile ? 18 : 22, fontWeight: 800, color: C.primary }}>
            All stories
          </h2>
          <div
            className="blogs-grid"
            style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 20, alignItems: 'stretch' }}
            aria-busy={rest === null}
          >
            {renderList(
              rest,
              6,
              'No published blog posts are available yet.',
              'Stories could not be loaded right now. Please try again shortly.',
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
