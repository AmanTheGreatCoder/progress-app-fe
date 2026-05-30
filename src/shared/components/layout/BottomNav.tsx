import React from 'react';
import { Home, Target, Check, BarChart2, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
      <Icon size={20} className={active ? 'text-primary' : 'text-muted-foreground'} />
      <span className={`text-[11px] font-[500] leading-none ${active ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex-shrink-0 h-[80px] bg-card border-t border-border flex items-center justify-between px-4 pb-safe z-40 mt-auto">
      <NavItem icon={Home} label="Today" active={location.pathname === '/today'} onClick={() => navigate('/today')} />
      <NavItem icon={Target} label="Goals" active={location.pathname.startsWith('/goals')} onClick={() => navigate('/goals')} />
      <NavItem icon={Check} label="Tasks" active={location.pathname === '/tasks'} onClick={() => navigate('/tasks')} />
      <NavItem icon={BarChart2} label="Analytics" active={location.pathname === '/analytics'} onClick={() => navigate('/analytics')} />
      <NavItem icon={Settings} label="Settings" active={location.pathname === '/settings'} onClick={() => navigate('/settings')} />
    </nav>
  );
};
