import { useState } from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import {
  ArrowRight,
  CalendarClock,
  DollarSign,
  Layers3,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { formatCurrency, formatDate, formatRelativeTime, parseDateInputValue } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import type { BillingPeriod, SubscriptionCategory } from '@/types';
import { UploadDocumentButton } from '@/components/upload/UploadDocumentButton';

const defaultReminderSent = {
  thirtyDays: false,
  sevenDays: false,
  oneDay: false,
  onDueDate: false,
} as const;

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

export const SubscriptionsPage = () => {
  const { subscriptions, activeDocuments, deleteSubscription, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const subscriptionsTheme = getSectionTheme('subscriptions');

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uploadedDocs = activeDocuments.filter((doc) => doc.section === 'subscriptions');

  const monthlyTotal = subscriptions.reduce((sum, item) => {
    if (item.billingPeriod === 'monthly') return sum + item.amount;
    if (item.billingPeriod === 'yearly') return sum + item.amount / 12;
    if (item.billingPeriod === 'quarterly') return sum + item.amount / 3;
    return sum;
  }, 0);
  const yearlyTotal = monthlyTotal * 12;
  const upcomingRenewal =
    subscriptions
      .slice()
      .sort((left, right) => left.nextRenewalDate.toDate().getTime() - right.nextRenewalDate.toDate().getTime())[0] ??
    null;
  const activeCount = subscriptions.length;
  const categoryCounts = {
    entertainment: subscriptions.filter((item) => item.category === 'entertainment').length,
    utilities: subscriptions.filter((item) => item.category === 'utilities').length,
    work: subscriptions.filter((item) => item.category === 'work').length,
    shopping: subscriptions.filter((item) => item.category === 'shopping').length,
  };
  const billingCounts = {
    monthly: subscriptions.filter((item) => item.billingPeriod === 'monthly').length,
    quarterly: subscriptions.filter((item) => item.billingPeriod === 'quarterly').length,
    yearly: subscriptions.filter((item) => item.billingPeriod === 'yearly').length,
  };
  const renewalFlowRows = [
    {
      label: 'Monthly run rate',
      value: monthlyTotal,
      display: formatCurrency(monthlyTotal),
      helper: `${activeCount} active services`,
      color: '#38bdf8',
      max: Math.max(monthlyTotal + yearlyTotal / 12, 1),
    },
    {
      label: 'Yearly outlook',
      value: yearlyTotal,
      display: formatCurrency(yearlyTotal),
      helper: 'Projected recurring spend',
      color: '#14b8a6',
      max: Math.max(yearlyTotal, 1),
    },
    {
      label: 'Monthly services',
      value: billingCounts.monthly,
      display: billingCounts.monthly.toString(),
      helper: 'Repeat every month',
      color: '#f59e0b',
      max: Math.max(activeCount, 1),
    },
    {
      label: 'Uploaded proof',
      value: uploadedDocs.length,
      display: uploadedDocs.length.toString(),
      helper: 'Invoices and notices',
      color: '#8b5cf6',
      max: Math.max(uploadedDocs.length + 1, 1),
    },
  ];

  const handleDeleteSubscription = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    await deleteSubscription(id);
    showToast({ title: 'Subscription deleted', type: 'success' });
  };

  const handleDeleteUploadedDocument = async (documentId: string, title: string) => {
    const shouldDelete = confirm(
      `Delete "${title}"? Any linked recurring reminders or related entries from this upload will also be removed.`,
    );

    if (!shouldDelete) return;

    await deleteDocument(documentId);
    showToast({ title: 'Subscription document deleted', type: 'success' });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="arcora-feature-page arcora-orbit-dashboard space-y-5"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Subscriptions
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Recurring charges, renewal dates, and service paperwork in the same clean workspace as your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500">
                <Plus className="mr-2 h-4 w-4" />
                Add Subscription
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
              </DialogHeader>
              <AddSubscriptionForm onSuccess={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <UploadDocumentButton defaultSection="subscriptions" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SubscriptionMetricCard
          icon={DollarSign}
          label="Monthly Run Rate"
          value={formatCurrency(monthlyTotal)}
          helper={`${activeCount} active services`}
          colors={['#2563eb', '#0e7490']}
          values={[0, monthlyTotal * 0.35, monthlyTotal * 0.18, monthlyTotal, monthlyTotal * 0.7, monthlyTotal * 0.9]}
        />
        <SubscriptionMetricCard
          icon={TrendingUp}
          label="Yearly Outlook"
          value={formatCurrency(yearlyTotal)}
          helper="Projected spend"
          colors={['#0f766e', '#115e59']}
          values={[yearlyTotal * 0.18, yearlyTotal * 0.35, yearlyTotal * 0.45, yearlyTotal * 0.65, yearlyTotal]}
        />
        <SubscriptionMetricCard
          icon={Layers3}
          label="Active Services"
          value={activeCount.toString()}
          helper={`${billingCounts.monthly} monthly`}
          colors={['#b45309', '#92400e']}
          values={[activeCount, activeCount + 1, activeCount, activeCount + billingCounts.monthly, activeCount + 2]}
        />
        <SubscriptionMetricCard
          icon={CalendarClock}
          label="Service Uploads"
          value={uploadedDocs.length.toString()}
          helper="Stored proof"
          colors={['#7c3aed', '#5b21b6']}
          values={[0, uploadedDocs.length, uploadedDocs.length + 1, uploadedDocs.length, uploadedDocs.length + 2]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Renewal Flow</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Recurring spend and documents that need periodic review.
                </p>
              </div>
              <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                {formatCurrency(monthlyTotal)} monthly
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                {renewalFlowRows.map((row) => (
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

              <div className="rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0e7490)] p-4 text-white">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/15">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold">Recurring Stack</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  Review active services, billing cadence, and renewal paperwork before charges blend into the background.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-white/15 px-3 py-2">{billingCounts.monthly} monthly</span>
                  <span className="rounded-xl bg-white/15 px-3 py-2">{billingCounts.yearly} yearly</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700/80 dark:text-sky-300/80">
                  Next Renewal
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  {upcomingRenewal ? upcomingRenewal.name : 'No subscriptions yet'}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                <CalendarClock className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {upcomingRenewal
                ? `${formatCurrency(upcomingRenewal.amount)} renews ${formatRelativeTime(upcomingRenewal.nextRenewalDate.toDate()).toLowerCase()}. Keeping it here makes future charges easier to anticipate.`
                : 'Add a subscription to start seeing the next renewal before it quietly hits your account.'}
            </p>

            <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <SummaryRow
                label="Amount"
                value={upcomingRenewal ? formatCurrency(upcomingRenewal.amount) : 'Nothing queued'}
              />
              <SummaryRow
                label="Renews"
                value={upcomingRenewal ? formatDate(upcomingRenewal.nextRenewalDate.toDate()) : 'All clear'}
              />
              <SummaryRow
                label="Billing"
                value={upcomingRenewal ? upcomingRenewal.billingPeriod : 'No cadence yet'}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <SubscriptionCompactMetric label="Entertainment" value={categoryCounts.entertainment.toString()} />
              <SubscriptionCompactMetric label="Utilities" value={categoryCounts.utilities.toString()} />
              <SubscriptionCompactMetric label="Work Tools" value={categoryCounts.work.toString()} />
              <SubscriptionCompactMetric label="Shopping" value={categoryCounts.shopping.toString()} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-border/70 pl-10"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as SubscriptionCategory | 'all')}
          className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="entertainment">Entertainment</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="utilities">Utilities</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Uploaded subscription documents</h2>
                <p className="text-sm text-muted-foreground">
                  Imported invoices and recurring service paperwork.
                </p>
              </div>
              <Badge className={subscriptionsTheme.badgeClassName}>{uploadedDocs.length}</Badge>
            </div>
            {uploadedDocs.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-violet-500/20 bg-violet-500/5 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                  <CalendarClock className="h-6 w-6 text-violet-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Upload subscription paperwork</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Upload an invoice or service notice to keep recurring charges easier to verify when renewals or plan changes come up.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {uploadedDocs.map((doc) => (
                  <motion.a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/70"
                  >
                    <DocumentThumbnail doc={doc} className="h-40 rounded-none border-0" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={subscriptionsTheme.badgeClassName}>subscription</Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleDeleteUploadedDocument(doc.id, doc.title);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ArrowRight className="h-4 w-4 text-violet-300 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                      <p className="line-clamp-2 font-semibold group-hover:text-violet-200">{doc.title}</p>
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
      </motion.div>

      <motion.div variants={itemVariants}>
        {filteredSubscriptions.length === 0 ? (
          <Card className="border-dashed border-violet-500/20 bg-violet-500/5">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-violet-500/20 bg-violet-500/10">
                <Layers3 className="h-7 w-7 text-violet-300" />
              </div>
              {subscriptions.length === 0 ? (
                <>
                  <h3 className="mt-5 text-xl font-semibold">Add your first subscription to track renewals early</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Start with one recurring charge and Arcora will help you keep renewal dates and monthly spend from blending into the background.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subscription
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="mt-5 text-xl font-semibold">No subscriptions match this view</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Change the category filter or add another subscription to keep your recurring stack clearer and easier to review.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSubscriptions.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full border-border/70 transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_14px_34px_-20px_rgba(168,85,247,0.4)]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm capitalize text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={subscriptionsTheme.badgeClassName}>
                          {item.billingPeriod}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => void handleDeleteSubscription(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-5 text-3xl font-semibold">{formatCurrency(item.amount)}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
                          Renews
                        </p>
                        <p className="mt-1">{formatDate(item.nextRenewalDate.toDate())}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
                          Relative
                        </p>
                        <p className="mt-1">{formatRelativeTime(item.nextRenewalDate.toDate())}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const SubscriptionMetricCard = ({
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
  const wave = getSubscriptionSparkline(values, 220, 50);

  return (
    <div
      className="relative min-h-36 overflow-hidden rounded-[1.15rem] p-5 text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.18]">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/[0.18] px-2.5 py-1 text-[10px] font-bold">
          {helper}
        </span>
      </div>
      <p className="relative z-10 mt-5 text-2xl font-semibold leading-none">{value}</p>
      <p className="relative z-10 mt-2 text-xs font-medium text-white/80">{label}</p>
      <svg viewBox="0 0 220 62" className="absolute inset-x-0 bottom-0 h-16 w-full opacity-55">
        <path d={`M 0,62 L ${wave} L 220,62 Z`} fill="rgba(255,255,255,0.22)" />
        <polyline points={wave} fill="none" stroke="rgba(255,255,255,0.54)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const SubscriptionCompactMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-sky-500/10 bg-sky-500/5 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium capitalize text-foreground">{value}</span>
  </div>
);

const getSubscriptionSparkline = (values: number[], width: number, height: number) => {
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

const AddSubscriptionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { addSubscription } = useDataStore();

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
        <label className="text-sm font-medium">Subscription Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Netflix"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="9.99"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Next Renewal Date</label>
        <Input
          type="date"
          value={nextRenewalDate}
          onChange={(e) => setNextRenewalDate(e.target.value)}
          required
        />
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
