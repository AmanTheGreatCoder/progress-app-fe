import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Icon } from '@shared/components/ui/Icon';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col w-screen h-screen relative">
      {/* Top bar */}
      <div className="flex items-center pt-4 px-5 pb-3">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="bg-transparent border-none cursor-pointer grid place-items-center p-0"
        >
          <Icon name="menu" size={24} color="var(--text-primary)" />
        </button>
      </div>

      <div
        key={location.pathname}
        className="screen-scroll fade-up flex-1 overflow-y-auto overflow-x-hidden"
      >
        <Outlet />
      </div>

      <BottomNav />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Layout;
