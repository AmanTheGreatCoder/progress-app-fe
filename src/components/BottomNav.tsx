import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Target, BarChart3 } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-indicator" />
        <LayoutDashboard size={22} strokeWidth={1.8} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-indicator" />
        <CheckSquare size={22} strokeWidth={1.8} />
        <span>Tasks</span>
      </NavLink>
      <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-indicator" />
        <Target size={22} strokeWidth={1.8} />
        <span>Goals</span>
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-indicator" />
        <BarChart3 size={22} strokeWidth={1.8} />
        <span>Analytics</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
