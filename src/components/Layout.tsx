import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Icon } from './ui/Icon';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Top bar */}
      <div className="flex items-center" style={{ padding: '16px 20px 12px' }}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
        >
          <Icon name="menu" size={24} color="var(--text-primary)" />
        </button>
      </div>

      <div
        key={location.pathname}
        className="screen-scroll fade-up"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <Outlet />
      </div>

      <BottomNav />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Layout;
