import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogs } from '../api'
import { C } from '../constants/brand'
import type { BlogPost } from '../types'
import PageHero from '../components/ui/PageHero'
import PageShell from '../components/ui/PageShell'
import SectionLabel from '../components/ui/SectionLabel'

function excerpt(post: BlogPost): string {
  const html = post.BlogDescs?.[0]?.description ?? post.description ?? ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140) + '…'
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs().then(setBlogs).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div style={{ padding: '24px 0 0' }}>
        <PageHero label="Blog" title="Stories of Hope and Change" description="Read inspiring stories from our community and see how your contributions create impact." compact />
      </div>
      <PageShell bg={C.grayBg}>
        <SectionLabel>Blog</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 320, background: '#e0e0e0', borderRadius: 16 }} />)
            : blogs.map((post) => (
                <Link
                  key={post.id}
                  to={`/blogs/${post.id}`}
                  style={{ textDecoration: 'none', background: C.white, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, display: 'block', transition: 'box-shadow 0.2s' }}
                >
                  {post.banner_image && (
                    <img src={post.banner_image} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, color: C.primary, margin: '0 0 10px', lineHeight: 1.4 }}>{post.title}</h3>
                    <p style={{ fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{excerpt(post)}</p>
                  </div>
                </Link>
              ))}
        </div>
      </PageShell>
    </>
  )
}
