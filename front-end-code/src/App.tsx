import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import AdminDashboard from './pages/AdminDashboard'
import ApplicantDetailPage from './pages/ApplicantDetailPage'
import ApplicantsListPage from './pages/ApplicantsListPage'
import ApplicationsPage from './pages/ApplicationsPage'
import CreatePositionPage from './pages/CreatePositionPage'
import DashboardPage from './pages/DashboardPage'
import ExternalProgramsPage from './pages/ExternalProgramsPage'
import FundingRequestsPage from './pages/FundingRequestsPage'
import HRProgramsPage from './pages/HRProgramsPage'
import LabManagementPage from './pages/LabManagementPage'
import LoginPage from './pages/LoginPage'
import ManagePositionsPage from './pages/ManagePositionsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      <main key={location.pathname} className="page-enter" style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<RequireAuth><Layout><DashboardPage /></Layout></RequireAuth>} />
        <Route path="/opportunities" element={<RequireAuth><Layout><OpportunitiesPage /></Layout></RequireAuth>} />
        <Route path="/applications" element={<RequireAuth><Layout><ApplicationsPage /></Layout></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Layout><ProfilePage /></Layout></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Layout><AdminDashboard /></Layout></RequireAuth>} />
        <Route path="/lab" element={<RequireAuth><Layout><LabManagementPage /></Layout></RequireAuth>} />
        <Route path="/funding" element={<RequireAuth><Layout><FundingRequestsPage /></Layout></RequireAuth>} />
        <Route path="/programs" element={<RequireAuth><Layout><ExternalProgramsPage /></Layout></RequireAuth>} />
        <Route path="/hr/programs" element={<RequireAuth><Layout><HRProgramsPage /></Layout></RequireAuth>} />

        <Route path="/positions/mine" element={<RequireAuth><Layout><ManagePositionsPage /></Layout></RequireAuth>} />
        <Route path="/positions/new" element={<RequireAuth><Layout><CreatePositionPage /></Layout></RequireAuth>} />
        <Route path="/positions/:positionId/applicants" element={<RequireAuth><Layout><ApplicantsListPage scope="position" /></Layout></RequireAuth>} />
        <Route path="/applicants" element={<RequireAuth><Layout><ApplicantsListPage scope="history" /></Layout></RequireAuth>} />
        <Route path="/applicants/:applicationId" element={<RequireAuth><Layout><ApplicantDetailPage /></Layout></RequireAuth>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
