import React, { useState } from 'react';
import { Icon } from './ui/Icon';
import { Card } from './ui/Card';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { syncTickTick, isSyncing, syncError } = useAppContext();
  const [ticktickStatus, setTicktickStatus] = useState<{ connected: boolean; expiresAt?: string } | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      api.get('/ticktick/status')
        .then(res => setTicktickStatus(res.data))
        .catch(err => {
          console.error(err);
          setTicktickStatus({ connected: false });
        });
    }
  }, [isOpen]);

  const handleSync = async () => {
    if (isSyncing) return;
    await syncTickTick();
  };

  const handleConnect = async () => {
    setConnectError(null);
    try {
      const res = await api.get('/ticktick/auth');
      window.location.href = res.data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not connect to TickTick.';
      console.error(err);
      setConnectError(msg);
    }
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

      {/* Panel */}
      <div className="flex flex-col" style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '85%', maxWidth: 320,
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: 901,
      }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{
          padding: '40px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 44, height: 44, borderRadius: 22,
              background: 'var(--primary)', display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: 18, fontWeight: 700,
            }}>A</div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700 }}>Alex</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Profile settings</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close sidebar" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={24} color="var(--text-secondary)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: 20 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Integrations
          </h3>

          <Card pad={14} style={{ background: 'var(--surface)', marginBottom: 24 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                  display: 'grid', placeItems: 'center',
                }}>
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
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 20,
                    background: isSyncing ? 'color-mix(in srgb, var(--primary) 60%, transparent)' : 'var(--primary)',
                    color: '#fff', border: 'none',
                    fontSize: 12, fontWeight: 600,
                    cursor: isSyncing ? 'default' : 'pointer',
                    transition: 'background 200ms',
                    minWidth: 72, justifyContent: 'center',
                  }}
                >
                  <span className={isSyncing ? 'spin' : ''} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon name={isSyncing ? 'loader' : 'arrow-down'} size={13} color="#fff" stroke={2.2} />
                  </span>
                  {isSyncing ? 'Syncing…' : 'Sync now'}
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Connect
                </button>
              )}
            </div>

            {/* Error messages */}
            {(syncError || connectError) && (
              <p style={{ color: 'var(--warning)', fontSize: 12, marginTop: 10, marginBottom: 0 }}>
                {syncError || connectError}
              </p>
            )}
          </Card>

          <h3 style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            App Settings
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { icon: 'target', label: 'Goal preferences' },
              { icon: 'clock', label: 'Reminders & alerts' },
              { icon: 'sparkle', label: 'Theme & appearance' },
              { icon: 'info', label: 'About ProgressApp' },
            ].map(item => (
              <button
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                  color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                }}
              >
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
