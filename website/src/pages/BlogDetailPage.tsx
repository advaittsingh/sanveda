import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { fetchBlogs } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import {
  estimateReadingMinutes,
  formatBlogDate,
  getBlogPostDateIso,
} from '../utils/blogUtils'
import type { BlogPost } from '../types'
import HtmlContent from '../components/ui/HtmlContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function buildArticleHtml(post: BlogPost): string {
  const blocks = post.BlogDescs ?? []
  if (blocks.length === 0) return post.description ?? ''

  return blocks
    .map((block) => {
      const raw = (block.description ?? '').trim()
      if (!raw) return ''
      if (looksLikeHtml(raw)) return raw
      const heading = block.title?.trim()
        ? `<h2>${block.title.trim()}</h2>`
        : ''
      return `${heading}<p>${raw}</p>`
    })
    .filter(Boolean)
    .join('')
}

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const mobile = useMediaQuery('(max-width: 600px)')
  const [post, setPost] = useState<BlogPost | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    let active = true
    setStatus('loading')
    setPost(null)

    fetchBlogs()
      .then((blogs) => {
        if (!active) return
        const found = blogs.find((b) => String(b.id) === id) ?? null
        setPost(found)
        setStatus(found ? 'ready' : 'missing')
      })
      .catch(() => {
        if (!active) return
        setPost(null)
        setStatus('missing')
      })

    return () => {
      active = false
    }
  }, [id])

  if (status === 'loading') {
    return (
      <div style={{ background: C.cream, paddingBottom: mobile ? 48 : 88 }}>
        <AboutBreadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Blogs', path: '/blogs' },
            { label: 'Loading…', path: null },
          ]}
        />
        <div
          style={{
            width: '94.44%',
            maxWidth: 820,
            margin: '0 auto',
            padding: mobile ? '12px 0 0' : '20px 0 0',
          }}
        >
          <div
            aria-hidden
            style={{
              height: 18,
              width: 140,
              borderRadius: 999,
              background: '#E4E9F0',
              marginBottom: 18,
            }}
          />
          <div
            aria-hidden
            style={{
              height: mobile ? 34 : 44,
              width: '88%',
              borderRadius: 10,
              background: '#E4E9F0',
              marginBottom: 16,
            }}
          />
          <div
            aria-hidden
            style={{
              height: mobile ? 220 : 360,
              borderRadius: 20,
              background: '#E4E9F0',
              marginBottom: 28,
            }}
          />
          <div
            aria-hidden
            style={{
              height: 120,
              borderRadius: 12,
              background: '#E4E9F0',
            }}
          />
        </div>
      </div>
    )
  }

  if (status === 'missing' || !post) {
    return (
      <div style={{ background: C.cream, paddingBottom: mobile ? 48 : 88 }}>
        <AboutBreadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Blogs', path: '/blogs' },
            { label: 'Post', path: null },
          ]}
        />
        <div
          style={{
            width: '94.44%',
            maxWidth: 820,
            margin: '40px auto',
            textAlign: 'center',
            background: C.white,
            borderRadius: 20,
            padding: mobile ? 28 : 48,
            border: `1px solid ${C.border}`,
          }}
        >
          <h1
            style={{
              margin: '0 0 12px',
              fontSize: mobile ? 22 : 28,
              fontWeight: 800,
              color: C.primary,
            }}
          >
            Blog post not found
          </h1>
          <p style={{ color: C.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>
            This article may have been moved or is no longer published.
          </p>
          <Link to="/blogs" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Back to blogs
          </Link>
        </div>
      </div>
    )
  }

  const body = buildArticleHtml(post)
  const dateIso = getBlogPostDateIso(post)
  const date = formatBlogDate(dateIso)
  const minutes = estimateReadingMinutes(body || post.description || '')
  const banner = post.banner_image || ASSETS.fallBackBanner || ASSETS.fallBackCard

  return (
    <div className="blog-detail-page" style={{ background: C.cream, paddingBottom: mobile ? 48 : 88 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Blogs', path: '/blogs' },
          {
            label: post.title.slice(0, 40) + (post.title.length > 40 ? '…' : ''),
            path: null,
          },
        ]}
      />

      <article
        style={{
          width: '94.44%',
          maxWidth: 820,
          margin: '0 auto',
          padding: mobile ? '8px 0 0' : '12px 0 0',
        }}
      >
        <header style={{ marginBottom: mobile ? 20 : 28 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {post.category ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'rgba(14, 79, 168, 0.1)',
                  color: C.secondary,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {post.category}
              </span>
            ) : null}
            {date && dateIso ? (
              <time
                dateTime={dateIso}
                style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}
              >
                {date}
              </time>
            ) : null}
            {minutes > 0 ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>
                · {minutes} min read
              </span>
            ) : null}
          </div>

          <h1
            style={{
              fontWeight: 800,
              fontSize: mobile ? 28 : 40,
              color: C.primary,
              margin: '0 0 14px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {post.title}
          </h1>

          {post.description ? (
            <p
              style={{
                margin: 0,
                fontSize: mobile ? 16 : 18,
                lineHeight: 1.65,
                color: C.textMuted,
                fontWeight: 500,
                maxWidth: 680,
              }}
            >
              {post.description}
            </p>
          ) : null}
        </header>

        {banner ? (
          <figure
            style={{
              margin: `0 0 ${mobile ? 28 : 36}px`,
              borderRadius: mobile ? 16 : 24,
              overflow: 'hidden',
              background: C.white,
              boxShadow: '0 16px 40px rgba(4, 27, 77, 0.08)',
            }}
          >
            <img
              src={banner}
              alt=""
              style={{
                width: '100%',
                display: 'block',
                aspectRatio: mobile ? '16 / 10' : '16 / 9',
                objectFit: 'cover',
                maxHeight: mobile ? 260 : 420,
              }}
            />
          </figure>
        ) : null}

        <div
          style={{
            background: C.white,
            borderRadius: mobile ? 16 : 24,
            border: `1px solid ${C.border}`,
            padding: mobile ? '24px 18px' : '36px 40px',
            boxShadow: '0 10px 30px rgba(4, 27, 77, 0.04)',
          }}
        >
          <HtmlContent html={body} className="html-content blog-article-body" />

          <div
            style={{
              marginTop: mobile ? 32 : 40,
              paddingTop: 24,
              borderTop: `1px solid ${C.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              to="/blogs"
              style={{
                color: C.secondary,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              ← Back to blogs
            </Link>
            <Link
              to="/campaigns"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
              }}
            >
              Support a cause
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
