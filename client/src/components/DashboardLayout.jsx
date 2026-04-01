import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-container">
          {children}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }
        .dashboard-content {
          flex: 1;
          margin-left: 260px;
          padding: 48px;
          overflow-y: auto;
        }
        .content-container {
          max-width: 1000px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
