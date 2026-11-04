import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useCampusData } from '../../hooks/useCampusData';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { reportingPeriods, selectedPeriodId, setSelectedPeriodId, campus } = useCampusData();
  const location = useLocation();

  // Map route to friendly title
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/overview':
        return 'Campus Footprint Overview';
      case '/calculator':
        return 'Carbon Calculator';
      case '/simulator':
        return 'What-If Decarbonization Simulator';
      case '/analytics':
        return 'Historical Emissions Analytics';
      case '/recommendations':
        return 'Actionable Reduction Roadmap';
      case '/reports':
        return 'Compliance & Sustainability Reports';
      case '/users':
        return 'Institutional User Management';
      case '/settings':
        return 'Campus Settings & Factors';
      default:
        return 'Carbon Platform';
    }
  };

  return (
    <div className="app-container">
      {/* Fixed Botanical Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        campusName={campus?.name}
      />

      {/* Main Content Area */}
      <div className="main-viewport">
        <TopBar
          onToggleMobile={() => setMobileOpen(prev => !prev)}
          reportingPeriods={reportingPeriods}
          selectedPeriodId={selectedPeriodId}
          onSelectPeriod={setSelectedPeriodId}
          pageTitle={getPageTitle(location.pathname)}
          campusName={campus?.name}
        />

        <main className="page-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
