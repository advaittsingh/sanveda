import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { globalAdminSearch, type SearchResult } from '../../../lib/adminSearchService'
import { useAdminLayout } from '../../../context/AdminLayoutContext'

export default function GlobalSearch() {
  const { searchQuery, setSearchQuery } = useAdminLayout()
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(() => {
      globalAdminSearch(searchQuery).then((r) => {
        setResults(r)
        setOpen(r.length > 0)
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xl">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search campaigns, donors, volunteers, beneficiaries…"
        className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0B2C6B]/30 focus:ring-2 focus:ring-[#0B2C6B]/10"
      />
      {open && results.length > 0 && (
        <>
          <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close search" />
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-2 shadow-xl">
            {results.map((r) => (
              <Link
                key={r.id}
                to={r.to}
                onClick={() => { setOpen(false); setSearchQuery('') }}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F8FAFC]"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.title}</p>
                  {r.subtitle ? <p className="text-xs text-slate-500">{r.subtitle}</p> : null}
                </div>
                <span className="rounded-full bg-[#0B2C6B]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#0B2C6B]">{r.type}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
