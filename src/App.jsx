import { Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataProvider.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import EmergencyServicesPage from './pages/emergency-services/EmergencyServicesPage.jsx'
import HelpGuidePage from './pages/help-guide/HelpGuidePage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import CustomerDashboardPage from './pages/customer-dashboard/CustomerDashboardPage.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import './App.css'

function App() {
  return (
    <AppDataProvider>
      <SiteHeader />
      <main className="app-main">
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </AppDataProvider>
  )
}

export default App
