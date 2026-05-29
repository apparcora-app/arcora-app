import { Suspense, lazy, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Lock,
  Plus,
  Receipt,
  Upload,
  ArrowRight,
  FileText,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Timestamp } from 'firebase/firestore';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeferredUploadDocumentDialog } from '@/components/upload/DeferredUploadDocumentDialog';
import { AddBillForm } from '@/components/bills/AddBillForm';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatCurrency, formatRelativeTime, parseDateInputValue } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import type {
  BillingPeriod,
  DashboardStats,
  Document as StoredDocument,
  ReminderCategory,
  SubscriptionCategory,
} from '@/types';
import { getUrgencyBuckets, type UrgencyItem } from '@/lib/dashboard/urgency';

const DashboardChartsPanel = lazy(() =>
  import('./DashboardChartsPanel').then((module) => ({
    default: module.DashboardChartsPanel,
  })),
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const hoverScale = { y: -4, transition: { duration: 0.2 } };

type DashboardHeroContent = {
  badge: string;
  headline: string;
  body: string;
  trustLine: string;
};

type DashboardPriorityState = {
  title: string;
  body: string;
  reason: string;
};

type ActionQueueEntry = {
  item: UrgencyItem;
  statusLabel: string;
  tone: 'red' | 'amber' | 'sky';
};

type WeekTimelineDay = {
  key: string;
  label: string;
  dayNumber: string;
  isToday: boolean;
  items: UrgencyItem[];
};

type ActivityEntry = {
  id: string;
  title: string;
  description: string;
  date: Date | null;
  icon: React.ElementType;
  tone: keyof typeof signalToneClasses;
};

export const Dashboard = () => {
  const bills = useDataStore((state) => state.bills);
  const subscriptions = useDataStore((state) => state.subscriptions);
  const documents = useDataStore((state) => state.documents);
  const activeDocuments = useDataStore((state) => state.activeDocuments);
  const warranties = useDataStore((state) => state.warranties);
  const reminders = useDataStore((state) => state.reminders);
  const getDashboardInsights = useDataStore((state) => state.getDashboardInsights);
  const stats = useDataStore(useShallow((state) => state.getDashboardStats()));

  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [warrantyDialogOpen, setWarrantyDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const insights = getDashboardInsights();

  const urgency = useMemo(
    () => getUrgencyBuckets(bills, subscriptions, warranties, documents, reminders),
    [bills, subscriptions, warranties, documents, reminders],
  );
  const recentUploads = useMemo(
    () =>
      activeDocuments
        .filter((doc) => doc.sourceKind === 'upload')
        .sort((left, right) => right.createdAt.toDate().getTime() - left.createdAt.toDate().getTime())
        .slice(0, 4),
    [activeDocuments],
  );
  const pendingReminders = useMemo(
    () => reminders.filter((item) => item.status === 'pending'),
    [reminders],
  );
  const hasAnyData =
    bills.length + subscriptions.length + warranties.length + documents.length + reminders.length > 0;

  const handleUrgentItemClick = (item: UrgencyItem) => {
    navigate(`/${getRouteForUrgencyItem(item.type)}`);
    showToast({ title: 'Opening details...', description: item.title, type: 'info' });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setShouldRenderCharts(true), {
        timeout: 1200,
      });

      return () => window.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(() => setShouldRenderCharts(true), 350);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  const topPriorityItem =
    urgency.overdue[0] ?? urgency.dueThisWeek[0] ?? urgency.expiringSoon[0] ?? null;
  const documentsTheme = getSectionTheme('documents');
  const heroContent = getDashboardHeroContent({
    hasAnyData,
    hasPriorityItem: Boolean(topPriorityItem),
    firstName: user?.displayName?.split(' ')[0],
    topPriorityItem,
  });
  const setupItems = [
    {
      id: 'bill',
      label: 'Add your first bill',
      description: 'Track due dates before they become missed payments.',
      actionLabel: 'Add Bill',
      complete: bills.length > 0,
      onClick: () => setBillDialogOpen(true),
    },
    {
      id: 'document',
      label: 'Upload one important document',
      description: 'Keep a bill, certificate, ID, or letter easy to find later.',
      actionLabel: 'Upload Document',
      complete: documents.length > 0,
      onClick: () => setUploadDialogOpen(true),
    },
    {
      id: 'reminder',
      label: 'Create a reminder',
      description: 'Give yourself a nudge before deadlines and renewals slip.',
      actionLabel: 'Add Reminder',
      complete: reminders.length > 0,
      onClick: () => setReminderDialogOpen(true),
    },
  ] as const;
  const completedSetupSteps = setupItems.filter((item) => item.complete).length;
  const showSetupGuide = !setupDismissed && completedSetupSteps < setupItems.length;
  const firstIncompleteSetupItem = setupItems.find((item) => !item.complete) ?? null;
  const priorityState = getDashboardPriorityState({
    hasAnyData,
    topPriorityItem,
    overdueCount: urgency.overdue.length,
    dueSoonCount: urgency.dueThisWeek.length,
    expiringSoonCount: urgency.expiringSoon.length,
    firstIncompleteSetupItem,
    pendingReminderCount: pendingReminders.length,
    documentsCount: documents.length,
  });
  const actionQueueItems = useMemo(
    () => getActionQueueItems(urgency.overdue, urgency.dueThisWeek, urgency.expiringSoon),
    [urgency],
  );
  const weekTimelineDays = useMemo(
    () => getWeekTimelineDays([...urgency.dueThisWeek, ...urgency.expiringSoon]),
    [urgency],
  );
  const recentActivityItems = useMemo(
    () =>
      getRecentActivityItems({
        bills,
        subscriptions,
        warranties,
        documents,
        reminders,
      }),
    [bills, subscriptions, warranties, documents, reminders],
  );
  const monthlyBillSeries = useMemo(() => getMonthlyBillSeries(bills), [bills]);
  const totalRecords = documents.length + warranties.length + reminders.length;
  const openActionsCount = urgency.overdue.length + urgency.dueThisWeek.length + urgency.expiringSoon.length;

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-7"
      >
        <ArcoraFinalDashboard
          userName={user?.displayName || 'Your Name'}
          stats={stats}
          billsCount={bills.length}
          subscriptionsCount={subscriptions.length}
          documentsCount={documents.length}
          pendingRemindersCount={pendingReminders.length}
          totalRecords={totalRecords}
          openActionsCount={openActionsCount}
          actionQueueItems={actionQueueItems}
          weekTimelineDays={weekTimelineDays}
          recentActivityItems={recentActivityItems}
          recentUploads={recentUploads}
          recentUploadsCount={recentUploads.length}
          monthlyBillSeries={monthlyBillSeries}
          setupProgress={completedSetupSteps}
          setupTotal={setupItems.length}
          showSetupGuide={showSetupGuide}
          nextSetupAction={firstIncompleteSetupItem?.actionLabel ?? 'All set'}
          onDismissSetup={() => setSetupDismissed(true)}
          onAddBill={() => setBillDialogOpen(true)}
          onUpload={() => setUploadDialogOpen(true)}
          onAddReminder={() => setReminderDialogOpen(true)}
          onActionItemClick={handleUrgentItemClick}
        />

        {import.meta.env.VITE_SHOW_LEGACY_DASHBOARD === 'true' ? (
          <>
        <motion.div
          variants={itemVariants}
          className="grid gap-5 xl:grid-cols-[minmax(0,0.98fr)_320px_320px]"
        >
          <Card className="overflow-hidden border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(9,18,33,0.96),rgba(8,11,18,0.98))]">
            <CardContent className="p-6 md:p-8">
              <Badge className="border-sky-400/25 bg-sky-500/12 text-sky-100 hover:bg-sky-500/12">
                {heroContent.badge}
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-sky-50 md:text-4xl">
                {heroContent.headline}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/70 md:text-base">
                {heroContent.body}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => setBillDialogOpen(true)} className="border border-sky-400/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bill
                </Button>
                <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button variant="outline" onClick={() => setReminderDialogOpen(true)}>
                  <Bell className="mr-2 h-4 w-4" />
                  Reminder
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[1.75rem] border border-[#d9ddf3]/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(59,72,130,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/80 dark:text-sky-100/85">
                  Always In View
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-sky-50">
                  The signals that keep life admin calm.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-200/80 bg-sky-500/10 p-3 dark:border-white/10 dark:bg-white/10">
                <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-100" />
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-sky-100/70">
              Due dates, renewals, records, and reminders stay visible before they turn into stress.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <HeroSignal
                label="Needs Attention"
                value={urgency.overdue.length.toString()}
                helper="Immediate items"
                tone="sky"
              />
              <HeroSignal
                label="Due Soon"
                value={urgency.dueThisWeek.length.toString()}
                helper="This week"
                tone="sky"
              />
              <HeroSignal
                label="Stored Records"
                value={documents.length.toString()}
                helper="Ready when needed"
                tone="sky"
              />
              <HeroSignal
                label="Active Reminders"
                value={pendingReminders.length.toString()}
                helper="Keeps you ahead"
                tone="sky"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-sky-200/80 bg-sky-50/90 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700/70 dark:text-sky-100/60">
                Private By Design
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-sky-50/85">
                {heroContent.trustLine}
              </p>
            </div>
          </div>

          <Card className="border-border/70 bg-card/90">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700/80 dark:text-sky-300/80">
                    Today&apos;s Priority
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {priorityState.title}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                  <Clock className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {priorityState.body}
              </p>

              <div className="mt-5 space-y-3 rounded-[1.35rem] border border-border/60 bg-muted/15 p-4">
                <DashboardSummaryRow
                  label="Next Step"
                  value={firstIncompleteSetupItem?.actionLabel ?? (topPriorityItem ? 'Review item' : 'All clear')}
                />
                <DashboardSummaryRow
                  label="Timing"
                  value={topPriorityItem ? formatRelativeTime(topPriorityItem.date) : 'Whenever ready'}
                />
                <DashboardSummaryRow
                  label="Status"
                  value={
                    urgency.overdue.length > 0
                      ? 'Needs attention'
                      : urgency.dueThisWeek.length > 0
                        ? 'Due soon'
                        : urgency.expiringSoon.length > 0
                          ? 'Watch list'
                          : firstIncompleteSetupItem
                            ? 'Setup'
                            : 'On track'
                  }
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniOverviewCard
                  label="Recurring Spend"
                  value={formatCurrency(stats.monthlySubscriptions)}
                  tone="slate"
                />
                <MiniOverviewCard
                  label="Security Health"
                  value={`${stats.securityScore}/100`}
                  tone="slate"
                />
                <MiniOverviewCard
                  label="Coverage Watch"
                  value={stats.expiringWarranties.toString()}
                  tone="slate"
                />
                <MiniOverviewCard
                  label="Recent Uploads"
                  value={recentUploads.length.toString()}
                  tone="slate"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Due"
            value={formatCurrency(stats.totalDue)}
            subtitle="Bills waiting for payment"
            footnote={
              stats.pendingBills > 0
                ? `${stats.pendingBills} item${stats.pendingBills === 1 ? '' : 's'} to clear before they become urgent`
                : 'Nothing is currently asking for payment'
            }
            icon={Receipt}
            iconWrapClassName="bg-yellow-500/10"
            iconClassName="text-yellow-400"
          />

          <StatCard
            title="Monthly Subscriptions"
            value={formatCurrency(stats.monthlySubscriptions)}
            subtitle="Recurring charges kept visible"
            footnote={
              subscriptions.length > 0
                ? `${subscriptions.length} active service${subscriptions.length === 1 ? '' : 's'} in view`
                : 'No recurring charges added yet'
            }
            icon={CreditCard}
            iconWrapClassName="bg-blue-500/10"
            iconClassName="text-blue-400"
          />

          <StatCard
            title="Security Score"
            value={`${stats.securityScore}/100`}
            subtitle={
              stats.weakPasswords > 0
                ? `${stats.weakPasswords} password${stats.weakPasswords === 1 ? '' : 's'} need attention`
                : 'Passwords are currently in strong shape'
            }
            footnote={stats.securityScore >= 80 ? 'Private access is looking healthy' : 'A few updates would improve vault health'}
            icon={Lock}
            footnoteClassName={stats.securityScore >= 80 ? 'text-emerald-500' : 'text-yellow-500'}
            iconWrapClassName="bg-emerald-500/10"
            iconClassName="text-emerald-400"
          />

          <StatCard
            title="Expiring Soon"
            value={stats.expiringWarranties.toString()}
            subtitle="Coverage or records nearing deadlines"
            footnote={
              stats.expiringWarranties > 0
                ? 'Review soon so protection does not quietly lapse'
                : 'Nothing important is close to expiring'
            }
            icon={ShieldCheck}
            footnoteClassName={stats.expiringWarranties > 0 ? 'text-yellow-500' : 'text-emerald-500'}
            iconWrapClassName="bg-teal-500/10"
            iconClassName="text-teal-400"
          />
        </motion.div>

        {showSetupGuide ? (
          <CompactSetupGuide
            completedSteps={completedSetupSteps}
            totalSteps={setupItems.length}
            nextActionLabel={firstIncompleteSetupItem?.actionLabel ?? 'All set'}
            setupItems={setupItems}
            onDismiss={() => setSetupDismissed(true)}
          />
        ) : null}

        {/* --- INSIGHTS SECTION --- */}
        {insights.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Smart Insights
              </h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
              {insights.map((insight) => (
                <motion.button
                  key={insight.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => insight.actionRoute && navigate(`/${insight.actionRoute}`)}
                  className={cn(
                    "arcora-glow-edge flex-shrink-0 w-[280px] md:w-auto text-left p-4 rounded-lg border transition-all relative overflow-hidden group",
                    insight.type === 'alert' ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" :
                    insight.type === 'spending' ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
                    "bg-primary/5 border-primary/20 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      insight.type === 'alert' ? "bg-red-500/10 text-red-400" :
                      insight.type === 'spending' ? "bg-amber-500/10 text-amber-400" :
                      "bg-primary/10 text-primary"
                    )}>
                      {insight.type === 'alert' ? <ShieldAlert className="w-4 h-4" /> :
                       insight.type === 'spending' ? <TrendingUp className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    {insight.trend && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                        insight.trend.isGood ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {insight.trend.isGood ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {insight.trend.value}%
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{insight.description}</p>
                  {insight.actionLabel && (
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                      {insight.actionLabel}
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <ActionQueuePanel items={actionQueueItems} onItemClick={handleUrgentItemClick} />
          <WeekTimelinePanel days={weekTimelineDays} />
        </motion.div>

        {/* --- CHARTS ROW --- */}
        <motion.div variants={itemVariants}>
          {shouldRenderCharts ? (
            <Suspense fallback={<DashboardChartsFallback />}>
              <DashboardChartsPanel
                paidThisMonth={stats.paidThisMonth}
                totalDue={stats.totalDue}
                securityScore={stats.securityScore}
              />
            </Suspense>
          ) : (
            <DashboardChartsFallback />
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="border-border/70 bg-card/85">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileText className={cn('h-5 w-5', documentsTheme.iconClassName)} />
                Recent Uploads
              </CardTitle>
            </CardHeader>

            <CardContent>
              {recentUploads.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-500/20 bg-slate-500/5 px-6 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-slate-500/20 bg-slate-500/10">
                    <FileText className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Start your vault with a first upload</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Upload one important document to keep it protected, easy to find, and ready when life admin calls for it.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(true)}
                    className="mt-5"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {recentUploads.map((doc) => (
                    <motion.a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={hoverScale}
                      className="group overflow-hidden rounded-lg border border-border/70 bg-background/60"
                    >
                      <DocumentThumbnail doc={doc} className="h-40 rounded-none border-0" />
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={cn('capitalize', getSectionTheme(doc.section).badgeClassName)}>
                            {doc.section.replace('-', ' ')}
                          </Badge>
                          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            {doc.type.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                          {doc.title}
                        </p>
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {doc.extractedData?.summary || doc.fileName}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ActivityPanel items={recentActivityItems} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/70 bg-card/85">
            <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Quick Actions
                </p>
                <h3 className="mt-2 text-lg font-semibold">Add what matters next</h3>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <InlineActionButton icon={Receipt} label="Bill" onClick={() => setBillDialogOpen(true)} />
                <InlineActionButton icon={CreditCard} label="Subscription" onClick={() => setSubscriptionDialogOpen(true)} />
                <InlineActionButton icon={ShieldCheck} label="Warranty" onClick={() => setWarrantyDialogOpen(true)} />
                <InlineActionButton icon={Upload} label="Upload" onClick={() => setUploadDialogOpen(true)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </>
        ) : null}
      </motion.div>

      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          <AddBillForm onSuccess={() => setBillDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Add Reminder</DialogTitle>
          </DialogHeader>
          <QuickAddReminderForm onSuccess={() => setReminderDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Add Subscription</DialogTitle>
          </DialogHeader>
          <QuickAddSubscriptionForm onSuccess={() => setSubscriptionDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={warrantyDialogOpen} onOpenChange={setWarrantyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Add Warranty</DialogTitle>
          </DialogHeader>
          <QuickAddWarrantyForm onSuccess={() => setWarrantyDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <DeferredUploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        defaultSection="documents"
      />
    </>
  );
};

const signalToneClasses = {
  red: 'border-red-200/80 bg-red-50/90 dark:border-red-500/24 dark:bg-red-500/8',
  amber: 'border-amber-200/80 bg-amber-50/90 dark:border-amber-500/24 dark:bg-amber-500/8',
  slate: 'border-slate-200/80 bg-slate-50/90 dark:border-sky-500/10 dark:bg-sky-500/5',
  violet: 'border-violet-200/80 bg-violet-50/90 dark:border-violet-500/24 dark:bg-violet-500/8',
  emerald: 'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-500/24 dark:bg-emerald-500/8',
  sky: 'border-sky-200/80 bg-sky-50/90 dark:border-white/10 dark:bg-white/5',
} as const;

const DashboardChartsFallback = () => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {['Spending snapshot', 'Security health'].map((label) => (
      <Card key={label}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted/60" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const signalLabelClasses: Record<keyof typeof signalToneClasses, string> = {
  red: 'text-red-700/75 dark:text-red-200/75',
  amber: 'text-amber-700/75 dark:text-amber-100/60',
  slate: 'text-slate-600/80 dark:text-muted-foreground',
  violet: 'text-violet-700/75 dark:text-violet-200/70',
  emerald: 'text-emerald-700/75 dark:text-emerald-200/70',
  sky: 'text-sky-700/70 dark:text-sky-100/60',
};

const signalValueClasses: Record<keyof typeof signalToneClasses, string> = {
  red: 'text-red-950 dark:text-red-50',
  amber: 'text-amber-950 dark:text-amber-50',
  slate: 'text-slate-900 dark:text-slate-50',
  violet: 'text-violet-950 dark:text-violet-50',
  emerald: 'text-emerald-950 dark:text-emerald-50',
  sky: 'text-sky-950 dark:text-sky-50',
};

const HeroSignal = ({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: keyof typeof signalToneClasses;
}) => (
  <div className={cn('rounded-2xl border px-4 py-3', signalToneClasses[tone])}>
    <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em]', signalLabelClasses[tone])}>{label}</p>
    <p className={cn('mt-2 text-xl font-semibold', signalValueClasses[tone])}>{value}</p>
    <p className={cn('mt-2 text-[11px] leading-5', signalLabelClasses[tone])}>{helper}</p>
  </div>
);

const MiniOverviewCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof signalToneClasses;
}) => (
  <div className={cn('rounded-2xl border px-4 py-3', signalToneClasses[tone])}>
    <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em]', signalLabelClasses[tone])}>{label}</p>
    <p className={cn('mt-2 text-lg font-semibold', signalValueClasses[tone])}>{value}</p>
  </div>
);

const DashboardSummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium capitalize text-foreground">{value}</span>
  </div>
);

const ArcoraFinalDashboard = ({
  userName,
  stats,
  billsCount,
  subscriptionsCount,
  documentsCount,
  pendingRemindersCount,
  totalRecords,
  openActionsCount,
  actionQueueItems,
  weekTimelineDays,
  recentActivityItems,
  recentUploads,
  recentUploadsCount,
  monthlyBillSeries,
  setupProgress,
  setupTotal,
  showSetupGuide,
  nextSetupAction,
  onDismissSetup,
  onAddBill,
  onUpload,
  onAddReminder,
  onActionItemClick,
}: {
  userName: string;
  stats: DashboardStats;
  billsCount: number;
  subscriptionsCount: number;
  documentsCount: number;
  pendingRemindersCount: number;
  totalRecords: number;
  openActionsCount: number;
  actionQueueItems: ActionQueueEntry[];
  weekTimelineDays: WeekTimelineDay[];
  recentActivityItems: ActivityEntry[];
  recentUploads: StoredDocument[];
  recentUploadsCount: number;
  monthlyBillSeries: number[];
  setupProgress: number;
  setupTotal: number;
  showSetupGuide: boolean;
  nextSetupAction: string;
  onDismissSetup: () => void;
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
  onActionItemClick: (item: UrgencyItem) => void;
}) => {
  const setupPercent = Math.round((setupProgress / setupTotal) * 100);
  const firstName = userName.split(' ')[0] || 'there';

  return (
    <motion.div
      variants={itemVariants}
      className="arcora-orbit-dashboard overflow-hidden rounded-[1.6rem] border border-[#d9ddf3]/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.11),transparent_28%),linear-gradient(180deg,#fbfcff,#f1f4ff)] p-4 text-slate-950 shadow-[0_24px_70px_rgba(59,72,130,0.12)] md:p-5 dark:border-sky-500/15 dark:bg-[#070e17]/35 dark:bg-none dark:backdrop-blur-2xl dark:text-slate-50 dark:shadow-none"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Dashboard</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {firstName}. Here is your secure life-admin overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ArcoraPillButton icon={Receipt} label="Add Bill" onClick={onAddBill} />
          <ArcoraPillButton icon={Upload} label="Upload" onClick={onUpload} />
          <ArcoraPillButton icon={Bell} label="Reminder" onClick={onAddReminder} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ArcoraTopMetricCard
          icon={Receipt}
          label="Total Due"
          value={formatCurrency(stats.totalDue)}
          helper={`${stats.pendingBills} pending bill${stats.pendingBills === 1 ? '' : 's'}`}
          colors={['#2563eb', '#0e7490']}
          values={monthlyBillSeries}
        />
        <ArcoraTopMetricCard
          icon={CreditCard}
          label="Monthly Subscriptions"
          value={formatCurrency(stats.monthlySubscriptions)}
          helper={`${subscriptionsCount} active service${subscriptionsCount === 1 ? '' : 's'}`}
          colors={['#0f766e', '#115e59']}
          values={[subscriptionsCount, subscriptionsCount + 1, subscriptionsCount, subscriptionsCount + 2, subscriptionsCount + 1]}
        />
        <ArcoraTopMetricCard
          icon={AlertTriangle}
          label="Open Actions"
          value={openActionsCount.toString()}
          helper={openActionsCount > 0 ? 'Needs review' : 'All clear'}
          colors={['#b45309', '#92400e']}
          values={[openActionsCount, openActionsCount + 1, openActionsCount, openActionsCount + 2, openActionsCount + 1]}
        />
        <ArcoraTopMetricCard
          icon={ShieldCheck}
          label="Security Score"
          value={`${stats.securityScore}/100`}
          helper={stats.weakPasswords > 0 ? `${stats.weakPasswords} weak password${stats.weakPasswords === 1 ? '' : 's'}` : 'Vault healthy'}
          colors={['#7c3aed', '#5b21b6']}
          values={[
            Math.max(0, stats.securityScore - 8),
            Math.max(0, stats.securityScore - 4),
            stats.securityScore,
            Math.max(0, stats.securityScore - 2),
            stats.securityScore,
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex h-full flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ArcoraActivityChart values={monthlyBillSeries} />
            <ArcoraPaymentsPanel
              stats={stats}
              billsCount={billsCount}
              subscriptionsCount={subscriptionsCount}
              pendingRemindersCount={pendingRemindersCount}
              openActionsCount={openActionsCount}
              onAddBill={onAddBill}
            />
          </div>

          {showSetupGuide ? (
            <div className="rounded-[1.25rem] border border-sky-100 bg-white p-4 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Guided setup</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">
                    {setupProgress}/{setupTotal} essentials complete. Next: {nextSetupAction}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-44 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#0e7490)]"
                      style={{ width: `${setupPercent}%` }}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={onDismissSetup} className="text-slate-500 dark:text-slate-300">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <ArcoraFocusPanel
            stats={stats}
            documentsCount={documentsCount}
            pendingRemindersCount={pendingRemindersCount}
            totalRecords={totalRecords}
          />

          <ArcoraActivityTable items={recentActivityItems} className="flex-1" />
        </div>

        <div className="flex h-full flex-col gap-4">
          <ArcoraEfficiencyPanel
            securityScore={stats.securityScore}
            setupPercent={setupPercent}
            openActionsCount={openActionsCount}
            recentUploadsCount={recentUploadsCount}
          />
          <ArcoraQuickPanel
            weekTimelineDays={weekTimelineDays}
            actionQueueItems={actionQueueItems}
            onAddBill={onAddBill}
            onUpload={onUpload}
            onAddReminder={onAddReminder}
            onActionItemClick={onActionItemClick}
          />
          <ArcoraNextUpPanel
            items={actionQueueItems}
            onItemClick={onActionItemClick}
            onAddBill={onAddBill}
            onAddReminder={onAddReminder}
            onUpload={onUpload}
          />
        </div>
      </div>

      <ArcoraRecentFiles files={recentUploads} onUpload={onUpload} />
    </motion.div>
  );
};

const ArcoraTopMetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  colors,
  values,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  colors: [string, string];
  values: number[];
}) => {
  const wave = getSparklinePolyline(values, 220, 50);

  return (
    <div
      className="relative min-h-36 overflow-hidden rounded-[1.15rem] p-5 text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.18]">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/[0.18] px-2.5 py-1 text-[10px] font-bold">{helper}</span>
      </div>
      <p className="relative z-10 mt-5 text-2xl font-semibold leading-none">{value}</p>
      <p className="relative z-10 mt-2 text-xs font-medium text-white/80">{label}</p>
      <svg viewBox="0 0 220 62" className="absolute inset-x-0 bottom-0 h-16 w-full opacity-55">
        <path d={`M 0,62 L ${wave.points} L 220,62 Z`} fill="rgba(255,255,255,0.22)" />
        <polyline points={wave.points} fill="none" stroke="rgba(255,255,255,0.54)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const ArcoraDetailsPanel = ({
  totalManagedItems,
  billsCount,
  documentsCount,
  subscriptionsCount,
  warrantiesCount,
  pendingRemindersCount,
  userEmail,
}: {
  totalManagedItems: number;
  billsCount: number;
  documentsCount: number;
  subscriptionsCount: number;
  warrantiesCount: number;
  pendingRemindersCount: number;
  userEmail?: string;
}) => {
  const breakdown = [
    { label: 'Bills', value: billsCount, color: '#38bdf8' },
    { label: 'Documents', value: documentsCount, color: '#22d3ee' },
    { label: 'Subscriptions', value: subscriptionsCount, color: '#8b5cf6' },
    { label: 'Warranties', value: warrantiesCount, color: '#34d399' },
    { label: 'Reminders', value: pendingRemindersCount, color: '#f59e0b' },
  ];

  return (
    <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Life Admin Details</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {totalManagedItems} tracked item{totalManagedItems === 1 ? '' : 's'} across Arcora.
              </p>
            </div>
            <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
              Private
            </Badge>
          </div>

          <div className="relative mt-6 h-36 max-w-sm">
            <div className="absolute left-4 top-2 h-28 w-48 rotate-[-8deg] rounded-2xl bg-[linear-gradient(135deg,#2563eb,#22d3ee)] p-4 text-white shadow-xl">
              <p className="text-xs text-white/70">Arcora Vault</p>
              <p className="mt-8 text-lg font-semibold">{totalManagedItems} items</p>
            </div>
            <div className="absolute left-20 top-8 h-28 w-48 rotate-[5deg] rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#db2777)] p-4 text-white shadow-xl">
              <p className="text-xs text-white/70">Secure account</p>
              <p className="mt-8 truncate text-sm font-semibold">{userEmail || 'Private access'}</p>
            </div>
          </div>
        </div>

        <div className="grid min-w-[220px] gap-2">
          {breakdown.map((item) => {
            const percent = totalManagedItems > 0 ? Math.round((item.value / totalManagedItems) * 100) : 0;

            return (
              <div key={item.label} className="grid grid-cols-[12px_minmax(0,1fr)_44px] items-center gap-3 text-xs">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="text-right font-semibold text-slate-950 dark:text-slate-50">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ArcoraPaymentsPanel = ({
  stats,
  billsCount,
  subscriptionsCount,
  pendingRemindersCount,
  openActionsCount,
  onAddBill,
}: {
  stats: DashboardStats;
  billsCount: number;
  subscriptionsCount: number;
  pendingRemindersCount: number;
  openActionsCount: number;
  onAddBill: () => void;
}) => {
  const totalPaymentSignal = stats.totalDue + stats.monthlySubscriptions + stats.paidThisMonth;
  const rows = [
    {
      label: 'Bills due',
      value: stats.totalDue,
      display: formatCurrency(stats.totalDue),
      helper: `${stats.pendingBills} pending`,
      max: Math.max(totalPaymentSignal, 1),
      color: '#22d3ee',
    },
    {
      label: 'Subscriptions',
      value: stats.monthlySubscriptions,
      display: formatCurrency(stats.monthlySubscriptions),
      helper: `${subscriptionsCount} active`,
      max: Math.max(totalPaymentSignal, 1),
      color: '#f59e0b',
    },
    {
      label: 'Paid total',
      value: stats.paidThisMonth,
      display: formatCurrency(stats.paidThisMonth),
      helper: `${billsCount} bill records`,
      max: Math.max(totalPaymentSignal, 1),
      color: '#8b5cf6',
    },
    {
      label: 'Reminders',
      value: pendingRemindersCount,
      display: pendingRemindersCount.toString(),
      helper: `${openActionsCount} open actions`,
      max: Math.max(openActionsCount + pendingRemindersCount + 2, 4),
      color: '#38bdf8',
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Payments</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bills and recurring spend that need attention.
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
          {formatCurrency(stats.totalDue)} due
        </Badge>
      </div>

      <div className="mt-6 flex-1 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{row.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{row.helper}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">{row.display}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0e7490)] p-4 text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/15">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Payment Window</p>
              <p className="mt-0.5 text-xs text-white/75">{formatCurrency(stats.totalDue)} currently due</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddBill}
            className="shrink-0 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Add Bill
          </button>
        </div>
      </div>
    </div>
  );
};

const ArcoraEfficiencyPanel = ({
  securityScore,
  setupPercent,
  openActionsCount,
  recentUploadsCount,
}: {
  securityScore: number;
  setupPercent: number;
  openActionsCount: number;
  recentUploadsCount: number;
}) => {
  const calmScore = Math.max(0, Math.min(100, Math.round((securityScore + setupPercent + Math.max(0, 100 - openActionsCount * 12)) / 3)));

  return (
    <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Efficiency</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Calm admin score</p>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-500/12 text-sky-500">
          <Activity className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-6 grid place-items-center">
        <div
          className="grid h-36 w-36 place-items-center rounded-full"
          style={{ background: `conic-gradient(#38bdf8 0 ${calmScore * 3.6}deg, #22d3ee ${calmScore * 3.6}deg ${Math.min(360, calmScore * 3.6 + 62)}deg, rgba(148,163,184,0.18) ${Math.min(360, calmScore * 3.6 + 62)}deg 360deg)` }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#ffffff] text-center shadow-inner dark:bg-[#0d1624]">
            <div>
              <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{calmScore}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">score</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="font-semibold text-slate-950 dark:text-slate-50">{openActionsCount}</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Actions</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="font-semibold text-slate-950 dark:text-slate-50">{recentUploadsCount}</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Uploads</p>
        </div>
      </div>
    </div>
  );
};

const ArcoraActivityChart = ({ values }: { values: number[] }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const visibleValues = values.slice(0, 6);
  const max = Math.max(...visibleValues, 1);

  return (
    <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Activity</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bill movement by month</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />Due</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Watch</span>
        </div>
      </div>

      <div className="mt-6 flex h-48 items-end justify-between gap-3">
        {visibleValues.map((value, index) => {
          const primaryHeight = Math.max(14, (value / max) * 150);
          const secondaryHeight = Math.max(10, ((value + index + 1) / (max + 6)) * 120);

          return (
            <div key={months[index]} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-40 items-end gap-1.5">
                <span className="w-3 rounded-t-full bg-sky-400" style={{ height: `${primaryHeight}px` }} />
                <span className="w-3 rounded-t-full bg-amber-400" style={{ height: `${secondaryHeight}px` }} />
              </div>
              <span className="text-[11px] font-medium text-slate-400">{months[index]}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0e7490)] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Due Date Flow</p>
            <p className="mt-1 text-xs text-white/70">Tracked from your bills</p>
          </div>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

const ArcoraFocusPanel = ({
  stats,
  documentsCount,
  pendingRemindersCount,
  totalRecords,
}: {
  stats: DashboardStats;
  documentsCount: number;
  pendingRemindersCount: number;
  totalRecords: number;
}) => {
  const rows = [
    {
      label: 'Bills',
      value: stats.totalDue,
      display: formatCurrency(stats.totalDue),
      max: Math.max(stats.totalDue + stats.paidThisMonth, 1),
      color: '#38bdf8',
    },
    {
      label: 'Subscriptions',
      value: stats.monthlySubscriptions,
      display: formatCurrency(stats.monthlySubscriptions),
      max: Math.max(stats.monthlySubscriptions * 2, 1),
      color: '#f59e0b',
    },
    {
      label: 'Documents',
      value: documentsCount,
      display: documentsCount.toString(),
      max: Math.max(totalRecords, 1),
      color: '#22d3ee',
    },
    {
      label: 'Reminders',
      value: pendingRemindersCount,
      display: pendingRemindersCount.toString(),
      max: Math.max(pendingRemindersCount + 3, 4),
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Focus Areas</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Where your attention is going</p>
        </div>
        <Badge className="rounded-full border-0 bg-cyan-500/12 text-cyan-700 hover:bg-cyan-500/12 dark:text-cyan-200">
          Live
        </Badge>
      </div>

      <div className="mt-6 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{row.label}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{row.display}</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,#b45309,#92400e)] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Setup Health</p>
            <p className="mt-1 text-xs text-white/75">Keep essentials complete</p>
          </div>
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const ArcoraQuickPanel = ({
  weekTimelineDays,
  actionQueueItems,
  onAddBill,
  onUpload,
  onAddReminder,
  onActionItemClick,
}: {
  weekTimelineDays: WeekTimelineDay[];
  actionQueueItems: ActionQueueEntry[];
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
  onActionItemClick: (item: UrgencyItem) => void;
}) => (
  <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Quick Admin</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add or review what matters next</p>
      </div>
      <span className="text-lg text-slate-300">...</span>
    </div>

    <div className="mt-5 grid gap-2">
      <ArcoraPillButton icon={Receipt} label="Add Bill" onClick={onAddBill} className="justify-center bg-[#2563eb] text-white hover:bg-[#1d4ed8] dark:bg-[#2563eb] dark:text-white dark:hover:bg-[#1d4ed8]" />
      <ArcoraPillButton icon={Upload} label="Upload Document" onClick={onUpload} className="justify-center" />
      <ArcoraPillButton icon={Bell} label="Add Reminder" onClick={onAddReminder} className="justify-center" />
    </div>

    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">This Week</p>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekTimelineDays.map((day) => (
          <div
            key={day.key}
            className={cn(
              'min-h-14 overflow-hidden rounded-2xl border px-1 py-2 text-center',
              day.isToday
                ? 'border-sky-400 bg-sky-500/10 text-sky-600 dark:border-sky-400/60 dark:bg-sky-400/15 dark:text-sky-200'
                : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
            )}
          >
            <p className="truncate text-[8px] font-bold uppercase tracking-normal">{day.label}</p>
            <p className="mt-1 text-xs font-bold text-slate-950 dark:text-slate-50">{day.dayNumber}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 space-y-2">
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Action Queue</p>
      {actionQueueItems.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-3 py-5 text-center text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
          Nothing urgent right now.
        </p>
      ) : (
        actionQueueItems.slice(0, 3).map(({ item, statusLabel, tone }) => {
          const Icon = getUrgencyTypeIcon(item.type);

          return (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => onActionItemClick(item)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-sky-300/40 hover:bg-white dark:border-white/10 dark:bg-white/5"
            >
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-2xl border', signalToneClasses[tone])}>
                <Icon className={cn('h-4 w-4', signalValueClasses[tone])} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-950 dark:text-slate-50">{item.title}</span>
                <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{statusLabel}</span>
              </span>
            </button>
          );
        })
      )}
    </div>
  </div>
);

const ArcoraRecordsPanel = ({
  totalRecords,
  onAddSubscription,
  onAddWarranty,
}: {
  totalRecords: number;
  onAddSubscription: () => void;
  onAddWarranty: () => void;
}) => (
  <div className="rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
    <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Records Snapshot</p>
    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center dark:bg-white/5">
      <p className="text-4xl font-semibold text-slate-950 dark:text-slate-50">{totalRecords}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Documents, warranties, and reminders</p>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <ArcoraPillButton icon={CreditCard} label="Sub" onClick={onAddSubscription} className="justify-center" />
      <ArcoraPillButton icon={ShieldCheck} label="Warranty" onClick={onAddWarranty} className="justify-center" />
    </div>
  </div>
);

const ArcoraNextUpPanel = ({
  items,
  onItemClick,
  onAddBill,
  onAddReminder,
  onUpload,
}: {
  items: ActionQueueEntry[];
  onItemClick: (item: UrgencyItem) => void;
  onAddBill: () => void;
  onAddReminder: () => void;
  onUpload: () => void;
}) => {
  const primary = items[0];
  const remaining = items.slice(1, 5);

  return (
    <div className="flex min-h-[430px] flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Next Up</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            The next bill, renewal, warranty, or reminder to handle.
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
          {items.length > 0 ? `${items.length} item${items.length === 1 ? '' : 's'}` : 'Clear'}
        </Badge>
      </div>

      {primary ? (
        <>
          <button
            type="button"
            onClick={() => onItemClick(primary.item)}
            className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0e7490)] p-4 text-left text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:brightness-110"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/15">
                {(() => {
                  const Icon = getUrgencyTypeIcon(primary.item.type);
                  return <Icon className="h-5 w-5" />;
                })()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                  {primary.statusLabel}
                </span>
                <span className="mt-1 block truncate text-base font-semibold">{primary.item.title}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <Clock className="h-3.5 w-3.5" />
                  {formatNextUpDate(primary.item)}
                  {typeof primary.item.amount === 'number' ? <span>{formatCurrency(primary.item.amount)}</span> : null}
                </span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/75" />
            </div>
          </button>

          <div className="mt-5 flex-1 space-y-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Coming Next</p>
            {remaining.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
                Nothing else is queued after this.
              </div>
            ) : (
              remaining.map(({ item, statusLabel, tone }) => {
                const Icon = getUrgencyTypeIcon(item.type);

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => onItemClick(item)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-sky-300/40 hover:bg-white dark:border-white/10 dark:bg-white/5"
                  >
                    <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-2xl border', signalToneClasses[tone])}>
                      <Icon className={cn('h-4 w-4', signalValueClasses[tone])} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-950 dark:text-slate-50">{item.title}</span>
                      <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                        {statusLabel} - {formatNextUpDate(item)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="mt-5 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-sky-400/25 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.40),transparent_34%),linear-gradient(135deg,#2563eb,#0e7490)] px-5 py-10 text-center text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)]">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-semibold">Nothing urgent right now</p>
            <p className="mt-2 max-w-xs text-xs leading-5 text-white/75">
              Add the next bill, reminder, or document so Arcora can keep your upcoming admin visible.
            </p>
            <div className="mt-5 grid w-full max-w-xs grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/15 px-3 py-2">
                <p className="text-sm font-semibold">0</p>
                <p className="mt-0.5 text-[10px] text-white/70">Overdue</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-3 py-2">
                <p className="text-sm font-semibold">7</p>
                <p className="mt-0.5 text-[10px] text-white/70">Days</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-3 py-2">
                <p className="text-sm font-semibold">Calm</p>
                <p className="mt-0.5 text-[10px] text-white/70">Status</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <ArcoraPillButton
          icon={Receipt}
          label="Add Bill"
          onClick={onAddBill}
          className="justify-center border-0 bg-[linear-gradient(135deg,#2563eb,#0e7490)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] hover:bg-[linear-gradient(135deg,#1d4ed8,#0e7490)] hover:text-white dark:text-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <ArcoraPillButton
            icon={Bell}
            label="Reminder"
            onClick={onAddReminder}
            className="justify-center border-sky-300/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200"
          />
          <ArcoraPillButton
            icon={Upload}
            label="Upload"
            onClick={onUpload}
            className="justify-center border-cyan-300/40 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-200"
          />
        </div>
      </div>
    </div>
  );
};

const ArcoraRecentFiles = ({
  files,
  onUpload,
}: {
  files: StoredDocument[];
  onUpload: () => void;
}) => (
  <div className="mt-4 rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Recent Files</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest uploads ready when you need them.</p>
      </div>
      <ArcoraPillButton icon={Upload} label="Upload Document" onClick={onUpload} />
    </div>

    {files.length === 0 ? (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-white/[0.07]">
          <FileText className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-slate-50">No recent files yet</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
          Upload a bill, certificate, receipt, or important record and it will appear here.
        </p>
      </div>
    ) : (
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {files.map((doc) => {
          const theme = getSectionTheme(doc.section);

          return (
            <motion.a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={hoverScale}
              className="group overflow-hidden rounded-[1.15rem] border border-slate-200 bg-slate-50/70 text-left transition hover:border-sky-300/50 hover:bg-white dark:border-white/10 dark:bg-white/5"
            >
              <DocumentThumbnail doc={doc} className="h-36 rounded-none border-0" />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={cn('capitalize', theme.badgeClassName)}>
                    {doc.section.replace('-', ' ')}
                  </Badge>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {formatRelativeTime(doc.createdAt.toDate())}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-slate-950 transition-colors group-hover:text-sky-600 dark:text-slate-50">
                  {doc.title}
                </p>
                <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {doc.extractedData?.summary || doc.fileName}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    )}
  </div>
);

const ArcoraPillButton = ({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/10',
      className,
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

const OrbitDashboardBoard = ({
  userName,
  userEmail,
  stats,
  billsCount,
  subscriptionsCount,
  documentsCount,
  warrantiesCount,
  pendingRemindersCount,
  totalRecords,
  openActionsCount,
  actionQueueItems,
  weekTimelineDays,
  recentActivityItems,
  recentUploads,
  monthlyBillSeries,
  setupProgress,
  setupTotal,
  showSetupGuide,
  nextSetupAction,
  onDismissSetup,
  onAddBill,
  onUpload,
  onAddReminder,
  onAddSubscription,
  onAddWarranty,
  onActionItemClick,
}: {
  userName: string;
  userEmail?: string;
  stats: DashboardStats;
  billsCount: number;
  subscriptionsCount: number;
  documentsCount: number;
  warrantiesCount: number;
  pendingRemindersCount: number;
  totalRecords: number;
  openActionsCount: number;
  actionQueueItems: ActionQueueEntry[];
  weekTimelineDays: WeekTimelineDay[];
  recentActivityItems: ActivityEntry[];
  recentUploads: StoredDocument[];
  monthlyBillSeries: number[];
  setupProgress: number;
  setupTotal: number;
  showSetupGuide: boolean;
  nextSetupAction: string;
  onDismissSetup: () => void;
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
  onAddSubscription: () => void;
  onAddWarranty: () => void;
  onActionItemClick: (item: UrgencyItem) => void;
}) => {
  const setupPercent = Math.round((setupProgress / setupTotal) * 100);
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const totalManagedItems = billsCount + subscriptionsCount + documentsCount + warrantiesCount + pendingRemindersCount;

  return (
    <motion.div
      variants={itemVariants}
      className="arcora-orbit-dashboard overflow-hidden rounded-[1.8rem] border border-white/80 bg-[#f4f7fb] p-4 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.22)] md:p-5 dark:border-sky-500/20 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(9,18,33,0.96),rgba(8,11,18,0.98))] dark:text-slate-50 dark:shadow-none"
    >
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <OrbitProfileCard
          userName={userName}
          userEmail={userEmail}
          currentDate={currentDate}
          securityScore={stats.securityScore}
          setupPercent={setupPercent}
        />

        <div className="space-y-4">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950">Overview</p>
                <p className="mt-1 text-xs text-slate-500">
                  Your secure life-admin summary, tuned to Arcora&apos;s own color system.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <OrbitSmallButton icon={Receipt} label="Bill" onClick={onAddBill} />
                <OrbitSmallButton icon={Upload} label="Upload" onClick={onUpload} />
                <OrbitSmallButton icon={Bell} label="Reminder" onClick={onAddReminder} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <ArcoraOverviewCard
              icon={Receipt}
              label="Total Due"
              value={formatCurrency(stats.totalDue)}
              helper={`${stats.pendingBills} pending bill${stats.pendingBills === 1 ? '' : 's'}`}
              accent="sky"
              featured
            />
            <ArcoraOverviewCard
              icon={CreditCard}
              label="Monthly Subscriptions"
              value={formatCurrency(stats.monthlySubscriptions)}
              helper={`${subscriptionsCount} active service${subscriptionsCount === 1 ? '' : 's'}`}
              accent="cyan"
            />
            <ArcoraOverviewCard
              icon={AlertTriangle}
              label="Open Actions"
              value={openActionsCount.toString()}
              helper={openActionsCount > 0 ? 'Needs review' : 'All clear'}
              accent="amber"
            />
            <ArcoraOverviewCard
              icon={ShieldCheck}
              label="Security Score"
              value={`${stats.securityScore}/100`}
              helper={stats.weakPasswords > 0 ? `${stats.weakPasswords} weak password${stats.weakPasswords === 1 ? '' : 's'}` : 'Vault looks healthy'}
              accent="emerald"
            />
          </div>
        </div>
      </div>

      {showSetupGuide ? (
        <OrbitSetupStrip
          setupProgress={setupProgress}
          setupTotal={setupTotal}
          setupPercent={setupPercent}
          nextSetupAction={nextSetupAction}
          onDismissSetup={onDismissSetup}
        />
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)_300px]">
        <ArcoraLifeAdminPanel
          billsCount={billsCount}
          documentsCount={documentsCount}
          warrantiesCount={warrantiesCount}
          pendingRemindersCount={pendingRemindersCount}
          totalManagedItems={totalManagedItems}
          setupProgress={setupProgress}
          setupTotal={setupTotal}
          onAddSubscription={onAddSubscription}
          onAddWarranty={onAddWarranty}
        />
        <OrbitChartPanel values={monthlyBillSeries} />
        <OrbitQuickCapture
          totalDue={stats.totalDue}
          onAddBill={onAddBill}
          onUpload={onUpload}
          onAddReminder={onAddReminder}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ArcoraActivityTable items={recentActivityItems} />
        <OrbitSideStack
          weekTimelineDays={weekTimelineDays}
          totalRecords={totalRecords}
          actionQueueItems={actionQueueItems}
          onActionItemClick={onActionItemClick}
        />
      </div>

      <OrbitRecentFiles files={recentUploads} onUpload={onUpload} />
    </motion.div>
  );
};

const overviewAccentClasses = {
  sky: {
    icon: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-200',
    featured: 'border-sky-400/30 bg-[linear-gradient(135deg,#0284c7,#0f766e)] text-white dark:border-sky-300/20',
  },
  cyan: {
    icon: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-300',
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
    featured: '',
  },
  amber: {
    icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
    featured: '',
  },
  emerald: {
    icon: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    featured: '',
  },
} as const;

const ArcoraOverviewCard = ({
  icon: Icon,
  label,
  value,
  helper,
  accent,
  featured = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  accent: keyof typeof overviewAccentClasses;
  featured?: boolean;
}) => {
  const styles = overviewAccentClasses[accent];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]',
        featured && styles.featured,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('grid h-10 w-10 place-items-center rounded-2xl', featured ? 'bg-white/20 text-white' : styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold', featured ? 'bg-white/20 text-white' : styles.badge)}>
          {helper}
        </span>
      </div>
      <p className={cn('mt-5 text-2xl font-semibold leading-none', featured ? 'text-white' : 'text-slate-950')}>
        {value}
      </p>
      <p className={cn('mt-2 text-xs font-medium', featured ? 'text-white/75' : 'text-slate-500')}>
        {label}
      </p>
    </div>
  );
};

const ArcoraLifeAdminPanel = ({
  billsCount,
  documentsCount,
  warrantiesCount,
  pendingRemindersCount,
  totalManagedItems,
  setupProgress,
  setupTotal,
  onAddSubscription,
  onAddWarranty,
}: {
  billsCount: number;
  documentsCount: number;
  warrantiesCount: number;
  pendingRemindersCount: number;
  totalManagedItems: number;
  setupProgress: number;
  setupTotal: number;
  onAddSubscription: () => void;
  onAddWarranty: () => void;
}) => {
  const tiles = [
    { label: 'Bills', value: billsCount, helper: 'Payment records', icon: Receipt, color: '#38bdf8' },
    { label: 'Documents', value: documentsCount, helper: 'Stored files', icon: FileText, color: '#22d3ee' },
    { label: 'Reminders', value: pendingRemindersCount, helper: 'Pending nudges', icon: Bell, color: '#f59e0b' },
    { label: 'Warranties', value: warrantiesCount, helper: 'Coverage items', icon: ShieldCheck, color: '#34d399' },
  ];

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">My Arcora</p>
          <p className="mt-1 text-xs text-slate-500">
            {totalManagedItems} tracked item{totalManagedItems === 1 ? '' : 's'} across your life admin.
          </p>
        </div>
        <div className="flex gap-2">
          <OrbitSmallButton icon={CreditCard} label="Sub" onClick={onAddSubscription} />
          <OrbitSmallButton icon={ShieldCheck} label="Warranty" onClick={onAddWarranty} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <div key={tile.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: `${tile.color}18`, color: tile.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-semibold text-slate-950">{tile.value}</p>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">{tile.label}</p>
              <p className="mt-1 text-xs text-slate-500">{tile.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Setup Progress</span>
          <span>{setupProgress}/{setupTotal}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#22d3ee)]"
            style={{ width: `${(setupProgress / setupTotal) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const OrbitProfileCard = ({
  userName,
  userEmail,
  currentDate,
  securityScore,
  setupPercent,
}: {
  userName: string;
  userEmail?: string;
  currentDate: string;
  securityScore: number;
  setupPercent: number;
}) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(145deg,#15b8aa,#2276d2)] text-sm font-bold text-white shadow-[0_12px_26px_rgba(14,165,233,0.25)]">
        {getInitials(userName)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-950">{userName}</p>
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Welcome to dashboard
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Setup</span>
        <span>{setupPercent}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#635bff,#15b8aa)]"
          style={{ width: `${setupPercent}%` }}
        />
      </div>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      <div>
        <p className="text-slate-950">{securityScore} score</p>
        <p className="mt-1 truncate">{userEmail || 'Private account'}</p>
      </div>
      <div className="text-right">
        <p className="text-slate-950">{currentDate}</p>
        <p className="mt-1">Today</p>
      </div>
    </div>
  </div>
);

const OrbitMetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  accent,
  values,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  accent: string;
  values: number[];
}) => {
  const sparkline = getSparklinePolyline(values, 140, 44);

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-slate-950">{value}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{label}</p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold"
          style={{ backgroundColor: `${accent}16`, color: accent }}
        >
          {helper}
        </span>
      </div>
      <svg viewBox="0 0 140 52" className="mt-3 h-12 w-full overflow-visible">
        <path d={`M ${sparkline.areaStart} L ${sparkline.points} L ${sparkline.areaEnd} Z`} fill={accent} opacity="0.12" />
        <polyline points={sparkline.points} fill="none" stroke={accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    </div>
  );
};

const OrbitSetupStrip = ({
  setupProgress,
  setupTotal,
  setupPercent,
  nextSetupAction,
  onDismissSetup,
}: {
  setupProgress: number;
  setupTotal: number;
  setupPercent: number;
  nextSetupAction: string;
  onDismissSetup: () => void;
}) => (
  <div className="mt-4 rounded-[1.25rem] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#159dba]">
          Guided setup
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {setupProgress}/{setupTotal} essentials complete. Next: {nextSetupAction}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-44 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#635bff,#15b8aa)]"
            style={{ width: `${setupPercent}%` }}
          />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onDismissSetup} className="text-slate-500">
          Dismiss
        </Button>
      </div>
    </div>
  </div>
);

const OrbitSpendingPanel = ({
  rows,
  paidRatio,
  readinessScore,
  securityScore,
}: {
  rows: Array<{
    label: string;
    value: number;
    limit: number;
    color: string;
    isCurrency: boolean;
  }>;
  paidRatio: number;
  readinessScore: number;
  securityScore: number;
}) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-950">Spending & Records</p>
        <p className="mt-1 text-xs text-slate-500">The most important signals without extra noise.</p>
      </div>
      <span className="text-lg text-slate-300">...</span>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(260px,1fr)]">
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[4px_minmax(0,1fr)] gap-3">
            <span className="rounded-full" style={{ backgroundColor: row.color }} />
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{row.label}</p>
                <p className="text-xs text-slate-400">
                  {row.isCurrency ? `${formatCurrency(row.value)}/${formatCurrency(row.limit)}` : `${row.value}/${row.limit}`}
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (row.value / row.limit) * 100)}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OrbitTileMetric color="#635bff" label="Paid" value={paidRatio} />
        <OrbitTileMetric color="#10b8ad" label="Ready" value={readinessScore} />
        <OrbitTileMetric color="#ffb24c" label="Security" value={securityScore} />
        <OrbitTileMetric color="#39b8e7" label="Organized" value={Math.min(100, rows[3]?.value * 12 || 0)} />
      </div>
    </div>
  </div>
);

const OrbitTileMetric = ({ color, label, value }: { color: string; label: string; value: number }) => (
  <div
    className="flex min-h-32 flex-col justify-between rounded-lg p-4 text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
    style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }}
  >
    <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20">
      <div
        className="grid h-12 w-12 place-items-center rounded-full bg-white/25 text-xs font-bold"
        style={{ background: `conic-gradient(white 0 ${value * 3.6}deg, rgba(255,255,255,0.28) ${value * 3.6}deg 360deg)` }}
      >
        <span>{value}%</span>
      </div>
    </div>
    <p className="text-sm font-semibold">{label}</p>
  </div>
);

const OrbitQuickCapture = ({
  totalDue,
  onAddBill,
  onUpload,
  onAddReminder,
}: {
  totalDue: number;
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
}) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-base font-semibold text-slate-950">Quick Capture</p>
      <span className="text-lg text-slate-300">...</span>
    </div>
    <p className="mt-1 text-xs text-slate-500">Add the next thing without leaving the dashboard.</p>

    <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current Due</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrency(totalDue)}</p>
      <div className="mx-auto mt-4 h-2 max-w-44 rounded-full bg-slate-200">
        <div className="h-full w-2/3 rounded-full bg-[#635bff]" />
      </div>
    </div>

    <div className="mt-5 grid gap-2">
      <OrbitSmallButton icon={Receipt} label="Add Bill" onClick={onAddBill} className="justify-center bg-[#635bff] text-white hover:bg-[#5148f0] hover:text-white" />
      <OrbitSmallButton icon={Upload} label="Upload Document" onClick={onUpload} className="justify-center" />
      <OrbitSmallButton icon={Bell} label="Add Reminder" onClick={onAddReminder} className="justify-center" />
    </div>
  </div>
);

const OrbitActionQueue = ({
  items,
  onItemClick,
}: {
  items: ActionQueueEntry[];
  onItemClick: (item: UrgencyItem) => void;
}) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-950">Action Queue</p>
        <p className="mt-1 text-xs text-slate-500">Handle these first.</p>
      </div>
      <Badge className="rounded-full border-0 bg-[#635bff] text-white hover:bg-[#635bff]">{items.length}</Badge>
    </div>

    <div className="mt-4 space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
          Everything is clear right now.
        </div>
      ) : (
        items.slice(0, 4).map(({ item, statusLabel, tone }) => {
          const Icon = getUrgencyTypeIcon(item.type);
          const colorClassName =
            tone === 'red'
              ? 'bg-rose-50 text-rose-600'
              : tone === 'amber'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-sky-50 text-sky-600';

          return (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => onItemClick(item)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-[#635bff]/30 hover:bg-white"
            >
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', colorClassName)}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-950">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{statusLabel} / {formatRelativeTime(item.date)}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          );
        })
      )}
    </div>
  </div>
);

const OrbitChartPanel = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 30 + index * 48;
    const y = 178 - (value / max) * 128;
    return { x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = `M ${points[0]?.x ?? 30},190 L ${polyline} L ${points[points.length - 1]?.x ?? 558},190 Z`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">Due Date Flow</p>
          <p className="mt-1 text-xs text-slate-500">Monthly bill movement across the year.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          This Year
        </span>
      </div>

      <div className="mt-4 h-64">
        <svg viewBox="0 0 600 230" className="h-full w-full overflow-visible">
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="30"
              x2="558"
              y1={52 + line * 42}
              y2={52 + line * 42}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {points.map((point) => (
            <line key={point.x} x1={point.x} x2={point.x} y1="38" y2="190" stroke="#eef2f7" strokeWidth="1" />
          ))}
          <path d={areaPath} fill="rgba(99,91,255,0.1)" />
          <polyline points={polyline} fill="none" stroke="#635bff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="5" fill="#ffb24c" stroke="#ffffff" strokeWidth="2" />
          ))}
          {months.map((month, index) => (
            <text key={month} x={30 + index * 48} y="218" textAnchor="middle" className="fill-slate-400 text-[10px]">
              {month}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-5 text-xs text-slate-500">
        <ReferenceLegend color="#635bff" label="Bills due" value="Current year" />
        <ReferenceLegend color="#10b8ad" label="Records" value="Stored" />
        <ReferenceLegend color="#ffb24c" label="Payments" value="Tracked" />
      </div>
    </div>
  );
};

const ArcoraActivityTable = ({ items, className }: { items: ActivityEntry[]; className?: string }) => (
  <div className={cn('flex flex-col rounded-[1.25rem] border border-sky-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-none', className)}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Recent Activity</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A clean log of the latest Arcora changes.</p>
      </div>
      <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
        {items.length} update{items.length === 1 ? '' : 's'}
      </Badge>
    </div>

    <div className="mt-5 flex-1 overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10">
      <div className="grid grid-cols-[minmax(0,1fr)_120px_100px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 max-sm:hidden dark:bg-white/[0.05] dark:text-slate-400">
        <span>Activity</span>
        <span>When</span>
        <span>Status</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-50/70 px-4 py-10 text-center dark:bg-white/[0.03]">
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">No activity yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">New bills, reminders, records, and uploads will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {items.slice(0, 6).map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.id} className="grid gap-3 bg-white px-4 py-3 transition-colors sm:grid-cols-[minmax(0,1fr)_120px_100px] sm:items-center dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl border', signalToneClasses[item.tone])}>
                    <Icon className={cn('h-4 w-4', signalValueClasses[item.tone])} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{item.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.date ? formatRelativeTime(item.date) : 'Recently'}</p>
                <span className="w-fit rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                  Stored
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const OrbitSideStack = ({
  weekTimelineDays,
  totalRecords,
  actionQueueItems,
  onActionItemClick,
}: {
  weekTimelineDays: WeekTimelineDay[];
  totalRecords: number;
  actionQueueItems: ActionQueueEntry[];
  onActionItemClick: (item: UrgencyItem) => void;
}) => (
  <div className="space-y-4">
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">Weekly View</p>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weekTimelineDays.map((day) => (
          <div
            key={day.key}
            className={cn(
              'min-h-16 overflow-hidden rounded-2xl border px-1.5 py-2 text-center',
              day.isToday ? 'border-[#15b8aa] bg-[#15b8aa]/10 text-[#087d75]' : 'border-slate-100 bg-slate-50 text-slate-500',
            )}
          >
            <p className="truncate text-[9px] font-bold uppercase tracking-normal">{day.label}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{day.dayNumber}</p>
            {day.items.length > 0 ? <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#ffb24c]" /> : null}
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Action Queue</p>
          <p className="mt-1 text-xs text-slate-500">Items that deserve attention first.</p>
        </div>
        <Badge className="rounded-full border-0 bg-amber-500/12 text-amber-700 hover:bg-amber-500/12 dark:text-amber-200">
          {actionQueueItems.length}
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        {actionQueueItems.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-3 py-5 text-center text-xs font-medium text-slate-500">
            Nothing urgent right now.
          </p>
        ) : (
          actionQueueItems.slice(0, 4).map(({ item, statusLabel, tone }) => {
            const Icon = getUrgencyTypeIcon(item.type);

            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => onActionItemClick(item)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-sky-300/40 hover:bg-white"
              >
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-2xl border', signalToneClasses[tone])}>
                  <Icon className={cn('h-4 w-4', signalValueClasses[tone])} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-slate-950">{item.title}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">{statusLabel}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            );
          })
        )}
      </div>
    </div>

    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-950">Records Snapshot</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-slate-950">{totalRecords}</p>
          <p className="mt-1 text-xs text-slate-500">Stored documents, warranties, and reminders.</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
          <FileText className="h-5 w-5" />
        </div>
      </div>
    </div>
  </div>
);

const OrbitRecentFiles = ({
  files,
  onUpload,
}: {
  files: StoredDocument[];
  onUpload: () => void;
}) => (
  <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-slate-950">Recent Files</p>
        <p className="mt-1 text-xs text-slate-500">
          The latest uploaded documents, ready to open when you need them.
        </p>
      </div>
      <OrbitSmallButton icon={Upload} label="Upload Document" onClick={onUpload} />
    </div>

    {files.length === 0 ? (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-950">No recent files yet</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
          Upload a bill, certificate, receipt, or important record and it will appear here.
        </p>
        <Button type="button" onClick={onUpload} className="mt-5 rounded-full bg-[#635bff] px-4 text-white hover:bg-[#5148f0]">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
    ) : (
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {files.map((doc) => {
          const theme = getSectionTheme(doc.section);

          return (
            <motion.a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={hoverScale}
              className="group overflow-hidden rounded-[1.15rem] border border-slate-200 bg-slate-50/70 text-left transition hover:border-[#635bff]/30 hover:bg-white"
            >
              <DocumentThumbnail doc={doc} className="h-36 rounded-none border-0" />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={cn('capitalize', theme.badgeClassName)}>
                    {doc.section.replace('-', ' ')}
                  </Badge>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {formatRelativeTime(doc.createdAt.toDate())}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-slate-950 transition-colors group-hover:text-[#635bff]">
                  {doc.title}
                </p>
                <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                  {doc.extractedData?.summary || doc.fileName}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    )}
  </div>
);

const OrbitSmallButton = ({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex min-h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#635bff] hover:bg-[#635bff]/10 hover:text-[#5148f0]',
      className,
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

const getSparklinePolyline = (values: number[], width: number, height: number) => {
  const safeValues = values.length > 0 ? values : [0];
  const max = Math.max(...safeValues, 1);
  const step = safeValues.length > 1 ? width / (safeValues.length - 1) : width;
  const points = safeValues
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 8) + 4;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  const firstPoint = points.split(' ')[0] ?? `0,${height}`;
  const lastPoint = points.split(' ').at(-1) ?? `${width},${height}`;

  return {
    points,
    areaStart: firstPoint,
    areaEnd: `${lastPoint.split(',')[0]},${height + 6}`,
  };
};

const ReferenceDashboardBoard = ({
  userName,
  userEmail,
  stats,
  totalRecords,
  openActionsCount,
  actionQueueItems,
  weekTimelineDays,
  recentActivityItems,
  recentUploadsCount,
  monthlyBillSeries,
  setupProgress,
  setupTotal,
  showSetupGuide,
  nextSetupAction,
  onDismissSetup,
  onAddBill,
  onUpload,
  onAddReminder,
  onAddSubscription,
  onAddWarranty,
  onActionItemClick,
}: {
  userName: string;
  userEmail?: string;
  stats: DashboardStats;
  totalRecords: number;
  openActionsCount: number;
  actionQueueItems: ActionQueueEntry[];
  weekTimelineDays: WeekTimelineDay[];
  recentActivityItems: ActivityEntry[];
  recentUploadsCount: number;
  monthlyBillSeries: number[];
  setupProgress: number;
  setupTotal: number;
  showSetupGuide: boolean;
  nextSetupAction: string;
  onDismissSetup: () => void;
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
  onAddSubscription: () => void;
  onAddWarranty: () => void;
  onActionItemClick: (item: UrgencyItem) => void;
}) => {
  const setupPercent = Math.round((setupProgress / setupTotal) * 100);
  const paidTotal = stats.paidThisMonth + stats.totalDue;
  const paidRatio = paidTotal > 0 ? Math.round((stats.paidThisMonth / paidTotal) * 100) : 0;
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-[1.8rem] bg-[#f5f7fb] p-4 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-white/70 md:p-5"
    >
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(145deg,#10b8ad,#1d76c9)] text-sm font-bold text-white shadow-[0_12px_26px_rgba(14,165,233,0.25)]">
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950">{userName}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Welcome to dashboard
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <div>
              <p className="text-slate-950">{stats.securityScore} score</p>
              <p className="mt-1 truncate">{userEmail || 'Private account'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-950">{currentDate}</p>
              <p className="mt-1">Today</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xl font-semibold text-slate-950">Arcora Dashboard</p>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                A focused view of bills, reminders, records, and account health.
              </p>
            </div>
            <Button
              type="button"
              onClick={onUpload}
              className="rounded-full bg-[#16b8a6] px-4 text-xs font-semibold text-white hover:bg-[#109989]"
            >
              Upload Document
              <Upload className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ReferenceKpiCard label="Total Due" value={formatCurrency(stats.totalDue)} colorClassName="bg-[#ffaf38]" />
            <ReferenceKpiCard label="Open Actions" value={openActionsCount.toString()} colorClassName="bg-[#202987]" />
            <ReferenceKpiCard label="Records" value={totalRecords.toString()} colorClassName="bg-[#1f80c7]" />
          </div>
        </div>
      </div>

      {showSetupGuide ? (
        <div className="mt-4 rounded-[1.35rem] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#159dba]">
                Guided setup
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {setupProgress}/{setupTotal} essentials complete. Next: {nextSetupAction}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-44 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#10b8ad,#1d76c9)]"
                  style={{ width: `${setupPercent}%` }}
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={onDismissSetup} className="text-slate-500">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
        <ReferenceLineChartCard values={monthlyBillSeries} />
        <ReferenceHealthCard
          securityScore={stats.securityScore}
          weakPasswords={stats.weakPasswords}
          expiringWarranties={stats.expiringWarranties}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_320px]">
        <ReferenceFinanceCard
          paidRatio={paidRatio}
          paidThisMonth={stats.paidThisMonth}
          totalDue={stats.totalDue}
          recentUploadsCount={recentUploadsCount}
        />
        <ReferenceActionQueue items={actionQueueItems} onItemClick={onActionItemClick} />
        <ReferenceQuickPanel
          weekTimelineDays={weekTimelineDays}
          recentActivityItems={recentActivityItems}
          onAddBill={onAddBill}
          onUpload={onUpload}
          onAddReminder={onAddReminder}
          onAddSubscription={onAddSubscription}
          onAddWarranty={onAddWarranty}
        />
      </div>
    </motion.div>
  );
};

const ReferenceKpiCard = ({
  label,
  value,
  colorClassName,
}: {
  label: string;
  value: string;
  colorClassName: string;
}) => (
  <div className={cn('rounded-lg px-5 py-4 text-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]', colorClassName)}>
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">{label}</p>
    <p className="mt-2 text-3xl font-bold leading-none">{value}</p>
  </div>
);

const ReferenceLineChartCard = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 28 + index * 48;
    const y = 178 - (value / max) * 130;
    return { x, y, value };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = `M ${points[0]?.x ?? 28},190 L ${polyline} L ${points[points.length - 1]?.x ?? 556},190 Z`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">Bills and payments</p>
          <p className="mt-1 text-xs text-slate-500">Monthly due-date movement across the year.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">2026</div>
      </div>

      <div className="mt-4 h-64">
        <svg viewBox="0 0 600 230" className="h-full w-full overflow-visible">
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="28"
              x2="556"
              y1={52 + line * 42}
              y2={52 + line * 42}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          {points.map((point) => (
            <line key={point.x} x1={point.x} x2={point.x} y1="38" y2="190" stroke="#e5e7eb" strokeWidth="1" />
          ))}
          <path d={areaPath} fill="rgba(255,175,56,0.22)" />
          <polyline points={polyline} fill="none" stroke="#ffaf38" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="5" fill="#ffaf38" stroke="#1f2937" strokeWidth="2" />
          ))}
          {months.map((month, index) => (
            <text key={month} x={28 + index * 48} y="218" textAnchor="middle" className="fill-slate-400 text-[10px]">
              {month}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#ffaf38]" />Bills due</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#16b8a6]" />Records</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#1f80c7]" />Reminders</span>
      </div>
    </div>
  );
};

const ReferenceHealthCard = ({
  securityScore,
  weakPasswords,
  expiringWarranties,
}: {
  securityScore: number;
  weakPasswords: number;
  expiringWarranties: number;
}) => (
  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-base font-semibold text-slate-950">Life admin health</p>
      <div className="rounded-full bg-slate-100 p-2 text-slate-500">
        <ShieldCheck className="h-4 w-4" />
      </div>
    </div>

    <div className="mt-7 flex justify-center">
      <div
        className="grid h-44 w-44 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#15b8aa 0 ${securityScore * 3.6}deg, #202987 ${securityScore * 3.6}deg ${Math.min(360, securityScore * 3.6 + 72)}deg, #ffaf38 ${Math.min(360, securityScore * 3.6 + 72)}deg 360deg)`,
        }}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner">
          <div>
            <p className="text-3xl font-bold text-slate-950">{securityScore}</p>
            <p className="text-xs text-slate-500">score</p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-7 grid gap-3 text-xs text-slate-500">
      <ReferenceLegend color="#15b8aa" label="Secure score" value={`${securityScore}/100`} />
      <ReferenceLegend color="#202987" label="Weak passwords" value={weakPasswords.toString()} />
      <ReferenceLegend color="#ffaf38" label="Coverage watch" value={expiringWarranties.toString()} />
    </div>
  </div>
);

const ReferenceLegend = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
    <span className="font-semibold text-slate-950">{value}</span>
  </div>
);

const ReferenceFinanceCard = ({
  paidRatio,
  paidThisMonth,
  totalDue,
  recentUploadsCount,
}: {
  paidRatio: number;
  paidThisMonth: number;
  totalDue: number;
  recentUploadsCount: number;
}) => (
  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <p className="text-base font-semibold text-slate-950">Data Graphic</p>
    <p className="mt-1 text-xs text-slate-500">Quick finance and upload signals.</p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <ReferenceProgressMetric color="#ff8d1a" label="Paid ratio" value={`${paidRatio}%`} />
      <ReferenceProgressMetric color="#8cc641" label="Setup health" value={`${Math.min(100, 65 + recentUploadsCount * 5)}%`} />
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div>
        <p className="text-xs text-slate-500">Paid This Month</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(paidThisMonth)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Total Due</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(totalDue)}</p>
      </div>
    </div>
  </div>
);

const ReferenceProgressMetric = ({ color, label, value }: { color: string; label: string; value: string }) => {
  const numericValue = Number(value.replace('%', '')) || 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} 0 ${numericValue * 3.6}deg, #eef2f7 ${numericValue * 3.6}deg 360deg)` }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white">
          <span className="text-sm font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">On track</p>
      </div>
    </div>
  );
};

const ReferenceActionQueue = ({
  items,
  onItemClick,
}: {
  items: ActionQueueEntry[];
  onItemClick: (item: UrgencyItem) => void;
}) => (
  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-950">Action Queue</p>
        <p className="mt-1 text-xs text-slate-500">The next items to handle first.</p>
      </div>
      <Badge className="rounded-full border-0 bg-[#202987] text-white hover:bg-[#202987]">{items.length}</Badge>
    </div>

    <div className="mt-4 space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
          Everything is clear right now.
        </div>
      ) : (
        items.slice(0, 5).map(({ item, statusLabel, tone }) => {
          const Icon = getUrgencyTypeIcon(item.type);
          const colorClassName = tone === 'red' ? 'bg-rose-50 text-rose-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600';

          return (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => onItemClick(item)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-sky-200 hover:bg-white"
            >
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', colorClassName)}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-950">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{statusLabel} · {formatRelativeTime(item.date)}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          );
        })
      )}
    </div>
  </div>
);

const ReferenceQuickPanel = ({
  weekTimelineDays,
  recentActivityItems,
  onAddBill,
  onUpload,
  onAddReminder,
  onAddSubscription,
  onAddWarranty,
}: {
  weekTimelineDays: WeekTimelineDay[];
  recentActivityItems: ActivityEntry[];
  onAddBill: () => void;
  onUpload: () => void;
  onAddReminder: () => void;
  onAddSubscription: () => void;
  onAddWarranty: () => void;
}) => (
  <div className="space-y-4">
    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">This Week</p>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weekTimelineDays.map((day) => (
          <div
            key={day.key}
            className={cn(
              'min-h-16 overflow-hidden rounded-2xl border px-1.5 py-2 text-center',
              day.isToday ? 'border-[#15b8aa] bg-[#15b8aa]/10 text-[#087d75]' : 'border-slate-100 bg-slate-50 text-slate-500',
            )}
          >
            <p className="truncate text-[9px] font-bold uppercase tracking-normal">{day.label}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{day.dayNumber}</p>
            {day.items.length > 0 ? <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#ffaf38]" /> : null}
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-950">Quick Actions</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ReferenceSmallButton icon={Receipt} label="Bill" onClick={onAddBill} />
        <ReferenceSmallButton icon={Upload} label="Upload" onClick={onUpload} />
        <ReferenceSmallButton icon={Bell} label="Reminder" onClick={onAddReminder} />
        <ReferenceSmallButton icon={CreditCard} label="Sub" onClick={onAddSubscription} />
        <ReferenceSmallButton icon={ShieldCheck} label="Warranty" onClick={onAddWarranty} className="col-span-2" />
      </div>
    </div>

    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-slate-950">Recent Activity</p>
      <div className="mt-3 space-y-2">
        {recentActivityItems.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">No activity yet.</p>
        ) : (
          recentActivityItems.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#15b8aa]" />
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">{item.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ReferenceSmallButton = ({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#15b8aa] hover:bg-[#15b8aa]/10 hover:text-[#087d75]', className)}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

void [
  ArcoraDetailsPanel,
  ArcoraRecordsPanel,
  OrbitDashboardBoard,
  OrbitMetricCard,
  OrbitSpendingPanel,
  OrbitActionQueue,
  ReferenceDashboardBoard,
];

const CompactSetupGuide = ({
  completedSteps,
  totalSteps,
  nextActionLabel,
  setupItems,
  onDismiss,
}: {
  completedSteps: number;
  totalSteps: number;
  nextActionLabel: string;
  setupItems: ReadonlyArray<{
    id: string;
    label: string;
    actionLabel: string;
    complete: boolean;
    onClick: () => void;
  }>;
  onDismiss: () => void;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="border-border/70 bg-card/85">
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-sky-400/20 bg-sky-500/10 text-sky-100 hover:bg-sky-500/10">
              Setup {completedSteps}/{totalSteps}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Next: {nextActionLabel}
            </p>
          </div>
          <div className="mt-3 h-2 max-w-xl rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 transition-all duration-500"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {setupItems.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={item.complete ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => !item.complete && item.onClick()}
              className="gap-2"
            >
              {item.complete ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {item.complete ? item.label : item.actionLabel}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ActionQueuePanel = ({
  items,
  onItemClick,
}: {
  items: ActionQueueEntry[];
  onItemClick: (item: UrgencyItem) => void;
}) => (
  <Card className="border-border/70 bg-card/90">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Action Queue
          </p>
          <h2 className="mt-2 text-xl font-semibold">Handle these first</h2>
        </div>
        <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
          <AlertTriangle className="h-5 w-5 text-sky-600 dark:text-sky-300" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
          <p className="mt-3 font-semibold">Nothing needs attention</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bills, renewals, reminders, and expiring records will collect here when action is needed.
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
          {items.map(({ item, statusLabel, tone }) => {
            const Icon = getUrgencyTypeIcon(item.type);

            return (
              <button
                key={`${item.type}-${item.id}-${statusLabel}`}
                type="button"
                onClick={() => onItemClick(item)}
                className="group flex w-full items-center gap-4 bg-background/45 p-4 text-left transition-colors hover:bg-muted/35"
              >
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border', signalToneClasses[tone])}>
                  <Icon className={cn('h-5 w-5', signalValueClasses[tone])} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{item.title}</span>
                    <Badge variant="outline" className={cn('rounded-full text-[11px]', signalLabelClasses[tone])}>
                      {statusLabel}
                    </Badge>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatRelativeTime(item.date)}
                    {item.amount ? ` · ${formatCurrency(item.amount)}` : ''}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </button>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

const WeekTimelinePanel = ({ days }: { days: WeekTimelineDay[] }) => (
  <Card className="border-border/70 bg-card/90">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            This Week
          </p>
          <h2 className="mt-2 text-xl font-semibold">Upcoming dates</h2>
        </div>
        <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
          <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-300" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.key}
            className={cn(
              'min-h-24 overflow-hidden rounded-2xl border p-2 text-center',
              day.isToday
                ? 'border-sky-500/30 bg-sky-500/10'
                : day.items.length > 0
                  ? 'border-amber-500/20 bg-amber-500/5'
                  : 'border-border/70 bg-background/45',
            )}
          >
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {day.label}
            </p>
            <p className="mt-1 text-lg font-semibold">{day.dayNumber}</p>
            <div className="mt-2 flex justify-center gap-1">
              {day.items.slice(0, 3).map((item) => (
                <span
                  key={`${item.type}-${item.id}`}
                  className="h-1.5 w-1.5 rounded-full bg-sky-300"
                  title={item.title}
                />
              ))}
            </div>
            {day.items.length > 3 ? (
              <p className="mt-1 text-[10px] text-muted-foreground">+{day.items.length - 3}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {days.flatMap((day) => day.items).slice(0, 3).map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/45 px-3 py-2">
            <span className="truncate text-sm font-medium">{item.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(item.date)}</span>
          </div>
        ))}
        {days.every((day) => day.items.length === 0) ? (
          <p className="rounded-2xl border border-border/70 bg-background/45 px-3 py-6 text-center text-sm text-muted-foreground">
            No due dates this week.
          </p>
        ) : null}
      </div>
    </CardContent>
  </Card>
);

const ActivityPanel = ({ items }: { items: ActivityEntry[] }) => (
  <Card className="border-border/70 bg-card/85">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Activity
          </p>
          <h2 className="mt-2 text-lg font-semibold">Recent changes</h2>
        </div>
        <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
          <Activity className="h-5 w-5 text-sky-600 dark:text-sky-300" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-background/45 p-6 text-center">
          <p className="font-semibold">No recent activity yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New bills, uploads, reminders, and records will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-border/70 bg-background/45 p-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border', signalToneClasses[item.tone])}>
                  <Icon className={cn('h-4 w-4', signalValueClasses[item.tone])} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {item.date ? formatRelativeTime(item.date) : 'Recently'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

const InlineActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <Button type="button" variant="outline" onClick={onClick} className="justify-start gap-2">
    <Icon className="h-4 w-4" />
    {label}
  </Button>
);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'YN';

const getMonthlyBillSeries = (
  bills: Array<{
    amount: number;
    dueDate: { toDate: () => Date };
  }>,
) => {
  const currentYear = new Date().getFullYear();
  const totals = Array.from({ length: 12 }, () => 0);

  bills.forEach((bill) => {
    const dueDate = bill.dueDate.toDate();
    if (dueDate.getFullYear() !== currentYear) return;
    totals[dueDate.getMonth()] += bill.amount;
  });

  return totals.map((value) => Math.round(value));
};

const getActionQueueItems = (
  overdue: UrgencyItem[],
  dueThisWeek: UrgencyItem[],
  expiringSoon: UrgencyItem[],
): ActionQueueEntry[] => [
  ...overdue.map((item) => ({
    item,
    statusLabel: 'Needs attention',
    tone: 'red' as const,
  })),
  ...dueThisWeek.map((item) => ({
    item,
    statusLabel: 'Due soon',
    tone: 'amber' as const,
  })),
  ...expiringSoon.map((item) => ({
    item,
    statusLabel: 'Watch list',
    tone: 'sky' as const,
  })),
].slice(0, 6);

const formatNextUpDate = (item: UrgencyItem) => {
  if (item.daysDiff < 0) {
    const daysLate = Math.abs(item.daysDiff);
    return `${daysLate} day${daysLate === 1 ? '' : 's'} late`;
  }

  if (item.daysDiff === 0) return 'Today';
  if (item.daysDiff === 1) return 'Tomorrow';

  return `In ${item.daysDiff} days`;
};

const getWeekTimelineDays = (items: UrgencyItem[]): WeekTimelineDay[] => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() + offset);

    const dayItems = items.filter((item) => isSameCalendarDay(item.date, date));

    return {
      key: date.toISOString(),
      label: offset === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: date.toLocaleDateString(undefined, { day: '2-digit' }),
      isToday: offset === 0,
      items: dayItems,
    };
  });
};

const getRecentActivityItems = ({
  bills,
  subscriptions,
  warranties,
  documents,
  reminders,
}: {
  bills: Array<{ id: string; title: string; amount: number; createdAt?: unknown }>;
  subscriptions: Array<{ id: string; name: string; amount: number; createdAt?: unknown }>;
  warranties: Array<{ id: string; productName: string; createdAt?: unknown }>;
  documents: Array<{ id: string; title: string; section: string; createdAt?: unknown }>;
  reminders: Array<{ id: string; title: string; status: string; createdAt?: unknown }>;
}): ActivityEntry[] => {
  const entries: ActivityEntry[] = [
    ...bills.map((bill) => ({
      id: `bill-${bill.id}`,
      title: bill.title,
      description: `Bill tracked for ${formatCurrency(bill.amount)}.`,
      date: toOptionalDate(bill.createdAt),
      icon: Receipt,
      tone: 'amber' as const,
    })),
    ...subscriptions.map((subscription) => ({
      id: `subscription-${subscription.id}`,
      title: subscription.name,
      description: `Recurring charge added for ${formatCurrency(subscription.amount)}.`,
      date: toOptionalDate(subscription.createdAt),
      icon: CreditCard,
      tone: 'violet' as const,
    })),
    ...warranties.map((warranty) => ({
      id: `warranty-${warranty.id}`,
      title: warranty.productName,
      description: 'Warranty coverage is now in view.',
      date: toOptionalDate(warranty.createdAt),
      icon: ShieldCheck,
      tone: 'emerald' as const,
    })),
    ...documents.map((document) => ({
      id: `document-${document.id}`,
      title: document.title,
      description: `${document.section.replace('-', ' ')} document stored.`,
      date: toOptionalDate(document.createdAt),
      icon: FileText,
      tone: 'sky' as const,
    })),
    ...reminders.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: reminder.title,
      description: `Reminder is ${reminder.status}.`,
      date: toOptionalDate(reminder.createdAt),
      icon: Bell,
      tone: 'slate' as const,
    })),
  ];

  return entries
    .sort((left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0))
    .slice(0, 5);
};

const getUrgencyTypeIcon = (type: UrgencyItem['type']) => {
  switch (type) {
    case 'bill':
      return Receipt;
    case 'subscription':
      return CreditCard;
    case 'warranty':
      return ShieldCheck;
    case 'document':
      return FileText;
    case 'reminder':
      return Bell;
    default:
      return AlertTriangle;
  }
};

const getRouteForUrgencyItem = (type: UrgencyItem['type']) => {
  switch (type) {
    case 'bill':
      return 'bills';
    case 'subscription':
      return 'subscriptions';
    case 'warranty':
      return 'warranties';
    case 'document':
      return 'documents';
    case 'reminder':
      return 'reminders';
    default:
      return 'dashboard';
  }
};

const toOptionalDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
};

const isSameCalendarDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  footnote: string;
  icon: React.ElementType;
  footnoteClassName?: string;
  iconWrapClassName?: string;
  iconClassName?: string;
}

const StatCard = ({
  title,
  value,
  footnote,
  icon: Icon,
  footnoteClassName,
  iconWrapClassName,
  iconClassName,
}: StatCardProps) => (
  <motion.div
    whileHover={{
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' },
    }}
    whileTap={{ scale: 0.98 }}
    className="h-full"
  >
    <Card className="h-full border-border/70 bg-card/90 transition-all hover:border-sky-500/20 hover:shadow-[0_14px_28px_-20px_rgba(56,189,248,0.3)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className={cn('mt-2 line-clamp-2 text-sm', footnoteClassName || 'text-muted-foreground')}>
              {footnote}
            </p>
          </div>

          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
              iconWrapClassName || 'bg-primary/10',
            )}
          >
            <Icon className={cn('w-6 h-6', iconClassName || 'text-primary')} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const getDashboardPriorityState = ({
  hasAnyData,
  topPriorityItem,
  overdueCount,
  dueSoonCount,
  expiringSoonCount,
  firstIncompleteSetupItem,
  pendingReminderCount,
  documentsCount,
}: {
  hasAnyData: boolean;
  topPriorityItem: UrgencyItem | null;
  overdueCount: number;
  dueSoonCount: number;
  expiringSoonCount: number;
  firstIncompleteSetupItem: {
    id: 'bill' | 'document' | 'reminder';
    label: string;
    actionLabel: string;
  } | null;
  pendingReminderCount: number;
  documentsCount: number;
}): DashboardPriorityState => {
  if (overdueCount > 0 && topPriorityItem) {
    return {
      title: `Review ${topPriorityItem.title}`,
      body: `${topPriorityItem.title} needs attention now. Start here to reduce the chance of a missed payment, renewal, or task getting lost in the week.`,
      reason: 'Clearing one overdue item first is usually the fastest way to make the rest of the dashboard feel manageable again.',
    };
  }

  if (dueSoonCount > 0 && topPriorityItem) {
    return {
      title: `Prepare ${topPriorityItem.title}`,
      body: `${topPriorityItem.title} is coming up ${formatRelativeTime(topPriorityItem.date).toLowerCase()}. Handling it early keeps this week quieter and easier to trust.`,
      reason: 'A quick check before something is due is usually easier than dealing with it after it becomes urgent.',
    };
  }

  if (expiringSoonCount > 0 && topPriorityItem) {
    return {
      title: `Check ${topPriorityItem.title}`,
      body: `${topPriorityItem.title} is approaching its next deadline ${formatRelativeTime(topPriorityItem.date).toLowerCase()}. Keeping coverage and records visible now makes expiry windows easier to handle.`,
      reason: 'Important records are most useful when they are easy to find before renewal or expiry becomes a scramble.',
    };
  }

  if (!hasAnyData && firstIncompleteSetupItem) {
    return {
      title: firstIncompleteSetupItem.label,
      body: 'A first bill, document, or reminder is enough to turn Arcora from a clean dashboard into something that actively helps you stay ahead.',
      reason: 'One small setup step now creates a calmer place to manage due dates, records, and reminders later.',
    };
  }

  if (firstIncompleteSetupItem) {
    return {
      title: firstIncompleteSetupItem.label,
      body: 'You already have the basics in place. One more smart entry will make Arcora more useful the next time life admin needs your attention.',
      reason: 'A little extra setup now usually saves much more effort when a payment, renewal, or record is needed later.',
    };
  }

  if (pendingReminderCount === 0) {
    return {
      title: 'Create one reminder',
      body: 'A single reminder gives Arcora something proactive to watch for you before deadlines or renewals quietly slip.',
      reason: 'Reminders are one of the quickest ways to turn a quiet dashboard into a helpful one.',
    };
  }

  if (documentsCount === 0) {
    return {
      title: 'Upload one important document',
      body: 'Keep a bill, certificate, or record somewhere easy to retrieve when life asks for it.',
      reason: 'Stored records make future admin faster, calmer, and less dependent on scattered folders or screenshots.',
    };
  }

  return {
    title: 'Keep the calm going',
    body: 'Nothing urgent needs attention right now. Use the next action to keep bills, reminders, and important records easy to trust.',
    reason: 'A little upkeep on a quiet day is what keeps life admin from becoming stressful later.',
  };
};

const getDashboardHeroContent = ({
  hasAnyData,
  hasPriorityItem,
  firstName,
  topPriorityItem,
}: {
  hasAnyData: boolean;
  hasPriorityItem: boolean;
  firstName?: string;
  topPriorityItem: UrgencyItem | null;
}): DashboardHeroContent => {
  if (!hasAnyData) {
    return {
      badge: 'Secure Life Admin',
      headline: 'Never miss what matters.',
      body:
        'Arcora keeps bills, documents, warranties, passwords, and reminders in one secure place so deadlines, renewals, and important records stay in view.',
      trustLine:
        'Private life admin, organized in one calm place and easier to access when you need it.',
    };
  }

  if (hasPriorityItem && topPriorityItem) {
    return {
      badge: 'Stay Ahead',
      headline: `Stay ahead${firstName ? `, ${firstName}` : ''}.`,
      body: `${topPriorityItem.title} is next ${formatRelativeTime(topPriorityItem.date).toLowerCase()}. Arcora keeps the rest visible so nothing important drifts out of view.`,
      trustLine:
        'One calm place for important records, reminders, and due dates that helps you stay in control.',
    };
  }

  return {
    badge: 'Secure Life Admin',
    headline: `Everything important${firstName ? `, ${firstName}` : ''}, on track.`,
    body:
      'Bills, documents, warranties, passwords, and reminders stay organized in one place so you do not have to carry every deadline in your head.',
    trustLine:
      'Private life admin, organized for everyday access and a clearer sense of what matters next.',
  };
};

const QuickAddReminderForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const addReminder = useDataStore((state) => state.addReminder);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('personal');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !dueDate) return;

    const parsedDueDate = parseDateInputValue(dueDate);
    if (!parsedDueDate) return;

    setSaving(true);
    try {
      await addReminder({
        title,
        dueDate: Timestamp.fromDate(parsedDueDate),
        category,
        priority: 'medium',
        status: 'pending',
        isRecurring: false,
        reminderSent: {
          thirtyDays: false,
          sevenDays: false,
          oneDay: false,
          onDueDate: false,
        },
      });

      showToast({
        title: 'Reminder added',
        type: 'success',
      });

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pay internet bill" />
      </div>

      <div>
        <label className="text-sm font-medium">Due Date</label>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ReminderCategory)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="personal">Personal</option>
          <option value="finance">Finance</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Add Reminder'}
      </Button>
    </form>
  );
};

const QuickAddSubscriptionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const addSubscription = useDataStore((state) => state.addSubscription);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('entertainment');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !amount || !nextRenewalDate) return;

    const parsedRenewalDate = parseDateInputValue(nextRenewalDate);
    if (!parsedRenewalDate) return;

    setSaving(true);
    try {
      await addSubscription({
        name,
        amount: Number(amount),
        currency: 'USD',
        billingPeriod,
        nextRenewalDate: Timestamp.fromDate(parsedRenewalDate),
        category,
        reminderSent: defaultReminderSent,
      });

      showToast({
        title: 'Subscription added',
        type: 'success',
      });

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix" />
      </div>

      <div>
        <label className="text-sm font-medium">Amount</label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="9.99" />
      </div>

      <div>
        <label className="text-sm font-medium">Next Renewal</label>
        <Input type="date" value={nextRenewalDate} onChange={(e) => setNextRenewalDate(e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium">Billing Period</label>
        <select
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="entertainment">Entertainment</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="utilities">Utilities</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Add Subscription'}
      </Button>
    </form>
  );
};

const QuickAddWarrantyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const addWarranty = useDataStore((state) => state.addWarranty);
  const [productName, setProductName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState('12');
  const [retailer, setRetailer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productName || !purchaseDate || !warrantyDurationMonths) return;

    const purchase = parseDateInputValue(purchaseDate);
    if (!purchase) return;

    const expiration = new Date(purchase);
    expiration.setMonth(expiration.getMonth() + Number(warrantyDurationMonths));

    setSaving(true);
    try {
      await addWarranty({
        productName,
        purchaseDate: Timestamp.fromDate(purchase),
        warrantyDurationMonths: Number(warrantyDurationMonths),
        expirationDate: Timestamp.fromDate(expiration),
        retailer: retailer || undefined,
        reminderSent: {
          thirtyDays: false,
          sevenDays: false,
          oneDay: false,
          onDueDate: false,
        },
      });

      showToast({
        title: 'Warranty added',
        type: 'success',
      });

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Product Name</label>
        <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="iPhone 15" />
      </div>

      <div>
        <label className="text-sm font-medium">Purchase Date</label>
        <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium">Warranty Duration (Months)</label>
        <Input
          type="number"
          value={warrantyDurationMonths}
          onChange={(e) => setWarrantyDurationMonths(e.target.value)}
          placeholder="12"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Retailer</label>
        <Input value={retailer} onChange={(e) => setRetailer(e.target.value)} placeholder="Apple Store" />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Add Warranty'}
      </Button>
    </form>
  );
};
const defaultReminderSent = {
  thirtyDays: false,
  sevenDays: false,
  oneDay: false,
  onDueDate: false,
} as const;

