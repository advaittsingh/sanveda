import { useEffect, useRef, useState } from 'react'
import { buildPdfViewerUrl } from '../../constants/documentsContent'

interface Props {
  src: string
  alt: string
}

/** Renders the first page of a PDF into a canvas for card thumbnails. */
export default function DocumentPdfCanvasPreview({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjs.getDocument({ url: src }).promise
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
      } catch {
        if (!cancelled) setFallback(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [src])

  if (fallback) {
    return (
      <iframe
        src={buildPdfViewerUrl(src)}
        title={alt}
        className="document-card-pdf-frame"
        loading="lazy"
      />
    )
  }

  return (
    <div ref={containerRef} className="document-card-pdf-canvas-wrap">
      <canvas ref={canvasRef} className="document-card-pdf-canvas" aria-label={alt} />
    </div>
  )
}
