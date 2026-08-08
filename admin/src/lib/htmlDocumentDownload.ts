/** Shared browser helpers for admin certificate / ID card / letter generation. */

export function downloadHtmlDocument(html: string, filename: string): void {
  const safeName = filename.replace(/[^\w.\-()]+/g, '_') || 'document.html'
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = safeName.endsWith('.html') ? safeName : `${safeName}.html`
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Print HTML without relying on pop-ups (hidden iframe + print dialog). */
export async function printHtmlDocument(html: string): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.title = 'document-print'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    throw new Error('Could not open the print dialog.')
  }

  doc.open()
  doc.write(html)
  doc.close()

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  try {
    win.focus()
    win.print()
  } finally {
    window.setTimeout(() => iframe.remove(), 1500)
  }
}

/** Open HTML in a new tab (blob URL) when an in-app preview is unavailable. */
export function openHtmlDocument(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    throw new Error('Pop-up blocked. Allow pop-ups for this site, or use Download / Print instead.')
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Run several document downloads sequentially so browsers do not block later files. */
export async function downloadHtmlDocumentsSequential(
  items: Array<{ html: string; filename: string }>,
): Promise<number> {
  let count = 0
  for (const item of items) {
    downloadHtmlDocument(item.html, item.filename)
    count += 1
    await new Promise((resolve) => window.setTimeout(resolve, 350))
  }
  return count
}
