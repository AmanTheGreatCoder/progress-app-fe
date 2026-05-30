import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  Info,
  Moon,
  Palette,
  Settings,
  Shield,
  Smartphone,
  Star,
  Sun,
  Zap,
  RefreshCw,
  Link,
} from 'lucide-react';
import { api } from '@/api';
import { toast } from 'sonner';
import { BottomNav } from '@/shared/components/layout/BottomNav';

/* ─────────────────────── helpers ─────────────────────── */

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return { dark, setDark };
}

/* ─────────────────────── sub-components ─────────────────────── */

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
        className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${danger
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
      {rightEl ?? (
        onClick && <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'
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

/* ─────────────────────── main screen ─────────────────────── */

export default function SettingsScreen() {
  const { dark, setDark } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [haptics, setHaptics] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // TickTick Integration State
  const [tickTickStatus, setTickTickStatus] = useState<{ connected: boolean; expiresAt?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if TickTick is connected
    api.get('/ticktick/status')
      .then(res => setTickTickStatus(res.data))
      .catch(err => console.error('Failed to get TickTick status', err));
  }, []);

  const handleConnectTickTick = async () => {
    try {
      const res = await api.get('/ticktick/auth');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Failed to get auth url', err);
      toast.error('Failed to initiate connection to TickTick.');
    }
  };

  const handleSyncTasks = async () => {
    setIsSyncing(true);
    try {
      await api.post('/sync');
      toast.success('Tasks synced successfully!');
    } catch (err) {
      console.error('Sync failed', err);
      toast.error('Failed to sync tasks. You may need to reconnect your account.');
      setTickTickStatus({ connected: false });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app-container bg-background text-foreground flex flex-col h-[100dvh] w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-[30px] font-[700] tracking-[-0.6px] text-foreground">Settings</h1>
        <p className="text-muted-foreground text-[14px] font-[400] mt-1">
          Preferences & account options
        </p>
      </div>

      {/* ── Scrollable content ── */}
      <div className="scroll-area flex-1 overflow-y-auto overflow-x-hidden pb-32">

        {/* ───── Appearance ───── */}
        <SectionHeader title="Appearance" />
        <SettingsCard>
          {/* Dark mode toggle – full featured */}
          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              {dark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Dark Mode</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {dark ? 'Dark theme is on' : 'Light theme is on'}
              </p>
            </div>
            <ToggleSwitch value={dark} onChange={setDark} />
          </div>

          {/* Theme selector preview */}
          <div className="px-4 py-3.5 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
                <Palette size={16} className="text-foreground" />
              </div>
              <p className="text-[15px] font-[500] text-foreground flex-1">Accent Color</p>
            </div>
            <div className="flex gap-2 ml-11">
              {[
                { color: '#0f172a', label: 'Slate' },
                { color: '#6366f1', label: 'Indigo' },
                { color: '#8b5cf6', label: 'Violet' },
                { color: '#ec4899', label: 'Pink' },
                { color: '#10b981', label: 'Emerald' },
                { color: '#f59e0b', label: 'Amber' },
              ].map(({ color, label }) => (
                <button
                  key={color}
                  title={label}
                  className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${color === '#0f172a' ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </SettingsCard>

        {/* ───── Integrations ───── */}
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
                onClick={handleSyncTasks}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-[13px] font-[500] rounded-full flex items-center gap-1.5 transition-colors disabled:opacity-70"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Sync Tasks'}
              </button>
            )}
          </div>
        </SettingsCard>

        {/* ───── Notifications ───── */}
        <SectionHeader title="Notifications" />
        <SettingsCard>
          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              <Bell size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Push Notifications</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Daily task reminders</p>
            </div>
            <ToggleSwitch value={notifications} onChange={setNotifications} />
          </div>

          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              <Zap size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Streak Reminders</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Alert when streak is at risk</p>
            </div>
            <ToggleSwitch value={streakReminders} onChange={setStreakReminders} />
          </div>

          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              <Star size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Weekly Report</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Summary every Sunday</p>
            </div>
            <ToggleSwitch value={weeklyReport} onChange={setWeeklyReport} />
          </div>
        </SettingsCard>

        {/* ───── App Behaviour ───── */}
        <SectionHeader title="App Behaviour" />
        <SettingsCard>
          <div className="w-full flex items-center gap-3 px-4 py-3.5 bg-card">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-secondary">
              <Smartphone size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[500] text-foreground">Haptic Feedback</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Vibrate on task completion</p>
            </div>
            <ToggleSwitch value={haptics} onChange={setHaptics} />
          </div>

          <SettingsRow
            icon={Shield}
            label="Data & Privacy"
            sublabel="Manage your data"
            onClick={() => { }}
          />
        </SettingsCard>

        {/* ───── About ───── */}
        <SectionHeader title="About" />
        <SettingsCard>
          <SettingsRow
            icon={Info}
            label="Version"
            sublabel="Progress App"
            rightEl={
              <span className="text-[13px] text-muted-foreground font-[500]">1.0.0</span>
            }
          />
          <SettingsRow
            icon={Star}
            label="Rate on App Store"
            onClick={() => { }}
          />
          <SettingsRow
            icon={Settings}
            label="Send Feedback"
            onClick={() => { }}
          />
        </SettingsCard>

        {/* ───── Danger zone ───── */}
        <SectionHeader title="Account" />
        <SettingsCard>
          <SettingsRow
            icon={Shield}
            label="Reset All Data"
            sublabel="Permanently delete everything"
            danger
            onClick={() => { }}
          />
        </SettingsCard>

        <div className="h-4" />
      </div>

      {/* ── Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}
