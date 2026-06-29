import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogsPage from './pages/BlogsPage'
import BlogDetailPage from './pages/BlogDetailPage'
import MonthlyDonationPage from './pages/MonthlyDonationPage'
import StartCampaignPage from './pages/StartCampaignPage'
import LifePage from './pages/LifePage'
import SmallVendorsPage from './pages/SmallVendorsPage'
import VendorDetailPage from './pages/VendorDetailPage'
import LoginPage from './pages/LoginPage'
import FaqPage from './pages/FaqPage'
import DocumentsPage from './pages/DocumentsPage'
import LegalPage from './pages/LegalPage'
import FocusAreaPage from './pages/FocusAreaPage'
import NotFoundPage from './pages/NotFoundPage'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/verification', '/reset-password']
const HIDE_WHATSAPP = AUTH_PAGES

function AppShell() {
  const { pathname } = useLocation()
  const showWhatsApp = !HIDE_WHATSAPP.includes(pathname)
  const showHeader = !AUTH_PAGES.includes(pathname)
  const showFooter = !AUTH_PAGES.includes(pathname)

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
          <Route path="/start-campaign" element={<StartCampaignPage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/small-vendors" element={<SmallVendorsPage />} />
          <Route path="/small-vendors/:slug" element={<VendorDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/search" element={<CampaignsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<LegalPage sectionName="privacy policy" pageTitle="Privacy Policy" />} />
          <Route path="/terms-conditions" element={<LegalPage sectionName="Terms & conditions" pageTitle="Terms & Conditions" />} />
          <Route path="/terms&Conditions" element={<LegalPage sectionName="Terms & conditions" pageTitle="Terms & Conditions" />} />
          <Route path="/refund-cancellation" element={<LegalPage sectionName="Refund policy" pageTitle="Refund Policy" />} />
          <Route path="/refund&cancellation" element={<LegalPage sectionName="Refund policy" pageTitle="Refund Policy" />} />
          <Route path="/return-policy" element={<LegalPage sectionName="return policy" pageTitle="Return Policy" />} />
          <Route path="/faq-page" element={<FaqPage />} />
          <Route path="/Faq-page" element={<FaqPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
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
      <AppShell />
    </BrowserRouter>
  )
}
