import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import RouteSeo from './components/RouteSeo'

const HomePage = lazy(() => import('./pages/HomePage'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'))
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogsPage = lazy(() => import('./pages/BlogsPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const MonthlyDonationPage = lazy(() => import('./pages/MonthlyDonationPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DonorDashboardPage = lazy(() => import('./pages/DonorDashboardPage'))
const ServicePortalPage = lazy(() => import('./pages/ServicePortalPage'))
const DonateCheckoutPage = lazy(() => import('./pages/DonateCheckoutPage'))
const DonationSuccessPage = lazy(() => import('./pages/DonationSuccessPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage'))
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const FocusAreaPage = lazy(() => import('./pages/FocusAreaPage'))
const VolunteerPage = lazy(() => import('./pages/VolunteerPage'))
const VolunteerApplyPage = lazy(() => import('./pages/VolunteerApplyPage'))
const VolunteerThankYouPage = lazy(() => import('./pages/VolunteerThankYouPage'))
const VolunteerStatusPage = lazy(() => import('./pages/VolunteerStatusPage'))
const MembershipPage = lazy(() => import('./pages/MembershipPage'))
const MembershipApplyPage = lazy(() => import('./pages/MembershipApplyPage'))
const MemberStatusPage = lazy(() => import('./pages/MemberStatusPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const VerifyPage = lazy(() => import('./pages/VerifyPage'))
const InternshipPage = lazy(() => import('./pages/InternshipPage'))
const InternshipApplyPage = lazy(() => import('./pages/InternshipApplyPage'))
const InternshipStatusPage = lazy(() => import('./pages/InternshipStatusPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/verification', '/reset-password']
const HIDE_WHATSAPP = AUTH_PAGES

function AppShell() {
  const { pathname } = useLocation()
  const showWhatsApp = !HIDE_WHATSAPP.includes(pathname)
  const showHeader = !HIDE_WHATSAPP.includes(pathname)
  const showFooter = !HIDE_WHATSAPP.includes(pathname)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'Red Hat Display, sans-serif' }}
    >
      <RouteSeo />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {showHeader && <Header />}
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              className="grid min-h-[40vh] place-items-center text-slate-600"
            >
              Loading page…
            </div>
          }
        >
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
            <Route path="/portal" element={<ServicePortalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/search" element={<CampaignsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/reset-password" element={<LoginPage />} />
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
            <Route path="/verify/:code" element={<VerifyPage />} />
            <Route path="/internship" element={<InternshipPage />} />
            <Route path="/internship/apply" element={<InternshipApplyPage />} />
            <Route path="/internship/status" element={<InternshipStatusPage />} />
            <Route path="/events" element={<EventsPage />} />
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
        </Suspense>
      </main>
      {showFooter && <Footer />}
      {showWhatsApp && <FloatingWhatsApp />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
