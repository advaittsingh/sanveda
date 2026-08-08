import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  alt: string
}

/** Renders the first page of a PDF into a canvas for card thumbnails. */
export default function DocumentPdfCanvasPreview({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    setStatus('loading')

    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjs.getDocument({ url: src, withCredentials: false }).promise
        if (cancelled) return

        const page = await pdf.getPage(1)
        if (cancelled) return

        const width = container.clientWidth || 385
        const height = container.clientHeight || 546
        const unscaled = page.getViewport({ scale: 1 })
        const scale = Math.min(width / unscaled.width, height / unscaled.height)
        const viewport = page.getViewport({ scale: scale * Math.max(1, window.devicePixelRatio) })

        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        const context = canvas.getContext('2d')
        if (!context || cancelled) return

        await page.render({ canvas, canvasContext: context, viewport }).promise
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('fallback')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [src])

  if (status === 'fallback') {
    return (
      <div className="document-card-pdf-fallback" role="img" aria-label={alt}>
        <span className="document-card-pdf-fallback-badge">PDF</span>
        <p className="document-card-pdf-fallback-title">{alt}</p>
        <p className="document-card-pdf-fallback-hint">Open preview to view</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="document-card-pdf-canvas-wrap" data-loading={status === 'loading' || undefined}>
      <canvas ref={canvasRef} className="document-card-pdf-canvas" aria-label={alt} />
    </div>
  )
}
