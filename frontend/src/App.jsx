import { Link, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import { CustomerRegisterPage, LoginPage, PartnerRegisterPage } from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { MemberServicesPage, PublicServicesPage } from './pages/ServicesPage.jsx';
import AdminServicesPage from './pages/AdminServicesPage.jsx';
import PartnerLandingPage from './pages/PartnerLandingPage.jsx';
import { AdminOrdersPage, MemberOrderDetailPage, MemberOrdersPage } from './pages/OrdersPage.jsx';
import { AdminReceiptsPage, MemberPaymentsPage } from './pages/ReceiptsPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminCustomersPage from './pages/AdminCustomersPage.jsx';
import AdminPartnersPage from './pages/AdminPartnersPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import CookieBanner from './components/CookieBanner.jsx';

function PlaceholderPage({ title }) {
  return <main className="mx-auto max-w-6xl px-5 py-20"><h1 className="text-3xl font-bold text-slate-900">{title}</h1><p className="mt-3 text-slate-600">This page will be implemented in a later phase.</p></main>;
}

export default function App() {
  const location = useLocation();
  const isAdminWorkspace = location.pathname.startsWith('/admin/') && location.pathname !== '/admin/login';
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {!isAdminWorkspace && <header className="border-b border-slate-200/70 bg-[#faf8f4]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/"><img src="/brand/official-logo.png" alt="E CAFE HIMACHAL" className="h-11 w-48 object-contain object-left sm:w-60"/></Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link className="hidden md:block hover:text-[#276052]" to="/">Home</Link>
            <Link className="hidden sm:block hover:text-[#276052]" to="/services">Services</Link>
            <a className="hidden md:block hover:text-[#276052]" href="/#how-it-works">How It Works</a>
            <Link className="hidden md:block hover:text-[#276052]" to="/about">About</Link>
            <Link className="rounded-full border border-[#276052] px-4 py-2 text-[#143f3a] hover:bg-white" to="/login">Login</Link>
            <Link className="hidden rounded-full bg-[#143f3a] px-4 py-2 text-white hover:bg-[#0c2f2a] sm:block" to="/register">Sign Up <span aria-hidden="true">→</span></Link>
          </div>
        </nav>
      </header>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<PublicServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CustomerRegisterPage />} />
        <Route path="/partner" element={<PartnerLandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<LegalPage title="Privacy Policy" source="/legal/privacy-policy.txt" />} />
        <Route path="/cookie-policy" element={<LegalPage title="Cookie Policy" source="/legal/cookie-policy.txt" />} />
        <Route path="/terms-and-conditions" element={<LegalPage title="Terms and Conditions" source="/legal/terms-and-conditions.txt" />} />
        <Route path="/partner/register" element={<PartnerRegisterPage />} />
        <Route path="/partner/login" element={<LoginPage intendedRole="PARTNER" title="Partner login" />} />
        <Route path="/admin/login" element={<LoginPage intendedRole="ADMIN" title="Admin login" />} />
        <Route path="/customer/dashboard" element={<ProtectedRoute roles={['CUSTOMER']}><DashboardPage role="Customer" /></ProtectedRoute>} />
        <Route path="/customer/services" element={<ProtectedRoute roles={['CUSTOMER']}><MemberServicesPage /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute roles={['CUSTOMER']}><MemberOrdersPage role="customer" /></ProtectedRoute>} />
        <Route path="/customer/orders/:id" element={<ProtectedRoute roles={['CUSTOMER']}><MemberOrderDetailPage /></ProtectedRoute>} />
        <Route path="/customer/payments" element={<ProtectedRoute roles={['CUSTOMER']}><MemberPaymentsPage /></ProtectedRoute>} />
        <Route path="/partner/dashboard" element={<ProtectedRoute roles={['PARTNER']}><DashboardPage role="Partner" /></ProtectedRoute>} />
        <Route path="/partner/services" element={<ProtectedRoute roles={['PARTNER']}><MemberServicesPage /></ProtectedRoute>} />
        <Route path="/partner/orders" element={<ProtectedRoute roles={['PARTNER']}><MemberOrdersPage role="partner" /></ProtectedRoute>} />
        <Route path="/partner/orders/:id" element={<ProtectedRoute roles={['PARTNER']}><MemberOrderDetailPage /></ProtectedRoute>} />
        <Route path="/partner/payments" element={<ProtectedRoute roles={['PARTNER']}><MemberPaymentsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="partners" element={<AdminPartnersPage />} />
          <Route path="payments" element={<AdminReceiptsPage title="Payments" />} />
          <Route path="receipts" element={<AdminReceiptsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Routes>
      {!isAdminWorkspace && <footer className="mt-16 bg-[#143f3a] text-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4"><div><img src="/brand/footer-logo.png" alt="E CAFE HIMACHAL" className="h-14 w-auto object-contain object-left"/><p className="mt-4 text-sm leading-6 text-emerald-50">Digital Services, Online Support, Jobs, Business Growth and Partner Network.</p></div><div><h2 className="font-bold">Explore</h2><div className="mt-4 space-y-2 text-sm text-emerald-50"><Link className="block hover:text-white" to="/services">Services</Link><Link className="block hover:text-white" to="/about">About</Link><Link className="block hover:text-white" to="/partner">Partner access</Link></div></div><div><h2 className="font-bold">Contact</h2><div className="mt-4 space-y-2 text-sm text-emerald-50"><a className="block hover:text-white" href="mailto:ecafehimachal@gmail.com">ecafehimachal@gmail.com</a><a className="block hover:text-white" href="tel:8351074060">8351074060</a><a className="block hover:text-white" href="https://wa.me/918920302813" target="_blank" rel="noreferrer">WhatsApp</a></div></div><div><h2 className="font-bold">Legal</h2><div className="mt-4 space-y-2 text-sm text-emerald-50"><Link className="block hover:text-white" to="/privacy-policy">Privacy Policy</Link><Link className="block hover:text-white" to="/cookie-policy">Cookie Policy</Link><Link className="block hover:text-white" to="/terms-and-conditions">Terms & Conditions</Link></div></div></div><div className="border-t border-white/15 px-5 py-5 text-center text-xs text-emerald-100">© {new Date().getFullYear()} E CAFE HIMACHAL. All rights reserved.</div></footer>}
      {!isAdminWorkspace && <CookieBanner />}
    </div>
  );
}
