import { GraduationCap } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import type { InternshipDashboardData } from '../../../lib/internshipOperationsService'
import { INTERNSHIP_PROGRAMS } from '../../../lib/internshipOperationsService'

interface Props {
  programs: string[]
  alumniStats: InternshipDashboardData['alumniStats']
}

export default function InternshipProgramsAlumni({ programs, alumniStats }: Props) {
  const programList = programs.length ? programs : [...INTERNSHIP_PROGRAMS]

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#0B2C6B]">Internship Programs</h3>
          <p className="text-sm text-slate-500">Structured programmes across Sanveda domains</p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {programList.map((p) => (
            <li key={p} className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm font-medium text-slate-700">
              {p}
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap size={18} className="text-[#0B2C6B]" />
          <div>
            <h3 className="text-base font-semibold text-[#0B2C6B]">Intern Alumni Network</h3>
            <p className="text-sm text-slate-500">Total Alumni: {alumniStats.totalAlumni}</p>
          </div>
        </div>
        {alumniStats.outcomes.length ? (
          <ul className="space-y-2">
            {alumniStats.outcomes.map((o) => (
              <li key={o.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2">
                <span className="text-sm font-medium text-slate-700">✓ {o.label}</span>
                <span className="text-sm font-semibold text-[#0B2C6B]">{o.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">Alumni outcomes will appear as internships are completed.</p>
        )}
      </AdminCard>
    </div>
  )
}
