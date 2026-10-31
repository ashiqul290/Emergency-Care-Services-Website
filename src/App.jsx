import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataProvider.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import EmergencyServicesPage from './pages/emergency-services/EmergencyServicesPage.jsx'
import HelpGuidePage from './pages/help-guide/HelpGuidePage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import CustomerDashboardPage from './pages/customer-dashboard/CustomerDashboardPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.replace(/\/+$/, '') === '/admin'

  return (
    <AppDataProvider>
      <a className="skip-link" href="#main-content">মূল কনটেন্টে যান</a>
      {!isAdminRoute && <SiteHeader />}
      <main className={`app-main${isAdminRoute ? ' admin-only-main' : ''}`} id="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/emergency-services" element={<EmergencyServicesPage />} />
          <Route path="/help-guide" element={<HelpGuidePage />} />
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            )}
          />
          <Route path="/my-requests" element={<CustomerDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <SiteFooter />}
    </AppDataProvider>
  )
}

export default App
