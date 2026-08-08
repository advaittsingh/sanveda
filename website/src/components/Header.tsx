import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { ASSETS } from '../constants/assets'
import { BRAND, C } from '../constants/brand'
import { NAV_ICONS } from '../constants/navIcons'
import { useAuth } from '../context/AuthContext'
import { fetchCMS, getCMSSection } from '../api'
import { useBreakpoints } from '../hooks/useMediaQuery'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Explore Campaigns', path: '/campaigns' },
  { label: 'Internship', path: '/internship' },
  { label: 'Membership', path: '/membership' },
  { label: 'Monthly Donation', path: '/monthly-donation' },
  { label: 'Volunteer', path: '/volunteer' },
]

function SearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  mobile,
  compact,
}: {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  onSubmit: () => void
  mobile?: boolean
  compact?: boolean
}) {
  const iconColor = '#666'
  const textColor = C.text

  if (mobile) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          background: 'transparent',
        }}
      >
        <Search size={18} color={iconColor} style={{ flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Search By Campaign Title Or NGO Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            lineHeight: '14px',
            fontFamily: 'Red Hat Display',
            color: textColor,
            textTransform: 'capitalize',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} color={iconColor} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '8px 12px',
        minWidth: compact ? 0 : 318,
        flex: compact ? 1 : undefined,
        maxWidth: compact ? '100%' : 400,
        width: compact ? '100%' : undefined,
      }}
    >
      <Search size={18} color="#666" style={{ flexShrink: 0 }} />
      <input
        type="search"
        placeholder="Search By Campaign Title Or NGO Name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 14,
          lineHeight: '14px',
          fontFamily: 'Red Hat Display',
          color: C.text,
          textTransform: 'capitalize',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <X size={18} color="#666" />
        </button>
      )}
    </div>
  )
}

function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { md, wide } = useBreakpoints()
  const { user, loading: authLoading, signOut } = useAuth()
  const [bannerText, setBannerText] = useState<string>(BRAND.tagline)
  const [donateLink, setDonateLink] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCMS()
      .then((cms) => {
        const section = cms.find((s) => s.id === 90) ?? getCMSSection(cms, 'Donate Redirect')
        if (section?.title) setBannerText(section.title)
        if (section?.link) setDonateLink(section.link)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearch(new URLSearchParams(location.search).get('q') || '')
    } else {
      setSearch('')
    }
  }, [location.pathname, location.search])

  const submitSearch = () => {
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    else if (location.pathname === '/search') navigate('/search')
  }

  const clearSearch = () => {
    setSearch('')
    if (location.pathname === '/search') navigate('/search')
  }

  const goDonate = () => {
    if (!donateLink) {
      navigate('/campaigns')
      return
    }
    try {
      const url = new URL(donateLink)
      if (url.origin === window.location.origin) navigate(url.pathname)
      else window.location.href = donateLink
    } catch {
      navigate(donateLink.startsWith('/') ? donateLink : `/${donateLink}`)
    }
  }

  return (
    <div
      style={{
        backgroundColor: md ? 'transparent' : C.grayBg,
        borderRadius: 12,
        padding: '16px 24px',
        boxShadow: md ? 'none' : '0 2px 4px rgba(0,0,0,0.06)',
        border: md ? 'none' : `1px solid ${C.border}`,
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
      >
        {!md && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span
              style={{
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '14px',
                color: C.text,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {bannerText}
            </span>
            <button
              type="button"
              onClick={goDonate}
              aria-label="Donate now"
              className="btn-primary"
              style={{
                borderRadius: 10,
                padding: '12px 18px',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '14px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Red Hat Display',
                whiteSpace: 'nowrap',
              }}
            >
              Donate Us
            </button>
          </div>
        )}

        {md ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              width: '100%',
              padding: '16px 24px',
              boxSizing: 'border-box',
            }}
          >
            <SearchField
              value={search}
              onChange={setSearch}
              onClear={clearSearch}
              onSubmit={submitSearch}
              mobile
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginLeft: 'auto',
              flex: 1,
              minWidth: 0,
              justifyContent: 'flex-end',
            }}
          >
            <SearchField
              value={search}
              onChange={setSearch}
              onClear={clearSearch}
              onSubmit={submitSearch}
              compact={!wide}
            />
            {authLoading ? (
              <div
                aria-hidden="true"
                style={{
                  width: 128,
                  height: 42,
                  borderRadius: 8,
                  background: C.border,
                  opacity: 0.45,
                }}
              />
            ) : user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{
                    borderRadius: 8,
                    padding: '14px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Red Hat Display',
                  }}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void signOut().catch(() => {
                      window.alert('Sign out failed. Please try again.')
                    })
                  }}
                  className="btn-secondary"
                  style={{
                    borderRadius: 8,
                    padding: '14px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Red Hat Display',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-secondary"
                style={{
                  borderRadius: 8,
                  padding: '14px 24px',
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: '14px',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Red Hat Display',
                }}
              >
                Login/Signup
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src={ASSETS.logo}
        alt={BRAND.name}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: size > 40 ? 16 : 14,
            color: C.primary,
            letterSpacing: '0.04em',
            fontFamily: 'Red Hat Display',
          }}
        >
          SANVEDA
        </span>
        <span
          style={{
            fontWeight: 500,
            fontSize: size > 40 ? 9 : 8,
            color: C.textMuted,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            fontFamily: 'Red Hat Display',
            maxWidth: 140,
          }}
        >
          Global Humanitarian Foundation
        </span>
      </div>
    </div>
  )
}

function MobileDrawer({
  open,
  onClose,
  activeLabel,
  authLoading,
  user,
  onSignOut,
}: {
  open: boolean
  onClose: () => void
  activeLabel: string
  authLoading: boolean
  user: boolean
  onSignOut: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
      />
      <div
        id="mobile-navigation"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 270,
          background: C.white,
          zIndex: 1101,
          padding: '10px 10px calc(10px + env(safe-area-inset-bottom, 0))',
          paddingTop: 'calc(10px + env(safe-area-inset-top, 0))',
          borderTopLeftRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 8,
            marginBottom: 8,
          }}
        >
          <Link
            to="/"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <img
              src={ASSETS.logo}
              alt={BRAND.name}
              style={{ width: 40, height: 40, objectFit: 'contain' }}
            />
            <span
              id="mobile-navigation-title"
              style={{
                fontWeight: 800,
                fontSize: 13,
                color: C.primary,
                fontFamily: 'Red Hat Display',
              }}
            >
              SANVEDA
            </span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <X size={22} color={C.primary} />
          </button>
        </div>

        <nav
          style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}
        >
          {navLinks.map((link) => {
            const active = activeLabel === link.label
            const icon = NAV_ICONS[link.label]
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: active ? C.cream : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {icon && (
                  <img
                    src={icon}
                    alt=""
                    width={20}
                    height={20}
                    style={{
                      marginRight: 16,
                      filter: active
                        ? `brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(1200%) hue-rotate(196deg)`
                        : 'none',
                    }}
                  />
                )}
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: active ? C.primary : C.textMuted,
                    fontFamily: 'Red Hat Display',
                  }}
                >
                  {link.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          {authLoading ? (
            <div
              aria-hidden="true"
              style={{
                height: 44,
                margin: 12,
                borderRadius: 8,
                background: C.border,
                opacity: 0.45,
              }}
            />
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: C.primary,
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 14, fontFamily: 'Red Hat Display' }}>
                  Dashboard
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onSignOut()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: C.primary,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 14, fontFamily: 'Red Hat Display' }}>
                  Sign Out
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 8,
                textDecoration: 'none',
                color: C.primary,
              }}
            >
              <img src="/assets/login-MIcon-bddb732f.svg" alt="" width={20} height={20} />
              <span style={{ fontWeight: 500, fontSize: 14, fontFamily: 'Red Hat Display' }}>
                Login/Signup
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: string }) {
  const [hovered, setHovered] = useState(false)
  const color = active ? C.secondary : hovered ? C.secondary : C.primary

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color,
        letterSpacing: '-0.02em',
        lineHeight: '16px',
        padding: '4px 8px',
        textTransform: 'capitalize',
        fontFamily: 'Red Hat Display',
        whiteSpace: 'nowrap',
        transition: 'color 0.2s ease-in-out',
      }}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const location = useLocation()
  const { md, wide } = useBreakpoints()
  const { user, loading: authLoading, signOut } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const activeLabel = navLinks.find((l) => l.path === location.pathname)?.label ?? 'Home'

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }, [])

  const handleSignOut = useCallback(() => {
    void signOut().catch(() => {
      window.alert('Sign out failed. Please try again.')
    })
  }, [signOut])

  return (
    <header style={{ background: C.white, position: 'static', zIndex: 100 }}>
      <div
        style={{
          width: md ? '100%' : '94.44%',
          maxWidth: 1440,
          margin: '0 auto',
          padding: md ? '0 16px' : 0,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ margin: md ? '12px auto' : '20px auto' }}>
          <TopBar />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: md ? '8px 0 12px' : '12px 0 16px',
            marginBottom: 0,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}>
            <LogoMark size={md ? 44 : 52} />
          </Link>

          {md ? (
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: C.primary,
                padding: 8,
              }}
            >
              <Menu size={28} />
            </button>
          ) : (
            <nav
              aria-label="Main navigation"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: wide ? 16 : 0,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} active={activeLabel === link.label}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        activeLabel={activeLabel}
        authLoading={authLoading}
        user={Boolean(user)}
        onSignOut={handleSignOut}
      />
    </header>
  )
}
