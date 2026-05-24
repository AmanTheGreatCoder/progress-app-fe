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
    { id: 'profile', path: '/analytics', label: 'You', icon: 'user' },
  ];

  const isSubScreen = location.search.includes('create=') || location.search.includes('id=');

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      zIndex: 50,
      transform: isSubScreen ? 'translateY(150px)' : 'translateY(0)',
      opacity: isSubScreen ? 0 : 1,
      transition: 'transform 350ms cubic-bezier(.2,.8,.2,1), opacity 250ms ease-in',
      pointerEvents: isSubScreen ? 'none' : 'auto',
    }}>
      <div style={{
        background: 'rgba(28,28,39,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        borderRadius: '24px 24px 0 0',
        padding: '12px 8px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
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
                width: 52, height: 34, borderRadius: 18,
                background: active ? 'rgba(124,106,247,0.15)' : 'transparent', // var(--primary) with opacity
                display: 'grid', placeItems: 'center',
                transition: 'background 200ms',
              }}>
                <Icon name={it.icon} size={24} color={active ? 'var(--primary)' : 'var(--text-secondary)'} stroke={active ? 2.2 : 1.7}/>
              </div>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
              }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
