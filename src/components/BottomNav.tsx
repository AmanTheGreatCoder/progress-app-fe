import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './ui/Icon';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path: string) => {
    if (path === '/goals') return 'goals';
    if (path === '/tasks') return 'tasks';
    if (path === '/analytics') return 'profile'; // mapping 'You' or 'Analytics'
    return 'dashboard';
  };

  const currentTab = getTabFromPath(location.pathname);

  const items = [
    { id: 'dashboard', path: '/', label: 'Home', icon: 'home' },
    { id: 'goals', path: '/goals', label: 'Goals', icon: 'target' },
    { id: 'tasks', path: '/tasks', label: 'Tasks', icon: 'tasks' },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      padding: '0 12px',
      zIndex: 50,
    }}>
      <div style={{
        background: 'rgba(28,28,39,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 22,
        padding: '8px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
      }}>
        {items.map(it => {
          const active = currentTab === it.id;
          return (
            <button key={it.id} onClick={() => navigate(it.path)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px 4px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              position: 'relative',
            }}>
              <div style={{
                width: 44, height: 30, borderRadius: 16,
                background: active ? 'rgba(124,106,247,0.15)' : 'transparent', // var(--primary) with opacity
                display: 'grid', placeItems: 'center',
                transition: 'background 200ms',
              }}>
                <Icon name={it.icon} size={20} color={active ? 'var(--primary)' : 'var(--text-secondary)'} stroke={active ? 2.2 : 1.7}/>
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: 600,
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
              }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
