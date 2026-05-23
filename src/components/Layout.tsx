import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <div key={location.pathname} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }} className="screen-scroll fade-up">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
