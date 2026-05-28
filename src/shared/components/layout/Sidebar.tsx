import React, { useState } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import { Card } from '@shared/components/ui/Card';
import { useAppContext } from '@shared/context/AppContext';
import api from '@shared/api';

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[900]"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Panel */}
      <div
        className="flex flex-col w-[85%] max-w-80 bg-c-bg border-r border-c-border absolute top-0 bottom-0 left-0 z-[901]"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-10 px-5 pb-5 border-b border-c-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-c-primary grid place-items-center text-white text-xl font-bold">
              A
            </div>
            <div>
              <div className="text-c-text1 text-lg font-bold">Alex</div>
              <div className="text-c-text2 text-sm">Profile settings</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close sidebar" className="bg-transparent border-none cursor-pointer">
            <Icon name="x" size={24} color="var(--text-secondary)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-c-text2 text-xs font-bold uppercase tracking-label mb-3">
            Integrations
          </h3>

          <Card pad={14} className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-soft grid place-items-center">
                  <Icon name="check" size={16} color="var(--primary)" />
                </div>
                <div>
                  <div className="text-c-text1 text-base font-semibold">TickTick</div>
                  <div className="text-c-text2 text-xs">
                    {ticktickStatus?.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>

              {ticktickStatus?.connected ? (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="inline-flex items-center justify-center gap-1.5 py-[7px] px-3.5 rounded-chip text-white border-none text-xs font-semibold min-w-[72px]"
                  style={{
                    background: isSyncing ? 'color-mix(in srgb, var(--primary) 60%, transparent)' : 'var(--primary)',
                    cursor: isSyncing ? 'default' : 'pointer',
                    transition: 'background 200ms',
                  }}
                >
                  <span className={`inline-flex items-center ${isSyncing ? 'spin' : ''}`}>
                    <Icon name={isSyncing ? 'loader' : 'arrow-down'} size={13} color="#fff" stroke={2.2} />
                  </span>
                  {isSyncing ? 'Syncing…' : 'Sync now'}
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="py-1.5 px-3 rounded-lg bg-c-primary text-white border-none text-xs font-semibold cursor-pointer"
                >
                  Connect
                </button>
              )}
            </div>

            {(syncError || connectError) && (
              <p className="text-c-warning text-xs mt-2.5 mb-0">
                {syncError || connectError}
              </p>
            )}
          </Card>

          <h3 className="text-c-text2 text-xs font-bold uppercase tracking-label mb-3">
            App Settings
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { icon: 'target',   label: 'Goal preferences' },
              { icon: 'clock',    label: 'Reminders & alerts' },
              { icon: 'sparkle',  label: 'Theme & appearance' },
              { icon: 'info',     label: 'About ProgressApp' },
            ].map(item => (
              <button
                key={item.label}
                className="flex items-center gap-3 py-3 px-3.5 bg-c-surface border border-c-border rounded-[12px] text-c-text1 text-base font-medium cursor-pointer text-left"
              >
                <Icon name={item.icon} size={18} color="var(--text-secondary)" />
                <span className="flex-1">{item.label}</span>
                <Icon name="chevron-right" size={16} color="var(--text-tertiary)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
