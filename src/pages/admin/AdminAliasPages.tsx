import AdminLogin from '../../components/admin/AdminLogin'
import AdminShell from '../../components/admin/AdminShell'
import AdminCard from '../../components/admin/ui/AdminCard'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { Navigate } from 'react-router-dom'
import FinanceAdminPage from './FinanceAdminPage'

function PlaceholderAdminPage({ title, subtitle }: { title: string; subtitle: string }) {
  const { authed } = useAdminAuth()
  if (!authed) return <AdminLogin title={title} subtitle={subtitle} />
  return (
    <AdminShell title={title} subtitle={subtitle}>
      <AdminCard>
        <p className="text-sm text-slate-600">
          This module is wired in the NGO OS navigation. Full CMS controls can be connected to your Supabase content tables.
        </p>
      </AdminCard>
    </AdminShell>
  )
}

export function IncomeAdminPage() {
  return <FinanceAdminPage defaultTab="income" />
}

export function ExpensesAdminPage() {
  return <FinanceAdminPage defaultTab="expenses" />
}

export function TaxReceiptsAdminPage() {
  return <Navigate to="/admin/donations" replace />
}

export function FocusAreasAdminPage() {
  return <PlaceholderAdminPage title="Focus Areas" subtitle="Manage focus area content and campaign mappings." />
}

export function DocumentsAdminPage() {
  return <PlaceholderAdminPage title="Documents" subtitle="Manage public documents and compliance files." />
}

export function CmsAdminPage() {
  return <PlaceholderAdminPage title="CMS" subtitle="Content management for homepage sections and banners." />
}

export function TestimonialsAdminPage() {
  return <PlaceholderAdminPage title="Testimonials" subtitle="Manage donor testimonials displayed on the website." />
}
