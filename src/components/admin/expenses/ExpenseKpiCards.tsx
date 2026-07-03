import { AlertTriangle, CheckCircle, Clock, IndianRupee, TrendingUp, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { ExpenseDashboardData } from '../../../lib/expenseOperationsService'

interface Props {
  kpis: ExpenseDashboardData['kpis']
}

export default function ExpenseKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Expenses" value={kpis.totalExpenses} prefix="₹" sub={formatIndianCompact(kpis.totalExpenses)} icon={IndianRupee} delay={0} />
      <StatCard label="Approved Expenses" value={kpis.approvedExpenses} prefix="₹" sub={formatIndianCompact(kpis.approvedExpenses)} icon={CheckCircle} accent="green" delay={0.05} />
      <StatCard label="Pending Approvals" value={kpis.pendingApprovals} prefix="₹" sub={formatIndianCompact(kpis.pendingApprovals)} icon={Clock} accent="secondary" delay={0.1} />
      <StatCard label="Budget Utilization" value={kpis.budgetUtilizationPct} suffix="%" icon={TrendingUp} accent="blue" delay={0.15} />
      <StatCard label="Overdue Payments" value={kpis.overduePayments} prefix="₹" sub={formatIndianCompact(kpis.overduePayments)} icon={AlertTriangle} accent="secondary" delay={0.2} />
      <StatCard label="Active Vendors" value={kpis.activeVendors} icon={Users} accent="green" delay={0.25} />
    </div>
  )
}
