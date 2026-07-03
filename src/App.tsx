import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import { AdminAuthProvider } from './context/AdminAuthContext'
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogsPage from './pages/BlogsPage'
import BlogDetailPage from './pages/BlogDetailPage'
import MonthlyDonationPage from './pages/MonthlyDonationPage'
import LoginPage from './pages/LoginPage'
import DonorDashboardPage from './pages/DonorDashboardPage'
import DonateCheckoutPage from './pages/DonateCheckoutPage'
import DonationSuccessPage from './pages/DonationSuccessPage'
import FaqPage from './pages/FaqPage'
import DocumentsPage from './pages/DocumentsPage'
import ReturnPolicyPage from './pages/ReturnPolicyPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import FocusAreaPage from './pages/FocusAreaPage'
import VolunteerPage from './pages/VolunteerPage'
import VolunteerApplyPage from './pages/VolunteerApplyPage'
import VolunteerThankYouPage from './pages/VolunteerThankYouPage'
import VolunteerStatusPage from './pages/VolunteerStatusPage'
import MembershipPage from './pages/MembershipPage'
import MembershipApplyPage from './pages/MembershipApplyPage'
import MemberStatusPage from './pages/MemberStatusPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import CampaignAdminPage from './pages/admin/CampaignAdminPage'
import BlogAdminPage from './pages/admin/BlogAdminPage'
import DonationsAdminPage from './pages/admin/DonationsAdminPage'
import MembershipAdminPage from './pages/admin/MembershipAdminPage'
import BeneficiaryAdminPage from './pages/admin/BeneficiaryAdminPage'
import FinanceAdminPage from './pages/admin/FinanceAdminPage'
import MonthlyGivingAdminPage from './pages/admin/MonthlyGivingAdminPage'
import TransactionsAdminPage from './pages/admin/TransactionsAdminPage'
import VolunteerAdminPage from './pages/admin/VolunteerAdminPage'
import EnquiriesAdminPage from './pages/admin/EnquiriesAdminPage'
import InternshipAdminPage from './pages/admin/InternshipAdminPage'
import ProjectAdminPage from './pages/admin/ProjectAdminPage'
import EventAdminPage from './pages/admin/EventAdminPage'
import GalleryAdminPage from './pages/admin/GalleryAdminPage'
import UsersAdminPage from './pages/admin/UsersAdminPage'
import AuditAdminPage from './pages/admin/AuditAdminPage'
import ReportsAdminPage from './pages/admin/ReportsAdminPage'
import SettingsAdminPage from './pages/admin/SettingsAdminPage'
import DonorsAdminPage from './pages/admin/DonorsAdminPage'
import RolesAdminPage from './pages/admin/RolesAdminPage'
import {
  IncomeAdminPage,
  ExpensesAdminPage,
  TaxReceiptsAdminPage,
  CmsAdminPage,
  TestimonialsAdminPage,
} from './pages/admin/AdminAliasPages'
import DocumentsAdminPage from './pages/admin/DocumentsAdminPage'
import FocusAreasAdminPage from './pages/admin/FocusAreasAdminPage'
import GalleryPage from './pages/GalleryPage'
import VerifyPage from './pages/VerifyPage'
import InternshipPage from './pages/InternshipPage'
import InternshipApplyPage from './pages/InternshipApplyPage'
import InternshipStatusPage from './pages/InternshipStatusPage'
import EventsPage from './pages/EventsPage'
import NotFoundPage from './pages/NotFoundPage'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/verification', '/reset-password']
const HIDE_WHATSAPP = AUTH_PAGES

function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin')
}

function AppShell() {
  const { pathname } = useLocation()
  const showWhatsApp = !HIDE_WHATSAPP.includes(pathname) && !isAdminRoute(pathname)
  const showHeader = !HIDE_WHATSAPP.includes(pathname) && !isAdminRoute(pathname)
  const showFooter = !HIDE_WHATSAPP.includes(pathname) && !isAdminRoute(pathname)

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Red Hat Display, sans-serif' }}>
      {showHeader && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/focus-areas/:slug" element={<FocusAreaPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaign/:slug" element={<CampaignDetailPage />} />
          <Route path="/monthly-donation" element={<MonthlyDonationPage />} />
          <Route path="/donate-monthly" element={<MonthlyDonationPage />} />
          <Route path="/donate/checkout" element={<DonateCheckoutPage />} />
          <Route path="/donation/success" element={<DonationSuccessPage />} />
          <Route path="/dashboard" element={<DonorDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/search" element={<CampaignsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms-conditions" element={<TermsPage />} />
          <Route path="/terms&Conditions" element={<TermsPage />} />
          <Route path="/refund-cancellation" element={<RefundPolicyPage />} />
          <Route path="/refund&cancellation" element={<RefundPolicyPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/faq-page" element={<FaqPage />} />
          <Route path="/Faq-page" element={<FaqPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/volunteer/apply" element={<VolunteerApplyPage />} />
          <Route path="/volunteer/thank-you" element={<VolunteerThankYouPage />} />
          <Route path="/volunteer/status" element={<VolunteerStatusPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/membership/apply" element={<MembershipApplyPage />} />
          <Route path="/membership/status" element={<MemberStatusPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/internship" element={<InternshipPage />} />
          <Route path="/internship/apply" element={<InternshipApplyPage />} />
          <Route path="/internship/status" element={<InternshipStatusPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/campaigns" element={<CampaignAdminPage />} />
          <Route path="/admin/blogs" element={<BlogAdminPage />} />
          <Route path="/admin/donations" element={<DonationsAdminPage />} />
          <Route path="/admin/memberships" element={<MembershipAdminPage />} />
          <Route path="/admin/beneficiaries" element={<BeneficiaryAdminPage />} />
          <Route path="/admin/finance" element={<FinanceAdminPage />} />
          <Route path="/admin/volunteers" element={<VolunteerAdminPage />} />
          <Route path="/admin/enquiries" element={<EnquiriesAdminPage />} />
          <Route path="/admin/internships" element={<InternshipAdminPage />} />
          <Route path="/admin/projects" element={<ProjectAdminPage />} />
          <Route path="/admin/events" element={<EventAdminPage />} />
          <Route path="/admin/gallery" element={<GalleryAdminPage />} />
          <Route path="/admin/users" element={<UsersAdminPage />} />
          <Route path="/admin/audit" element={<AuditAdminPage />} />
          <Route path="/admin/reports" element={<ReportsAdminPage />} />
          <Route path="/admin/settings" element={<SettingsAdminPage />} />
          <Route path="/admin/donors" element={<DonorsAdminPage />} />
          <Route path="/admin/roles" element={<RolesAdminPage />} />
          <Route path="/admin/monthly-giving" element={<MonthlyGivingAdminPage />} />
          <Route path="/admin/transactions" element={<TransactionsAdminPage />} />
          <Route path="/admin/tax-receipts" element={<TaxReceiptsAdminPage />} />
          <Route path="/admin/income" element={<IncomeAdminPage />} />
          <Route path="/admin/expenses" element={<ExpensesAdminPage />} />
          <Route path="/admin/focus-areas" element={<FocusAreasAdminPage />} />
          <Route path="/admin/documents" element={<DocumentsAdminPage />} />
          <Route path="/admin/cms" element={<CmsAdminPage />} />
          <Route path="/admin/testimonials" element={<TestimonialsAdminPage />} />
          <Route path="/medical-campaigns" element={<CampaignsPage />} />
          <Route path="/urgent" element={<CampaignsPage />} />
          <Route path="/children" element={<CampaignsPage />} />
          <Route path="/animals" element={<CampaignsPage />} />
          <Route path="/disability" element={<CampaignsPage />} />
          <Route path="/disaster-relief" element={<CampaignsPage />} />
          <Route path="/education-campaigns" element={<CampaignsPage />} />
          <Route path="/elderly" element={<CampaignsPage />} />
          <Route path="/faith" element={<CampaignsPage />} />
          <Route path="/hunger" element={<CampaignsPage />} />
          <Route path="/diy" element={<CampaignsPage />} />
          <Route path="/women" element={<CampaignsPage />} />
          <Route path="/sports-campaigns" element={<CampaignsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      {showWhatsApp && <FloatingWhatsApp />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppShell />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
