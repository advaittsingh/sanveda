import { Link } from 'react-router-dom'
import { ASSETS } from '../../constants/assets'
import { BLOGS_PAGE } from '../../constants/blogContent'
import type { BlogPost } from '../../types'
import { blogExcerpt, formatBlogDate, getBlogPostDateIso } from '../../utils/blogUtils'

export default function BlogCard({ post, mobile }: { post: BlogPost; mobile?: boolean }) {
  const image = post.banner_image || ASSETS.fallBackCard
  const excerpt = blogExcerpt(post, 160)
  const dateIso = getBlogPostDateIso(post)
  const date = formatBlogDate(dateIso)

  return (
    <article
      className="card-interactive blog-card"
      style={{
        width: '100%',
        background: '#FFFFFF',
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        borderRadius: mobile ? 10 : 12,
        overflow: 'hidden',
        fontFamily: "'Red Hat Display', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 10,
        boxSizing: 'border-box',
      }}
    >
      <Link
        to={`/blogs/${post.id}`}
        style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <div
          className="blog-card-image"
          style={{
            width: '100%',
            height: mobile ? 180 : 200,
            borderRadius: mobile ? 10 : 12,
            overflow: 'hidden',
            marginBottom: mobile ? 10 : 12,
            flexShrink: 0,
          }}
        >
          <img
            src={image}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 12 }}
          />
        </div>

        <h3
          style={{
            fontWeight: 700,
            fontSize: mobile ? 16 : 20,
            lineHeight: mobile ? '22px' : '28px',
            color: '#3E3232',
            margin: `0 0 ${mobile ? 12 : 16}px`,
            minHeight: mobile ? 44 : 56,
            maxHeight: mobile ? 44 : 56,
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
              fontWeight: 400,
              fontSize: 12,
              lineHeight: mobile ? '20px' : '24px',
              color: '#4A4A49',
              margin: `0 0 ${mobile ? 16 : 20}px`,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {excerpt}
          </p>
        )}
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: '#F5F5F5',
          borderRadius: mobile ? 8 : 12,
          padding: mobile ? '10px 12px' : '18px 16px',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: mobile ? 10 : 12,
              color: '#686866',
              textTransform: 'capitalize',
              letterSpacing: '0.1px',
              marginBottom: 6,
              lineHeight: 1,
            }}
          >
            Posted On
          </div>
          {date && dateIso && (
            <time
              dateTime={dateIso}
              style={{
                fontWeight: 700,
                fontSize: mobile ? 12 : 14,
                lineHeight: mobile ? '16px' : '18px',
                color: '#1D1D1B',
                display: 'block',
              }}
            >
              {date}
            </time>
          )}
        </div>

        <Link
          to={`/blogs/${post.id}`}
          className="blog-read-more"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1D1D1B',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: mobile ? 12 : 14,
            borderRadius: 10,
            padding: mobile ? '8px 16px' : '13px 19px',
            minWidth: mobile ? 80 : 100,
            height: mobile ? 32 : 40,
            textDecoration: 'none',
            boxShadow: '0px 4px 0px 0px #B9B9B8',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          {BLOGS_PAGE.continueReading}
        </Link>
      </div>
    </article>
  )
}
