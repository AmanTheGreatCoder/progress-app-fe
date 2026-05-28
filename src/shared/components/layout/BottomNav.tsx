import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@shared/components/ui/Icon';

const ITEMS = [
  { id: 'dashboard', path: '/',          label: 'Home',      icon: 'home'   },
  { id: 'goals',     path: '/goals',     label: 'Goals',     icon: 'target' },
  { id: 'tasks',     path: '/tasks',     label: 'Tasks',     icon: 'tasks'  },
  { id: 'profile',   path: '/analytics', label: 'Analytics', icon: 'trend'  },
] as const;

function getTabFromPath(path: string) {
  if (path === '/goals')     return 'goals';
  if (path === '/tasks')     return 'tasks';
  if (path === '/analytics') return 'profile';
  return 'dashboard';
}

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = getTabFromPath(location.pathname);
  const isSubScreen = location.search.includes('create=') || location.search.includes('id=');

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{
        transform: isSubScreen ? 'translateY(150px)' : 'translateY(0)',
        opacity: isSubScreen ? 0 : 1,
        transition: 'transform 350ms cubic-bezier(.2,.8,.2,1), opacity 250ms ease-in',
        pointerEvents: isSubScreen ? 'none' : 'auto',
      }}
    >
      <div
        className="border-t border-c-border rounded-t-3xl pt-3 px-2 pb-5 grid grid-cols-4 shadow-nav"
        style={{
          background: 'rgba(28,28,39,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as React.CSSProperties}
      >
        {ITEMS.map(it => {
          const active = currentTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => navigate(it.path)}
              aria-label={it.label}
              aria-current={active ? 'page' : undefined}
              className="bg-transparent border-none cursor-pointer pt-2 px-1 pb-1.5 flex flex-col items-center gap-[3px] relative"
            >
              <div
                className={`w-[52px] h-[34px] rounded-[18px] grid place-items-center ${active ? 'bg-primary-soft' : 'bg-transparent'}`}
                style={{ transition: 'background 200ms' }}
              >
                <Icon name={it.icon} size={24} color={active ? 'var(--primary)' : 'var(--text-secondary)'} stroke={active ? 2.2 : 1.7} />
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-c-primary' : 'text-c-text2'}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
