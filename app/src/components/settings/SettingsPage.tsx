// Settings Page
import { useState, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Database, Moon, Sun,
  Mail, Smartphone, AlertCircle, Download, Upload, Trash2,
  FileText, Key, LifeBuoy, Lock, Scale, Clock3 as ClockIcon
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { requestNotificationPermission, showToast } from '@/lib/notifications';
import { defaultSettings, useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const SettingsPage = () => {
  const { user, updateSettings, resetPassword } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const bills = useDataStore((state) => state.bills);
  const subscriptions = useDataStore((state) => state.subscriptions);
  const warranties = useDataStore((state) => state.warranties);
  const documents = useDataStore((state) => state.documents);
  const reminders = useDataStore((state) => state.reminders);
  const notifications = useDataStore((state) => state.notifications);
  const passwords = useDataStore((state) => state.passwords);
  const [updatingSetting, setUpdatingSetting] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const settings = user?.settings ?? defaultSettings;
  const enabledNotificationCount = Object.values(settings.notifications).filter(Boolean).length;
  const enabledReminderTimingCount = Object.values(settings.reminderTiming).filter(Boolean).length;
  const totalRecords =
    bills.length +
    subscriptions.length +
    warranties.length +
    documents.length +
    reminders.length +
    passwords.length;

  const handlePasswordReset = async () => {
    if (!user?.email) {
      showToast({
        title: 'Password reset unavailable',
        description: 'Arcora could not find an email address for this account.',
        type: 'warning',
      });
      return;
    }

    setResettingPassword(true);

    try {
      await resetPassword(user.email);
    } catch {
      // resetPassword already surfaces a toast with the Firebase error.
    } finally {
      setResettingPassword(false);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL ?? null,
            settings,
          }
        : null,
      data: {
        bills,
        subscriptions,
        warranties,
        documents,
        reminders,
        notifications,
        passwords,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `arcora-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    showToast({
      title: 'Export ready',
      description: 'Your Arcora data was downloaded as JSON.',
      type: 'success',
    });
  };

  const handleNotificationToggle = async (
    key: keyof typeof settings.notifications,
    checked: boolean,
  ) => {
    if (!user) return;

    setUpdatingSetting(key);

    try {
      let nextValue = checked;

      if (key === 'push' && checked) {
        const granted = await requestNotificationPermission();

        if (!granted) {
          nextValue = false;
          showToast({
            title: 'Browser notifications still blocked',
            description: 'Allow notification permission in your browser to enable desktop alerts.',
            type: 'warning',
          });
        }
      }

      await updateSettings({
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: nextValue,
        },
      });
    } catch (error) {
      showToast({
        title: 'Settings were not saved',
        description: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setUpdatingSetting(null);
    }
  };

  const handleReminderTimingToggle = async (
    key: keyof typeof settings.reminderTiming,
    checked: boolean,
  ) => {
    if (!user) return;

    setUpdatingSetting(key);

    try {
      await updateSettings({
        ...settings,
        reminderTiming: {
          ...settings.reminderTiming,
          [key]: checked,
        },
      });
    } catch (error) {
      showToast({
        title: 'Reminder timing was not saved',
        description: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setUpdatingSetting(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="arcora-feature-page arcora-orbit-dashboard space-y-5">
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Settings
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Account controls, notifications, appearance, security, and data tools in the same polished Arcora workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportData} className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            disabled={!user?.email || resettingPassword}
            onClick={() => void handlePasswordReset()}
            className="rounded-full"
          >
            <Key className="mr-2 h-4 w-4" />
            {resettingPassword ? 'Sending...' : 'Send Reset'}
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SettingsMetricCard
          icon={User}
          label="Account"
          value={user?.displayName || 'Arcora User'}
          helper={user?.email || 'Signed in'}
          colors={['#2563eb', '#0e7490']}
          values={[1, 2, totalRecords + 1, enabledNotificationCount + 1, 3]}
        />
        <SettingsMetricCard
          icon={Bell}
          label="Notifications"
          value={`${enabledNotificationCount}/5`}
          helper="Preferences active"
          colors={['#0f766e', '#115e59']}
          values={[0, enabledNotificationCount, 5, enabledNotificationCount + 1, enabledNotificationCount]}
        />
        <SettingsMetricCard
          icon={ClockIcon}
          label="Reminder Timing"
          value={`${enabledReminderTimingCount}/4`}
          helper="Timing rules active"
          colors={['#b45309', '#92400e']}
          values={[0, enabledReminderTimingCount, 4, enabledReminderTimingCount + 1, enabledReminderTimingCount]}
        />
        <SettingsMetricCard
          icon={Database}
          label="Tracked Records"
          value={totalRecords.toString()}
          helper={`${documents.length} documents`}
          colors={['#7c3aed', '#5b21b6']}
          values={[0, bills.length, subscriptions.length, warranties.length, documents.length, totalRecords]}
        />
      </motion.div>

      {/* Settings Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/70 p-2">
            <TabsTrigger value="profile" className="rounded-xl px-4"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl px-4"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl px-4"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-4"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl px-4"><Database className="mr-2 h-4 w-4" />Data</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" disabled className="rounded-full">Coming soon</Button>
                    <p className="mt-2 text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                  </div>
                </div>
                <Button disabled className="rounded-full">Profile editing coming soon</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose which alerts stay active while Arcora keeps watch.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <SettingItem
                    icon={Mail}
                    title="Email Notifications"
                    description="Save your preference for future email delivery."
                    checked={settings.notifications.email}
                    disabled={updatingSetting === 'email'}
                    onCheckedChange={(checked) => void handleNotificationToggle('email', checked)}
                  />
                  <SettingItem
                    icon={Smartphone}
                    title="Push Notifications"
                    description="Allow Arcora to send browser notifications on this device when the browser supports them."
                    checked={settings.notifications.push}
                    disabled={updatingSetting === 'push'}
                    onCheckedChange={(checked) => void handleNotificationToggle('push', checked)}
                  />
                  <Separator />
                  <SettingItem
                    icon={Bell}
                    title="Bill Reminders"
                    description="Include bills and recurring charges in reminder alerts."
                    checked={settings.notifications.billReminders}
                    disabled={updatingSetting === 'billReminders'}
                    onCheckedChange={(checked) => void handleNotificationToggle('billReminders', checked)}
                  />
                  <SettingItem
                    icon={AlertCircle}
                    title="Warranty Alerts"
                    description="Include warranties and expiring records in reminder alerts."
                    checked={settings.notifications.warrantyAlerts}
                    disabled={updatingSetting === 'warrantyAlerts'}
                    onCheckedChange={(checked) => void handleNotificationToggle('warrantyAlerts', checked)}
                  />
                  <SettingItem
                    icon={Shield}
                    title="Security Alerts"
                    description="Keep security-related notices visible in your settings."
                    checked={settings.notifications.securityAlerts}
                    disabled={updatingSetting === 'securityAlerts'}
                    onCheckedChange={(checked) => void handleNotificationToggle('securityAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Reminder Timing</CardTitle>
                <CardDescription>Choose how early Arcora should surface deadlines that matter.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingItem
                  title="30 days before"
                  description="Best for coverage, renewals, and records with more lead time."
                  checked={settings.reminderTiming.thirtyDaysBefore}
                  disabled={updatingSetting === 'thirtyDaysBefore'}
                  onCheckedChange={(checked) => void handleReminderTimingToggle('thirtyDaysBefore', checked)}
                />
                <SettingItem
                  title="7 days before"
                  description="Useful when a deadline is close enough to plan around this week."
                  checked={settings.reminderTiming.sevenDaysBefore}
                  disabled={updatingSetting === 'sevenDaysBefore'}
                  onCheckedChange={(checked) => void handleReminderTimingToggle('sevenDaysBefore', checked)}
                />
                <SettingItem
                  title="1 day before"
                  description="A final heads-up before something becomes urgent."
                  checked={settings.reminderTiming.oneDayBefore}
                  disabled={updatingSetting === 'oneDayBefore'}
                  onCheckedChange={(checked) => void handleReminderTimingToggle('oneDayBefore', checked)}
                />
                <SettingItem
                  title="On due date"
                  description="Keep the deadline visible on the day it needs action."
                  checked={settings.reminderTiming.onDueDate}
                  disabled={updatingSetting === 'onDueDate'}
                  onCheckedChange={(checked) => void handleReminderTimingToggle('onDueDate', checked)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Arcora starts in dark mode by default. Switch to light here only if you prefer a brighter workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ThemeOption icon={Sun} title="Light" value="light" current={theme} onSelect={setTheme} />
                  <ThemeOption icon={Moon} title="Dark" value="dark" current={theme} onSelect={setTheme} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
                      <Key className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                    </div>
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Send a password reset email to your account address</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    disabled={!user?.email || resettingPassword}
                    onClick={() => void handlePasswordReset()}
                    className="rounded-full"
                  >
                    {resettingPassword ? 'Sending...' : 'Send reset'}
                  </Button>
                </div>
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
                      <Lock className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                    </div>
                    <div>
                      <p className="font-medium">Master Password</p>
                      <p className="text-sm text-muted-foreground">Set a master password for the desktop app</p>
                    </div>
                  </div>
                  <Button variant="outline" disabled className="rounded-full">Coming soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or delete your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10">
                      <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData} className="rounded-full">Export</Button>
                </div>
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
                      <Upload className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                    </div>
                    <div>
                      <p className="font-medium">Import Data</p>
                      <p className="text-sm text-muted-foreground">Import data from a backup file</p>
                    </div>
                  </div>
                  <Button variant="outline" disabled className="rounded-full">Coming soon</Button>
                </div>
                <Separator />
                <div className="flex flex-col gap-4 rounded-[1.35rem] border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  <Button variant="destructive" disabled className="rounded-full">Coming soon</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardHeader>
            <CardTitle>Support & Policies</CardTitle>
            <CardDescription>
              Keep Arcora's trust pages close by for privacy questions, terms, and support requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <PolicyLinkCard
              icon={FileText}
              title="Privacy Policy"
              description="Review what Arcora stores, how it is used, and where privacy requests should go."
              to="/privacy"
            />
            <PolicyLinkCard
              icon={Scale}
              title="Terms of Use"
              description="See the account rules, product expectations, and service responsibilities."
              to="/terms"
            />
            <PolicyLinkCard
              icon={LifeBuoy}
              title="Contact Support"
              description="Open the support page for bug reports, deletion requests, complaints, or account help."
              to="/contact"
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const SettingsMetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  colors,
  values,
}: {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
  colors: [string, string];
  values: number[];
}) => {
  const wave = getSettingsSparkline(values, 220, 50);

  return (
    <div
      className="relative min-h-36 overflow-hidden rounded-[1.15rem] p-5 text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.18]">
          <Icon className="h-5 w-5" />
        </div>
        <span className="max-w-[8rem] truncate rounded-full bg-white/[0.18] px-2.5 py-1 text-[10px] font-bold">
          {helper}
        </span>
      </div>
      <p className="relative z-10 mt-5 line-clamp-1 text-2xl font-semibold leading-none">{value}</p>
      <p className="relative z-10 mt-2 text-xs font-medium text-white/80">{label}</p>
      <svg viewBox="0 0 220 62" className="absolute inset-x-0 bottom-0 h-16 w-full opacity-55">
        <path d={`M 0,62 L ${wave} L 220,62 Z`} fill="rgba(255,255,255,0.22)" />
        <polyline points={wave} fill="none" stroke="rgba(255,255,255,0.54)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const getSettingsSparkline = (values: number[], width: number, height: number) => {
  const normalized = values.length > 0 ? values : [0];
  const max = Math.max(...normalized, 1);
  const min = Math.min(...normalized, 0);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(normalized.length - 1, 1);

  return normalized
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 8) + 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

// Setting Item Component
interface SettingItemProps {
  icon?: ElementType;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const SettingItem = ({
  icon: Icon,
  title,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: SettingItemProps) => (
  <div className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
          <Icon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-950 dark:text-slate-50">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
  </div>
);

// Theme Option Component
interface ThemeOptionProps {
  icon: ElementType;
  title: string;
  value: string;
  current: string;
  onSelect: (theme: 'dark' | 'light') => void;
}

const ThemeOption = ({ icon: Icon, title, value, current, onSelect }: ThemeOptionProps) => (
  <button
    onClick={() => onSelect(value as 'dark' | 'light')}
    className={cn(
      'flex flex-col items-center gap-3 rounded-[1.35rem] border p-5 text-center transition-all',
      current === value
        ? 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200'
        : 'border-border/70 bg-background/60 hover:border-sky-500/25 hover:bg-sky-500/5'
    )}
  >
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
      <Icon className="h-6 w-6" />
    </span>
    <span className="font-semibold">{title}</span>
    {current === value && <div className="h-2 w-2 rounded-full bg-sky-500" />}
  </button>
);

const PolicyLinkCard = ({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: ElementType;
  title: string;
  description: string;
  to: string;
}) => (
  <Link
    to={to}
    className="group rounded-[1.5rem] border border-border/70 bg-background/60 p-5 transition-all hover:border-sky-500/25 hover:bg-sky-500/5"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/10 bg-sky-500/10">
      <Icon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
    </div>
    <p className="mt-4 font-semibold text-slate-950 group-hover:text-sky-700 dark:text-slate-50 dark:group-hover:text-sky-200">{title}</p>
    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
  </Link>
);
