import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
        .hamburger-btn {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 200;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px;
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
        }
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 99;
        }
        @media (max-width: 768px) {
          .hamburger-btn { display: flex; }
          .sidebar-backdrop { display: block; }
          .dashboard-content {
            margin-left: 0;
            padding: 24px 16px;
            padding-top: 64px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
