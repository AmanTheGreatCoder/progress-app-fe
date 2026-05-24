import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Icon } from './ui/Icon';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Top Bar for Sidebar toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 20px 4px',
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center', padding: 0
        }}>
          <Icon name="menu" size={24} color="var(--text-primary)" />
        </button>
      </div>

      <div key={location.pathname} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }} className="screen-scroll fade-up">
        <Outlet />
      </div>
      <BottomNav />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Layout;
