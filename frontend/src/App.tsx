import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/Overview';
import { CalculatorPage } from './pages/Calculator';
import { SimulatorPage } from './pages/Simulator';
import { AnalyticsPage } from './pages/Analytics';
import { RecommendationsPage } from './pages/Recommendations';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { NotFoundPage } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
