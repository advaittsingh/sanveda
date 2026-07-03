import AdminCard from '../ui/AdminCard'
import type { VolunteerTeamSummary } from '../../../lib/volunteerOperationsService'

interface Props {
  teams: VolunteerTeamSummary[]
}

export default function VolunteerTeamManagement({ teams }: Props) {
  return (
    <AdminCard>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#0B2C6B]">Team Management</h3>
        <p className="text-sm text-slate-500">Volunteer teams by department</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {teams.map((team) => (
          <div
            key={team.name}
            className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4 transition hover:border-[#0E4FA8]/30"
          >
            <p className="font-semibold text-[#0B2C6B]">{team.name}</p>
            <p className="mt-1 text-2xl font-bold text-[#0E4FA8]">{team.count}</p>
            <p className="text-xs text-slate-500">Volunteers</p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
