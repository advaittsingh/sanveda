import type { ReactNode } from 'react'
import { ArrowDown, Mail, Users } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import { adminBtnSecondary } from '../ui/adminStyles'
import { formatIndianCompact } from '../../../lib/formatIndian'
import {
  BOARD_REPORT_TYPES,
  COMPLIANCE_REPORT_TYPES,
  FINANCIAL_REPORT_TYPES,
  REPORT_TEMPLATES_LIST,
  type ReportCategory,
  type ReportDashboardData,
} from '../../../lib/reportOperationsService'

interface Props {
  data: ReportDashboardData
  category: ReportCategory | 'all'
  onGenerate: (label: string) => void
}

function Section({ title, subtitle, children, show }: { title: string; subtitle?: string; children: ReactNode; show: boolean }) {
  if (!show) return null
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#0B2C6B]">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function MetricGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((m) => (
        <div key={m.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.label}</p>
          <p className="mt-1 text-lg font-bold text-[#0B2C6B]">{m.value}</p>
        </div>
      ))}
    </div>
  )
}

function ReportTypeList({ types, onGenerate }: { types: readonly string[]; onGenerate: (label: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {types.map((t) => (
        <button key={t} type="button" className={adminBtnSecondary} onClick={() => onGenerate(t)}>{t}</button>
      ))}
    </div>
  )
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

export default function ReportDomainPanels({ data, category, onGenerate }: Props) {
  const show = (cat: ReportCategory) => category === 'all' || category === cat

  return (
    <div className="space-y-10">
      <Section title="Donor Reports" subtitle="Per-donor impact statements and tax summaries" show={show('donor')}>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.donorReports.map((d) => (
            <AdminCard key={d.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{d.name}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Total Donations</dt><dd className="font-semibold">₹{formatIndianCompact(d.totalDonations)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Campaigns Supported</dt><dd className="font-semibold">{d.campaignsSupported}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Beneficiaries Impacted</dt><dd className="font-semibold">{d.beneficiariesImpacted}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tax Receipts</dt><dd className="font-semibold text-emerald-600">{d.taxReceiptsAvailable ? 'Available' : 'Pending'}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Donor Impact Statement', 'Donation History', 'Tax Summary', 'Annual Giving Report'].map((r) => (
                  <button key={r} type="button" className={adminBtnSecondary} onClick={() => onGenerate(`${r} — ${d.name}`)}>{r}</button>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Campaign Reports" subtitle="Goal, raised, utilization, donors, beneficiaries, and ROI" show={show('campaign')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.campaignReports.map((c) => (
            <AdminCard key={c.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{c.title}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div><p className="text-xs text-slate-500">Goal</p><p className="font-bold">₹{formatIndianCompact(c.goal)}</p></div>
                <div><p className="text-xs text-slate-500">Raised</p><p className="font-bold text-emerald-700">₹{formatIndianCompact(c.raised)}</p></div>
                <div><p className="text-xs text-slate-500">Utilized</p><p className="font-bold">₹{formatIndianCompact(c.utilized)}</p></div>
                <div><p className="text-xs text-slate-500">Beneficiaries</p><p className="font-bold">{c.beneficiaries}</p></div>
                <div><p className="text-xs text-slate-500">Donors</p><p className="font-bold">{c.donors}</p></div>
                <div><p className="text-xs text-slate-500">Completion / ROI</p><p className="font-bold">{c.completionPct}% · {c.roi}x</p></div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#0B2C6B]" style={{ width: `${c.completionPct}%` }} />
              </div>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Volunteer Reports" subtitle="Applications, approvals, hours served, and performance" show={show('volunteer')}>
        <MetricGrid items={[
          { label: 'Applications', value: String(data.volunteerMetrics.applications) },
          { label: 'Approved', value: String(data.volunteerMetrics.approved) },
          { label: 'Active', value: String(data.volunteerMetrics.active) },
          { label: 'Hours Served', value: data.volunteerMetrics.hoursServed.toLocaleString('en-IN') },
        ]} />
        <ReportTypeList types={['Volunteer Hours', 'Volunteer Performance', 'Volunteer Attendance', 'Volunteer Impact']} onGenerate={onGenerate} />
      </Section>

      <Section title="Beneficiary Reports" subtitle="Count, support provided, location and outcome analysis" show={show('beneficiary')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.beneficiaryReports.map((b) => (
            <AdminCard key={b.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{b.program}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div><p className="text-xs text-slate-500">Count</p><p className="text-xl font-bold">{b.count}</p></div>
                <div><p className="text-xs text-slate-500">Support</p><p className="text-xl font-bold">₹{formatIndianCompact(b.supportProvided)}</p></div>
                <div><p className="text-xs text-slate-500">Recovered</p><p className="text-xl font-bold text-emerald-700">{b.recovered}</p></div>
              </div>
            </AdminCard>
          ))}
        </div>
        <ReportTypeList types={['Beneficiary Count', 'Support Provided', 'Location Analysis', 'Category Analysis', 'Outcome Reports', 'Success Stories']} onGenerate={onGenerate} />
      </Section>

      <Section title="Project Reports" subtitle="Budget, funds, beneficiaries, volunteers, and outcomes" show={show('project')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.projectReports.map((p) => (
            <AdminCard key={p.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{p.title}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div><p className="text-xs text-slate-500">Budget</p><p className="font-bold">₹{formatIndianCompact(p.budget)}</p></div>
                <div><p className="text-xs text-slate-500">Received</p><p className="font-bold">₹{formatIndianCompact(p.received)}</p></div>
                <div><p className="text-xs text-slate-500">Utilized</p><p className="font-bold">₹{formatIndianCompact(p.utilized)}</p></div>
                <div><p className="text-xs text-slate-500">Beneficiaries</p><p className="font-bold">{p.beneficiaries.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-slate-500">Volunteers</p><p className="font-bold">{p.volunteers}</p></div>
                <div><p className="text-xs text-slate-500">Events</p><p className="font-bold">{p.events}</p></div>
              </div>
              <ReportTypeList types={['Media Assets', 'Documents', 'Outcomes']} onGenerate={(l) => onGenerate(`${l} — ${p.title}`)} />
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Financial Reports" subtitle="Income, balance sheet, cash flow, and audit" show={show('financial')}>
        <ReportTypeList types={FINANCIAL_REPORT_TYPES} onGenerate={onGenerate} />
      </Section>

      <Section title="Grant Reports" subtitle="Allocated, spent, remaining, and milestone tracking" show={show('grant')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.grantReports.map((g) => (
            <AdminCard key={g.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{g.name}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div><p className="text-xs text-slate-500">Allocated</p><p className="font-bold">₹{formatIndianCompact(g.allocated)}</p></div>
                <div><p className="text-xs text-slate-500">Spent</p><p className="font-bold">₹{formatIndianCompact(g.spent)}</p></div>
                <div><p className="text-xs text-slate-500">Remaining</p><p className="font-bold text-emerald-700">₹{formatIndianCompact(g.remaining)}</p></div>
                <div><p className="text-xs text-slate-500">Milestones</p><p className="font-bold">{g.milestonesPct}%</p></div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${g.milestonesPct}%` }} />
              </div>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="NGO Compliance Reports" subtitle="80G, 12A, FCRA, CSR, audit, and government filings" show={show('compliance')}>
        <ReportTypeList types={COMPLIANCE_REPORT_TYPES} onGenerate={onGenerate} />
      </Section>

      <Section title="Impact Reports" subtitle="The core NGO report — funds, beneficiaries, volunteers, and outcomes" show={show('impact')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.impactReports.map((r) => (
            <AdminCard key={r.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{r.program}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div><p className="text-xs text-slate-500">Funds Raised</p><p className="font-bold">₹{formatIndianCompact(r.fundsRaised)}</p></div>
                <div><p className="text-xs text-slate-500">Funds Utilized</p><p className="font-bold">₹{formatIndianCompact(r.fundsUtilized)}</p></div>
                <div><p className="text-xs text-slate-500">Beneficiaries</p><p className="font-bold">{r.beneficiaries.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-slate-500">Volunteers</p><p className="font-bold">{r.volunteers}</p></div>
                <div><p className="text-xs text-slate-500">Events</p><p className="font-bold">{r.events}</p></div>
                <div><p className="text-xs text-slate-500">Recovery Rate</p><p className="font-bold text-emerald-700">{r.outcomeRate}%</p></div>
              </div>
            </AdminCard>
          ))}
        </div>
      </Section>

      <Section title="Executive Dashboard Reports" subtitle="Board-level reports for trustees and management" show={show('board')}>
        <ReportTypeList types={BOARD_REPORT_TYPES} onGenerate={onGenerate} />
      </Section>

      <Section title="Operational Reports" subtitle="Cross-module operational summaries" show={show('operational')}>
        <ReportTypeList types={['Daily Operations Summary', 'Weekly Activity Report', 'Monthly NGO Dashboard', 'Staff Performance Report']} onGenerate={onGenerate} />
      </Section>

      <Section title="Scheduled Reports" subtitle="Automated report delivery on recurring schedules" show={category === 'all'}>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.scheduledReports.map((s) => (
            <AdminCard key={s.id}>
              <h3 className="font-semibold text-[#0B2C6B]">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{FREQ_LABEL[s.frequency]} · Next: {s.nextRun}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {s.recipients.map((r) => (
                  <span key={r} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">{r}</span>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Frequencies: Daily · Weekly · Monthly · Quarterly · Annually</p>
      </Section>

      <Section title="Email Automation" subtitle="Generate → PDF → Excel → Email stakeholders" show={category === 'all'}>
        <AdminCard>
          <div className="flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-center sm:gap-4">
            {['Generate Report', 'Create PDF', 'Attach Excel', 'Email Stakeholders'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#0B2C6B]">{step}</span>
                {i < arr.length - 1 ? <ArrowDown size={16} className="rotate-90 text-slate-400 sm:rotate-0" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Mail size={16} className="text-slate-400" />
            {['Board Members', 'CSR Partners', 'Auditors', 'Donors', 'Government', 'Internal Teams'].map((r) => (
              <span key={r} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{r}</span>
            ))}
          </div>
        </AdminCard>
      </Section>

      <Section title="Predefined Templates" subtitle="One-click reports for common NGO needs" show={category === 'all'}>
        <div className="flex flex-wrap gap-2">
          {REPORT_TEMPLATES_LIST.map((t) => (
            <button key={t} type="button" className={adminBtnSecondary} onClick={() => onGenerate(t)}>{t}</button>
          ))}
        </div>
      </Section>

      <Section title="Reporting Architecture" subtitle="Enterprise NGO reporting engine" show={category === 'all'}>
        <AdminCard>
          <div className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
            {[
              { title: 'People Reports', items: ['Donors', 'Volunteers', 'Members', 'Beneficiaries', 'Interns'] },
              { title: 'Program Reports', items: ['Projects', 'Campaigns', 'Events', 'Focus Areas'] },
              { title: 'Financial Reports', items: ['Income', 'Expenses', 'Grants', 'Budgets', 'Audit'] },
              { title: 'Compliance Reports', items: ['FCRA', 'CSR', '80G', '12A', 'Government'] },
              { title: 'Impact Reports', items: ['SDGs', 'Beneficiaries', 'Outcomes', 'ROI', 'Success Stories'] },
              { title: 'AI Reports', items: ['Predictions', 'Trends', 'Insights', 'Recommendations'] },
            ].map((group) => (
              <div key={group.title} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                <h4 className="flex items-center gap-2 font-semibold text-[#0B2C6B]">
                  <Users size={14} /> {group.title}
                </h4>
                <ul className="mt-2 space-y-1 text-slate-600">
                  {group.items.map((item) => (
                    <li key={item}>├── {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AdminCard>
      </Section>
    </div>
  )
}
