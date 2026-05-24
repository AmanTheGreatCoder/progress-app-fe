import React from 'react';
import { Icon } from './ui/Icon';
import { Card } from './ui/Card';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { syncTickTick } = useAppContext();
  const [ticktickStatus, setTicktickStatus] = React.useState<{ connected: boolean; expiresAt?: string } | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      api.get('/ticktick/status')
        .then(res => setTicktickStatus(res.data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    await syncTickTick();
    setSyncing(false);
  };

  const handleConnect = async () => {
    try {
      const res = await api.get('/ticktick/auth');
      window.location.href = res.data.url;
    } catch (err) { console.error(err); }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
          zIndex: 900,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }} 
      />
      
      {/* Sidebar Panel */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '85%', maxWidth: 320,
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: 901,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '40px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
              A
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700 }}>Alex</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Profile settings</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={24} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Integrations
          </h3>
          
          <Card pad={14} style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 15%, transparent)', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>TickTick</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {ticktickStatus?.connected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            {ticktickStatus?.connected ? (
              <button onClick={handleSync} disabled={syncing} style={{
                padding: '6px 12px', borderRadius: 8, background: 'var(--primary)', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 600, cursor: syncing ? 'wait' : 'pointer'
              }}>
                {syncing ? 'Syncing' : 'Sync'}
              </button>
            ) : (
              <button onClick={handleConnect} style={{
                padding: '6px 12px', borderRadius: 8, background: 'var(--primary)', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>
                Connect
              </button>
            )}
          </Card>

          <h3 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            App Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: 'target', label: 'Goal preferences' },
              { icon: 'clock', label: 'Reminders & alerts' },
              { icon: 'sparkle', label: 'Theme & appearance' },
              { icon: 'info', label: 'About ProgressApp' }
            ].map(item => (
              <button key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left'
              }}>
                <Icon name={item.icon} size={18} color="var(--text-secondary)" />
                <span style={{ flex: 1 }}>{item.label}</span>
                <Icon name="chevron-right" size={16} color="var(--text-tertiary)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
