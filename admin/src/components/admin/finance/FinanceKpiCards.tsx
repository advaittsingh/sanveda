import { IndianRupee, Lock, TrendingDown, TrendingUp, Unlock, Wallet } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { formatIndianCompact } from '../../../lib/formatIndian'
import type { FinanceDashboardData } from '../../../lib/financeOperationsService'

interface Props {
  kpis: FinanceDashboardData['kpis']
}

export default function FinanceKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Income" value={kpis.totalIncome} prefix="₹" sub={formatIndianCompact(kpis.totalIncome)} icon={TrendingUp} accent="green" delay={0} />
      <StatCard label="Total Expenses" value={kpis.totalExpenses} prefix="₹" sub={formatIndianCompact(kpis.totalExpenses)} icon={TrendingDown} accent="secondary" delay={0.05} />
      <StatCard label="Net Balance" value={kpis.netBalance} prefix="₹" sub={formatIndianCompact(kpis.netBalance)} icon={Wallet} delay={0.1} />
      <StatCard label="Restricted Funds" value={kpis.restrictedFunds} prefix="₹" sub={formatIndianCompact(kpis.restrictedFunds)} icon={Lock} accent="blue" delay={0.15} />
      <StatCard label="Unrestricted Funds" value={kpis.unrestrictedFunds} prefix="₹" sub={formatIndianCompact(kpis.unrestrictedFunds)} icon={Unlock} accent="green" delay={0.2} />
      <StatCard label="Pending Receivables" value={kpis.pendingReceivables} prefix="₹" sub={formatIndianCompact(kpis.pendingReceivables)} icon={IndianRupee} accent="secondary" delay={0.25} />
    </div>
  )
}
