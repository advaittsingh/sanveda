import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AboutBreadcrumb from '../components/about/AboutBreadcrumb'
import { fetchBlogs } from '../api'
import { C } from '../constants/brand'
import { DEMO_BLOGS } from '../constants/blogs'
import { formatBlogDate } from '../utils/blogUtils'
import type { BlogPost } from '../types'
import HtmlContent from '../components/ui/HtmlContent'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const mobile = useMediaQuery('(max-width: 600px)')
  const [post, setPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetchBlogs().then((blogs) => {
      const found = blogs.find((b) => String(b.id) === id)
      setPost(found ?? DEMO_BLOGS.find((b) => String(b.id) === id) ?? null)
    })
  }, [id])

  if (!post) {
    return (
      <div style={{ background: C.white, padding: '40px 0 80px' }}>
        <AboutBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Blogs', path: '/blogs' }, { label: 'Post', path: null }]} />
        <div style={{ width: '94.44%', maxWidth: 960, margin: '40px auto', textAlign: 'center' }}>
          <p style={{ color: C.textMuted }}>Blog post not found.</p>
          <Link to="/blogs" style={{ color: C.secondary, fontWeight: 600 }}>← Back to blogs</Link>
        </div>
      </div>
    )
  }

  const body = post.BlogDescs?.[0]?.description ?? post.description ?? ''
  const date = formatBlogDate(post.createdAt)

  return (
    <div style={{ background: C.white, paddingBottom: mobile ? 40 : 80 }}>
      <AboutBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Blogs', path: '/blogs' },
          { label: post.title.slice(0, 40) + (post.title.length > 40 ? '…' : ''), path: null },
        ]}
      />

      <article style={{ width: '94.44%', maxWidth: 960, margin: '0 auto', padding: mobile ? '16px 0' : '24px 0' }}>
        {date && (
          <time dateTime={post.createdAt} style={{ fontSize: 14, fontWeight: 600, color: C.secondary, display: 'block', marginBottom: 12 }}>
            {date}
          </time>
        )}
        <h1 style={{ fontWeight: 800, fontSize: mobile ? 26 : 36, color: C.primary, margin: '0 0 24px', lineHeight: 1.3 }}>{post.title}</h1>
        {post.banner_image && (
          <img
            src={post.banner_image}
            alt={post.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 20, marginBottom: 28 }}
          />
        )}
        <HtmlContent html={body} />
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
          <Link to="/blogs" style={{ color: C.secondary, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            ← Back to blogs
          </Link>
        </div>
      </article>
    </div>
  )
}
