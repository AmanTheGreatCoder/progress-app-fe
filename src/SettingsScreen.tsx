import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  Info,
  Link,
  LogOut,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { api } from '@/api';
import { toast } from 'sonner';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { useAppStore } from '@/shared/store/useAppStore';

/* ─── helpers ──────────────────────────────────────────────── */

function useTheme() {
  const [dark, setDarkState] = useState<boolean>(
    () => document.documentElement.classList.contains('dark'),
  );

  const setDark = (value: boolean) => {
    setDarkState(value);
    if (value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { dark, setDark };
}

/* ─── sub-components ───────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-[600] uppercase tracking-[0.8px] text-muted-foreground px-4 mb-2 mt-6 first:mt-0">
      {title}
    </p>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  rightEl,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  rightEl?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted transition-colors text-left"
    >
      <div
        className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
          danger
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-secondary text-foreground'
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-[500] ${danger ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-[12px] text-muted-foreground mt-0.5 leading-tight">{sublabel}</p>
        )}
      </div>
      {rightEl ?? (onClick && <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />)}
    </button>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[12px] overflow-hidden divide-y divide-border mx-4 shadow-sm">
      {children}
    </div>
  );
}

/* ─── main screen ──────────────────────────────────────────── */

export default function SettingsScreen() {
  const { dark, setDark } = useTheme();
  const { user, logout } = useAppStore();

  const [tickTickStatus, setTickTickStatus] = useState<{ connected: boolean; expiresAt?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    api.get('/ticktick/status')
      .then(res => setTickTickStatus(res.data))
      .catch(() => {});
  }, []);

  const handleConnectTickTick = async () => {
    try {
      const res = await api.get('/ticktick/auth');
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Failed to initiate TickTick connection.');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/sync');
      toast.success('Tasks synced successfully!');
    } catch {
      toast.error('Sync failed. Try reconnecting your account.');
      setTickTickStatus({ connected: false });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="app-container bg-background text-foreground flex flex-col h-[100dvh] w-full overflow-hidden">
      <div className="px-4 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-[30px] font-[700] tracking-[-0.6px] text-foreground">Settings</h1>
        <p className="text-muted-foreground text-[14px] font-[400] mt-1">Preferences & account</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-8">

        {/* ── Account ── */}
        {user && (
          <>
            <SectionHeader title="Account" />
            <SettingsCard>
              <div className="flex items-center gap-3 px-4 py-3.5 bg-card">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-[15px] font-[600]">
                    {user.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-[600] text-foreground truncate">{user.name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <SettingsRow
                icon={LogOut}
                label="Sign Out"
                danger
                onClick={handleLogout}
              />
            </SettingsCard>
          </>
        )}

        {/* ── Appearance ── */}
        <SectionHeader title="Appearance" />
        <SettingsCard>
          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              {dark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Dark Mode</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {dark ? 'Dark theme active' : 'Light theme active'}
              </p>
            </div>
            <ToggleSwitch value={dark} onChange={setDark} />
          </div>
        </SettingsCard>

        {/* ── Integrations ── */}
        <SectionHeader title="Integrations" />
        <SettingsCard>
          <div className="w-full flex items-center justify-between px-4 py-3.5 bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Check size={16} />
              </div>
              <div>
                <p className="text-[15px] font-[500] text-foreground">TickTick</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {tickTickStatus?.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {!tickTickStatus?.connected ? (
              <button
                onClick={handleConnectTickTick}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-[13px] font-[500] rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Link size={14} /> Connect
              </button>
            ) : (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-[13px] font-[500] rounded-full flex items-center gap-1.5 transition-colors disabled:opacity-70"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing…' : 'Sync Tasks'}
              </button>
            )}
          </div>
        </SettingsCard>

        {/* ── About ── */}
        <SectionHeader title="About" />
        <SettingsCard>
          <SettingsRow
            icon={Info}
            label="Version"
            sublabel="Progress"
            rightEl={<span className="text-[13px] text-muted-foreground font-[500]">1.0.0</span>}
          />
        </SettingsCard>

        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  );
}
