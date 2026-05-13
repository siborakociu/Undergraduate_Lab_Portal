import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/AdminDashboard'
import ApplicationsPage from './pages/ApplicationsPage'
import DashboardPage from './pages/DashboardPage'
import LabManagementPage from './pages/LabManagementPage'
import LoginPage from './pages/LoginPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout><DashboardPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/opportunities"
          element={
            <RequireAuth>
              <Layout><OpportunitiesPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/applications"
          element={
            <RequireAuth>
              <Layout><ApplicationsPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Layout><ProfilePage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Layout><AdminDashboard /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/lab"
          element={
            <RequireAuth>
              <Layout><LabManagementPage /></Layout>
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
