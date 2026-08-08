export function formatIndianCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatTrend(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) {
    return current > 0 ? { text: '↑ new', positive: true } : { text: '—', positive: true }
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { text: '—', positive: true }
  return { text: `${pct > 0 ? '↑' : '↓'}${Math.abs(pct)}%`, positive: pct >= 0 }
}

export function currentFinancialYear(): string {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const next = (year + 1) % 100
  return `${year}-${String(next).padStart(2, '0')}`
}
