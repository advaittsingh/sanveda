import { Link } from 'react-router-dom'
import AdminCard from '../ui/AdminCard'
import { adminBtnPrimary } from '../ui/adminStyles'

export default function FinanceTaxReceiptsPanel() {
  return (
    <AdminCard>
      <h3 className="mb-2 text-base font-semibold text-[#0B2C6B]">Tax Receipts (80G)</h3>
      <p className="mb-4 text-sm text-slate-500">
        Tax receipt generation and donor 80G certificates are managed in the Donations module with full reconciliation.
      </p>
      <Link to="/admin/donations" className={adminBtnPrimary}>
        Open Donations & Tax Receipts
      </Link>
    </AdminCard>
  )
}
