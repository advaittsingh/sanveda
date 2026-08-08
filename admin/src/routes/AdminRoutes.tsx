import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRouteGuard from '../components/admin/AdminRouteGuard'
import AdminCard from '../components/admin/ui/AdminCard'

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const CampaignAdminPage = lazy(() => import('../pages/admin/CampaignAdminPage'))
const BlogAdminPage = lazy(() => import('../pages/admin/BlogAdminPage'))
const DonationsAdminPage = lazy(() => import('../pages/admin/DonationsAdminPage'))
const MembershipAdminPage = lazy(() => import('../pages/admin/MembershipAdminPage'))
const BeneficiaryAdminPage = lazy(() => import('../pages/admin/BeneficiaryAdminPage'))
const FinanceAdminPage = lazy(() => import('../pages/admin/FinanceAdminPage'))
const VolunteerAdminPage = lazy(() => import('../pages/admin/VolunteerAdminPage'))
const EnquiriesAdminPage = lazy(() => import('../pages/admin/EnquiriesAdminPage'))
const InternshipAdminPage = lazy(() => import('../pages/admin/InternshipAdminPage'))
const ProjectAdminPage = lazy(() => import('../pages/admin/ProjectAdminPage'))
const EventAdminPage = lazy(() => import('../pages/admin/EventAdminPage'))
const GalleryAdminPage = lazy(() => import('../pages/admin/GalleryAdminPage'))
const UsersAdminPage = lazy(() => import('../pages/admin/UsersAdminPage'))
const AuditAdminPage = lazy(() => import('../pages/admin/AuditAdminPage'))
const ReportsAdminPage = lazy(() => import('../pages/admin/ReportsAdminPage'))
const SettingsAdminPage = lazy(() => import('../pages/admin/SettingsAdminPage'))
const DonorsAdminPage = lazy(() => import('../pages/admin/DonorsAdminPage'))
const RolesAdminPage = lazy(() => import('../pages/admin/RolesAdminPage'))
const MonthlyGivingAdminPage = lazy(() => import('../pages/admin/MonthlyGivingAdminPage'))
const TransactionsAdminPage = lazy(() => import('../pages/admin/TransactionsAdminPage'))
const TaxReceiptsAdminPage = lazy(() => import('../pages/admin/TaxReceiptsAdminPage'))
const ExpensesAdminPage = lazy(() => import('../pages/admin/ExpensesAdminPage'))
const FocusAreasAdminPage = lazy(() => import('../pages/admin/FocusAreasAdminPage'))
const DocumentsAdminPage = lazy(() => import('../pages/admin/DocumentsAdminPage'))
const TasksAdminPage = lazy(() => import('../pages/admin/TasksAdminPage'))
const CmsAdminPage = lazy(() => import('../pages/admin/CmsAdminPage'))
const TestimonialsAdminPage = lazy(() => import('../pages/admin/TestimonialsAdminPage'))
const IncomeAdminPage = lazy(() => import('../pages/admin/AdminAliasPages').then((m) => ({ default: m.IncomeAdminPage })))
const AdminNotFoundPage = lazy(() => import('../pages/admin/AdminNotFoundPage'))

function AdminFallback() {
  return (
    <AdminCard>
      <p className="text-sm text-slate-500">Loading module…</p>
    </AdminCard>
  )
}

export default function AdminRoutes() {
  return (
    <AdminRouteGuard>
      <Suspense fallback={<AdminFallback />}>
        <Routes>
          <Route path="/" element={<AdminDashboardPage />} />
          <Route path="/campaigns" element={<CampaignAdminPage />} />
          <Route path="/blogs" element={<BlogAdminPage />} />
          <Route path="/donations" element={<DonationsAdminPage />} />
          <Route path="/memberships" element={<MembershipAdminPage />} />
          {/* Sidebar label is "Members"; common short URL should land on memberships, not a blank page. */}
          <Route path="/members" element={<Navigate to="/admin/memberships" replace />} />
          <Route path="/beneficiaries" element={<BeneficiaryAdminPage />} />
          <Route path="/finance" element={<FinanceAdminPage />} />
          <Route path="/volunteers" element={<VolunteerAdminPage />} />
          <Route path="/enquiries" element={<EnquiriesAdminPage />} />
          <Route path="/internships" element={<InternshipAdminPage />} />
          <Route path="/projects" element={<ProjectAdminPage />} />
          <Route path="/events" element={<EventAdminPage />} />
          <Route path="/gallery" element={<GalleryAdminPage />} />
          <Route path="/users" element={<UsersAdminPage />} />
          <Route path="/audit" element={<AuditAdminPage />} />
          <Route path="/reports" element={<ReportsAdminPage />} />
          <Route path="/settings" element={<SettingsAdminPage />} />
          <Route path="/donors" element={<DonorsAdminPage />} />
          <Route path="/roles" element={<RolesAdminPage />} />
          <Route path="/monthly-giving" element={<MonthlyGivingAdminPage />} />
          <Route path="/transactions" element={<TransactionsAdminPage />} />
          <Route path="/tax-receipts" element={<TaxReceiptsAdminPage />} />
          <Route path="/income" element={<IncomeAdminPage />} />
          <Route path="/expenses" element={<ExpensesAdminPage />} />
          <Route path="/focus-areas" element={<FocusAreasAdminPage />} />
          <Route path="/documents" element={<DocumentsAdminPage />} />
          <Route path="/tasks" element={<TasksAdminPage />} />
          <Route path="/cms" element={<CmsAdminPage />} />
          <Route path="/testimonials" element={<TestimonialsAdminPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Routes>
      </Suspense>
    </AdminRouteGuard>
  )
}
