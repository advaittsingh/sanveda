function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function printHtmlReport(title: string, subtitle: string, sections: string[]) {
  const popup = window.open('', '_blank', 'width=960,height=720')
  if (!popup) return

  popup.document.write(`<!doctype html>
  <html>
    <head>
      <title>${escapeHtml(title)}</title>
      <style>
        body {
          font-family: Inter, Arial, sans-serif;
          color: #0f172a;
          padding: 32px;
          line-height: 1.5;
        }
        h1 {
          margin: 0;
          color: #0B2C6B;
          font-size: 28px;
        }
        p {
          margin: 6px 0 18px;
          color: #475569;
        }
        section {
          margin-top: 20px;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 18px;
        }
        h2 {
          margin: 0 0 12px;
          color: #0B2C6B;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th, td {
          border-bottom: 1px solid #E5E7EB;
          padding: 10px 8px;
          text-align: left;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .metric {
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 12px;
        }
        .metric-label {
          font-size: 12px;
          color: #64748B;
        }
        .metric-value {
          margin-top: 4px;
          color: #0B2C6B;
          font-size: 20px;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
      ${sections.join('')}
    </body>
  </html>`)
  popup.document.close()
  popup.focus()
  popup.print()
}

export function renderMetricSection(title: string, metrics: Array<{ label: string; value: string }>): string {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <div class="metric-grid">
      ${metrics
        .map(
          (metric) => `<div class="metric">
            <div class="metric-label">${escapeHtml(metric.label)}</div>
            <div class="metric-value">${escapeHtml(metric.value)}</div>
          </div>`,
        )
        .join('')}
    </div>
  </section>`
}

export function renderTableSection(title: string, headers: string[], rows: string[][]): string {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </section>`
}
