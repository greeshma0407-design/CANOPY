import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/Login';
import { OnboardingPage } from './pages/Onboarding';
import { JoinCampusPage } from './pages/JoinCampus';
import { OverviewPage } from './pages/Overview';
import { CalculatorPage } from './pages/Calculator';
import { SimulatorPage } from './pages/Simulator';
import { AnalyticsPage } from './pages/Analytics';
import { RecommendationsPage } from './pages/Recommendations';
import { ReportsPage } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { NotFoundPage } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Unauthenticated Entry Points */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboard" element={<OnboardingPage />} />
          <Route path="/join" element={<JoinCampusPage />} />

          {/* Protected Application Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route
              path="calculator"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER', 'DATA_ENTRY_OPERATOR']}>
                  <CalculatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="simulator"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER']}>
                  <SimulatorPage />
                </ProtectedRoute>
              }
            />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CAMPUS_ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
