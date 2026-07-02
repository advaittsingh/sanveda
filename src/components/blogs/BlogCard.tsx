import { Link } from 'react-router-dom'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import { BLOGS_PAGE } from '../../constants/blogContent'
import type { BlogPost } from '../../types'
import { blogExcerpt, formatBlogDate } from '../../utils/blogUtils'

export default function BlogCard({ post, mobile }: { post: BlogPost; mobile?: boolean }) {
  const image = post.banner_image || ASSETS.fallBackCard
  const excerpt = blogExcerpt(post, 120)

  return (
    <Link
      to={`/blogs/${post.id}`}
      style={{
        width: '100%',
        maxWidth: mobile ? '100%' : 417,
        minWidth: mobile ? 290 : undefined,
        background: C.white,
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        borderRadius: mobile ? 12 : 16,
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: "'Red Hat Display', sans-serif",
        border: `1px solid rgba(14, 79, 168, 0.08)`,
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
        {formatBlogDate(post.createdAt) && (
          <time
            dateTime={post.createdAt}
            style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 8, display: 'block' }}
          >
            {formatBlogDate(post.createdAt)}
          </time>
        )}
        <h3
          style={{
            fontWeight: 700,
            fontSize: mobile ? 14 : 18,
            lineHeight: mobile ? '18px' : '26px',
            color: C.primary,
            margin: `0 0 ${mobile ? 8 : 10}px`,
            minHeight: mobile ? 36 : 52,
            maxHeight: mobile ? 36 : 52,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {post.title}
        </h3>
        {excerpt && (
          <p
            style={{
              fontWeight: 500,
              fontSize: mobile ? 12 : 14,
              lineHeight: mobile ? '18px' : '22px',
              color: C.textMuted,
              margin: 0,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}

export function BlogListItem({ post, mobile }: { post: BlogPost; mobile?: boolean }) {
  const image = post.banner_image || ASSETS.fallBackCard
  const excerpt = blogExcerpt(post, 220)
  const date = formatBlogDate(post.createdAt)

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        gap: mobile ? 16 : 28,
        padding: mobile ? '24px 0' : '32px 0',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <Link
        to={`/blogs/${post.id}`}
        style={{
          flexShrink: 0,
          width: mobile ? '100%' : 300,
          height: mobile ? 200 : 200,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <img src={image} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        {date && (
          <time dateTime={post.createdAt} style={{ fontSize: 13, fontWeight: 600, color: C.gold, display: 'block', marginBottom: 10 }}>
            {date}
          </time>
        )}
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: mobile ? 18 : 22,
            fontWeight: 800,
            lineHeight: 1.35,
            color: C.primary,
          }}
        >
          <Link to={`/blogs/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h3>
        {excerpt && (
          <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.7, color: C.textMuted }}>{excerpt}</p>
        )}
        <Link
          to={`/blogs/${post.id}`}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.secondary,
            textDecoration: 'none',
          }}
        >
          {BLOGS_PAGE.continueReading} →
        </Link>
      </div>
    </article>
  )
}
