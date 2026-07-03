import { Link } from 'react-router-dom'
import AdminCard from '../ui/AdminCard'
import { adminBtnPrimary } from '../ui/adminStyles'

export default function FinanceTaxReceiptsPanel() {
  return (
    <AdminCard>
      <h3 className="mb-2 text-base font-semibold text-[#0B2C6B]">Tax Receipts (80G)</h3>
      <p className="mb-4 text-sm text-slate-500">
        Full donation receipt and tax compliance system — 80G certificates, bulk generation, email automation, and verification.
      </p>
      <Link to="/admin/tax-receipts" className={adminBtnPrimary}>
        Open Tax Receipts Center
      </Link>
    </AdminCard>
  )
}
