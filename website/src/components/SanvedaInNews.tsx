import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { C } from '../constants/brand'
import { creamSectionStyle } from '../constants/sectionStyles'
import { useBreakpoints } from '../hooks/useMediaQuery'

/** https://youtu.be/7TIjkZ98CIQ */
const YOUTUBE_VIDEO_ID = '7TIjkZ98CIQ'

type YtPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  destroy: () => void
}

type YtNamespace = {
  Player: new (
    elementId: string,
    options: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YtPlayer }) => void
        onStateChange?: (event: { data: number; target: YtPlayer }) => void
      }
    },
  ) => YtPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<YtNamespace> | null = null

function loadYouTubeApi(): Promise<YtNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No window'))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
    }
    if (!document.querySelector('script[data-sanveda-yt-api]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.sanvedaYtApi = '1'
      document.head.appendChild(script)
    }
    if (window.YT?.Player) resolve(window.YT)
  })

  return ytApiPromise
}

function SectionDivider({ title, mobile }: { title: string; mobile?: boolean }) {
  const lineStyle: CSSProperties = {
    flex: 1,
    maxWidth: mobile ? 80 : 250,
    height: 0,
    borderTop: '2.5px solid',
    borderImageSlice: 1,
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: mobile ? 12 : 16,
        marginBottom: mobile ? 24 : 32,
      }}
    >
      <div
        style={{
          ...lineStyle,
          borderImageSource:
            'linear-gradient(90deg, rgba(14, 79, 168, 0.08) 0%, rgba(14, 79, 168, 0.45) 100%)',
        }}
      />
      <h2
        style={{
          fontFamily: 'Red Hat Display, sans-serif',
          fontWeight: 800,
          fontSize: mobile ? 20 : 24,
          color: C.primary,
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          ...lineStyle,
          borderImageSource:
            'linear-gradient(90deg, rgba(14, 79, 168, 0.45) 0%, rgba(14, 79, 168, 0.08) 100%)',
        }}
      />
    </div>
  )
}

export default function SanvedaInNews() {
  const { mobile } = useBreakpoints()
  const sectionRef = useRef<HTMLElement>(null)
  const playerHostId = useRef(`sanveda-news-yt-${Math.random().toString(36).slice(2)}`).current
  const playerRef = useRef<YtPlayer | null>(null)
  const savedTimeRef = useRef(0)
  const inViewRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let cancelled = false

    void loadYouTubeApi().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player(playerHostId, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          // Autoplay is driven by the IFrame API once the section is visible.
          autoplay: 0,
        },
        events: {
          onReady: ({ target }) => {
            if (cancelled) return
            playerRef.current = target
            setReady(true)
            if (inViewRef.current) {
              target.unMute()
              setMuted(false)
              if (savedTimeRef.current > 0) target.seekTo(savedTimeRef.current, true)
              target.playVideo()
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy()
      } catch {
        /* player may already be gone */
      }
      playerRef.current = null
    }
  }, [playerHostId])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const playFromSaved = () => {
      const player = playerRef.current
      if (!player) return
      player.unMute()
      setMuted(false)
      if (savedTimeRef.current > 0.25) {
        player.seekTo(savedTimeRef.current, true)
      }
      player.playVideo()
    }

    const pauseAndRemember = () => {
      const player = playerRef.current
      if (!player) return
      try {
        const t = player.getCurrentTime()
        if (Number.isFinite(t) && t >= 0) savedTimeRef.current = t
      } catch {
        /* ignore */
      }
      player.pauseVideo()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35
        inViewRef.current = visible
        if (!ready || !playerRef.current) return
        if (visible) playFromSaved()
        else pauseAndRemember()
      },
      { threshold: [0, 0.35, 0.5, 0.75] },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [ready])

  const toggleMute = () => {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      player.unMute()
      setMuted(false)
    } else {
      player.mute()
      setMuted(true)
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Sanveda in News"
      style={{
        ...creamSectionStyle(mobile, {
          width: mobile ? 'calc(100% - 32px)' : '94.44%',
          padding: mobile ? '32px 16px 28px' : '40px 34px 36px',
        }),
      }}
    >
      <SectionDivider title="Sanveda in News" mobile={mobile} />
      <p
        style={{
          margin: '0 auto 20px',
          maxWidth: 640,
          textAlign: 'center',
          fontFamily: 'Red Hat Display, sans-serif',
          fontSize: mobile ? 14 : 16,
          lineHeight: 1.55,
          color: C.textMuted,
        }}
      >
        Watch Sanveda featured in the news — playback starts when this section is on screen and
        resumes where you left off when you return.
      </p>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          borderRadius: mobile ? 12 : 16,
          overflow: 'hidden',
          background: '#0a1628',
          boxShadow: '0 12px 40px rgba(4, 27, 77, 0.12)',
          aspectRatio: '16 / 9',
        }}
      >
        <div
          id={playerHostId}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={!muted}
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            zIndex: 2,
            border: 'none',
            borderRadius: 999,
            padding: '8px 14px',
            fontFamily: 'Red Hat Display, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            color: '#fff',
            background: 'rgba(4, 27, 77, 0.82)',
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </section>
  )
}
