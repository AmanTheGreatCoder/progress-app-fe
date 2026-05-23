import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
