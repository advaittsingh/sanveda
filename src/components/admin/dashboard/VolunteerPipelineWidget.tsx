import { Link } from 'react-router-dom'
import type { VolunteerPipeline } from '../../../lib/operationsDashboardService'
import AdminCard from '../ui/AdminCard'

export default function VolunteerPipelineWidget({ pipeline }: { pipeline: VolunteerPipeline }) {
  const stages = [
    { label: 'Applied', value: pipeline.applied },
    { label: 'Screening', value: pipeline.screening },
    { label: 'Interview', value: pipeline.interview },
    { label: 'Approved', value: pipeline.approved },
    { label: 'Active', value: pipeline.active },
  ]

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0B2C6B]">Volunteer Pipeline</h3>
        <Link to="/admin/volunteers" className="text-xs font-medium text-[#0E4FA8] hover:underline">Manage</Link>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {stages.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-center">
            <p className="text-lg font-bold text-[#0B2C6B]">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
