import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Icon } from '@shared/components/ui/Icon';
import { PullToRefresh } from '@shared/components/ui/PullToRefresh';
import { useAppContext } from '@shared/context/AppContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { triggerRefresh } = useAppContext();

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

      <PullToRefresh
        key={location.pathname}
        onRefresh={triggerRefresh}
        className="screen-scroll fade-up overflow-x-hidden"
      >
        <Outlet />
      </PullToRefresh>

      <BottomNav />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Layout;
