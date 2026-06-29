import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBlogs } from '../api'
import { C } from '../constants/brand'
import type { BlogPost } from '../types'
import PageShell from '../components/ui/PageShell'
import HtmlContent from '../components/ui/HtmlContent'

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetchBlogs().then((blogs) => {
      const found = blogs.find((b) => String(b.id) === id)
      setPost(found ?? null)
    })
  }, [id])

  if (!post) {
    return (
      <PageShell>
        <p style={{ color: C.textMuted }}>Blog post not found.</p>
        <Link to="/blogs" style={{ color: C.secondary }}>← Back to blogs</Link>
      </PageShell>
    )
  }

  const body = post.BlogDescs?.[0]?.description ?? post.description ?? ''

  return (
    <PageShell bg={C.white}>
      <Link to="/blogs" style={{ color: C.secondary, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>← Back to blogs</Link>
      {post.banner_image && (
        <img src={post.banner_image} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 20, margin: '20px 0' }} />
      )}
      <h1 style={{ fontWeight: 800, fontSize: 32, color: C.primary, margin: '0 0 24px', lineHeight: 1.3 }}>{post.title}</h1>
      <HtmlContent html={body} />
    </PageShell>
  )
}
