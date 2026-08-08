import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useState } from 'react'

const CREATES = [
  { label: 'Campaign', to: '/admin/campaigns' },
  { label: 'Donation', to: '/admin/donations' },
  { label: 'Volunteer', to: '/admin/volunteers' },
  { label: 'Beneficiary', to: '/admin/beneficiaries' },
  { label: 'Event', to: '/admin/events' },
  { label: 'Blog', to: '/admin/blogs' },
]

export default function QuickCreateMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B2C6B] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0a2459]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Create</span>
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close create menu" />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
            {CREATES.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-[#F8FAFC]"
              >
                <Plus size={14} className="text-[#0E4FA8]" />
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
