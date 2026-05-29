import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Plus, Search, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Warranty } from '@/types';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatDate, formatRelativeTime, parseDateInputValue } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import { UploadDocumentButton } from '@/components/upload/UploadDocumentButton';

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

export const WarrantiesPage = () => {
  const { warranties, activeDocuments, deleteWarranty, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const warrantiesTheme = getSectionTheme('warranties');

  const filteredWarranties = warranties.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const uploadedDocs = activeDocuments.filter((doc) => doc.section === 'warranties');
  const nextExpiry =
    warranties
      .slice()
      .sort((left, right) => left.expirationDate.toDate().getTime() - right.expirationDate.toDate().getTime())[0] ??
    null;
  const expiringSoonCount = warranties.filter(
    (item) => differenceInDays(item.expirationDate.toDate(), new Date()) <= 30,
  ).length;
  const healthyCount = warranties.filter(
    (item) => differenceInDays(item.expirationDate.toDate(), new Date()) > 30,
  ).length;
  const retailerCount = new Set(warranties.map((item) => item.retailer).filter(Boolean)).size;
  const providerCount = new Set(warranties.map((item) => item.warrantyProvider).filter(Boolean)).size;
  const longestCoverage = warranties.length > 0
    ? Math.max(...warranties.map((item) => item.warrantyDurationMonths))
    : 0;
  const coverageFlowRows = [
    {
      label: 'Protected items',
      value: warranties.length,
      display: warranties.length.toString(),
      helper: 'Coverage records',
      color: '#38bdf8',
      max: Math.max(warranties.length + 1, 1),
    },
    {
      label: 'Expiring soon',
      value: expiringSoonCount,
      display: expiringSoonCount.toString(),
      helper: expiringSoonCount > 0 ? 'Needs review' : 'All clear',
      color: '#f59e0b',
      max: Math.max(warranties.length, 1),
    },
    {
      label: 'Healthy coverage',
      value: healthyCount,
      display: healthyCount.toString(),
      helper: 'More than 30 days left',
      color: '#14b8a6',
      max: Math.max(warranties.length, 1),
    },
    {
      label: 'Uploaded proof',
      value: uploadedDocs.length,
      display: uploadedDocs.length.toString(),
      helper: 'Receipts and cards',
      color: '#8b5cf6',
      max: Math.max(uploadedDocs.length + 1, 1),
    },
  ];

  const getWarrantyProgress = (warranty: Warranty) => {
    const total = warranty.warrantyDurationMonths * 30;
    const elapsed = differenceInDays(new Date(), warranty.purchaseDate.toDate());
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getDaysRemaining = (warranty: Warranty) =>
    differenceInDays(warranty.expirationDate.toDate(), new Date());

  const handleDeleteWarranty = async (id: string, productName: string) => {
    if (!confirm(`Delete "${productName}"?`)) return;

    await deleteWarranty(id);
    showToast({ title: 'Warranty deleted', type: 'success' });
  };

  const handleDeleteUploadedDocument = async (documentId: string, title: string) => {
    const shouldDelete = confirm(
      `Delete "${title}"? Any linked warranty reminders or related entries from this upload will also be removed.`,
    );

    if (!shouldDelete) return;

    await deleteDocument(documentId);
    showToast({ title: 'Warranty document deleted', type: 'success' });
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
            Warranties
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Coverage windows, receipts, and support details in the same clean workspace as your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500">
                <Plus className="mr-2 h-4 w-4" />
                Add Warranty
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Warranty</DialogTitle>
              </DialogHeader>
              <AddWarrantyForm onSuccess={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <UploadDocumentButton defaultSection="warranties" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WarrantyMetricCard
          icon={ShieldCheck}
          label="Protected Items"
          value={warranties.length.toString()}
          helper={`${healthyCount} healthy`}
          colors={['#2563eb', '#0e7490']}
          values={[0, warranties.length, healthyCount, warranties.length + 1, warranties.length]}
        />
        <WarrantyMetricCard
          icon={CalendarClock}
          label="Expiring Soon"
          value={expiringSoonCount.toString()}
          helper={expiringSoonCount > 0 ? 'Review soon' : 'All clear'}
          colors={['#0f766e', '#115e59']}
          values={[expiringSoonCount, expiringSoonCount + 1, expiringSoonCount, warranties.length, healthyCount]}
        />
        <WarrantyMetricCard
          icon={Sparkles}
          label="Longest Coverage"
          value={`${longestCoverage} mo`}
          helper="Best window"
          colors={['#b45309', '#92400e']}
          values={[0, longestCoverage * 0.25, longestCoverage * 0.45, longestCoverage, longestCoverage * 0.7]}
        />
        <WarrantyMetricCard
          icon={ArrowRight}
          label="Warranty Uploads"
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
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Coverage Flow</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Warranty health and proof records that need attention.
                </p>
              </div>
              <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                {expiringSoonCount} expiring soon
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                {coverageFlowRows.map((row) => (
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
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold">Protection Record</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  Keep receipts, warranty cards, retailers, and support contacts ready before service windows close.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-white/15 px-3 py-2">{retailerCount} retailers</span>
                  <span className="rounded-xl bg-white/15 px-3 py-2">{providerCount} providers</span>
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
                  Next Expiry
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  {nextExpiry ? nextExpiry.productName : 'Nothing added yet'}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                <CalendarClock className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {nextExpiry
                ? `Coverage ends ${formatRelativeTime(nextExpiry.expirationDate.toDate()).toLowerCase()}. Keeping the details here makes claims and support easier to handle in time.`
                : 'Add a protected product to start seeing expiry pressure before it becomes a problem.'}
            </p>

            <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <SummaryRow
                label="Expires"
                value={nextExpiry ? formatDate(nextExpiry.expirationDate.toDate()) : 'Nothing pending'}
              />
              <SummaryRow
                label="Time Left"
                value={nextExpiry ? `${getDaysRemaining(nextExpiry)} days` : 'All clear'}
              />
              <SummaryRow
                label="Retailer"
                value={nextExpiry?.retailer || 'Not added'}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <WarrantyCompactMetric label="Retailers" value={retailerCount.toString()} />
              <WarrantyCompactMetric label="Providers" value={providerCount.toString()} />
              <WarrantyCompactMetric label="Under 30 Days" value={expiringSoonCount.toString()} />
              <WarrantyCompactMetric label="Healthy Items" value={healthyCount.toString()} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search warranties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-2xl border-border/70 pl-10"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Uploaded warranty documents</h2>
                <p className="text-sm text-muted-foreground">
                  Warranty cards, invoices, and supporting proofs of coverage.
                </p>
              </div>
              <Badge className={warrantiesTheme.badgeClassName}>{uploadedDocs.length}</Badge>
            </div>
            {uploadedDocs.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-emerald-500/20 bg-emerald-500/5 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                  <Sparkles className="h-6 w-6 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Upload your warranty proofs</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Upload a receipt or warranty certificate so proof of coverage is ready when repairs, claims, or support requests come up.
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
                        <Badge className={warrantiesTheme.badgeClassName}>warranty</Badge>
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
                          <ArrowRight className="h-4 w-4 text-emerald-300 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                      <p className="line-clamp-2 font-semibold group-hover:text-emerald-200">{doc.title}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {doc.fileName}
                      </p>
                      {doc.extractedData?.serialNumber ? (
                        <p className="text-sm text-muted-foreground">Serial: {doc.extractedData.serialNumber}</p>
                      ) : null}
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-4">
        {filteredWarranties.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-dashed border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-emerald-500/20 bg-emerald-500/10">
                  <ShieldCheck className="h-7 w-7 text-emerald-300" />
                </div>
                {warranties.length === 0 ? (
                  <>
                    <h3 className="mt-5 text-xl font-semibold">Add your first warranty before coverage is forgotten</h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                      Start with one protected product so warranty windows, retailers, and support details stay easy to retrieve when something goes wrong.
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="mt-5">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Warranty
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="mt-5 text-xl font-semibold">No warranties found</h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                      Adjust your search or add another warranty to keep product coverage visible before it quietly expires.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          filteredWarranties.map((warranty) => {
            const progress = getWarrantyProgress(warranty);
            const daysRemaining = getDaysRemaining(warranty);

            return (
              <motion.div
                key={warranty.id}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="border-border/70 transition-all duration-300 hover:border-emerald-500/25 hover:shadow-[0_14px_34px_-20px_rgba(16,185,129,0.35)]">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{warranty.productName}</h3>
                          <Badge className={warrantiesTheme.badgeClassName}>
                            {warranty.warrantyDurationMonths} mo
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Purchased {formatDate(warranty.purchaseDate.toDate())}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {warranty.retailer ? <span>Retailer: {warranty.retailer}</span> : null}
                          {warranty.warrantyProvider ? <span>Provider: {warranty.warrantyProvider}</span> : null}
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <div className="flex items-center justify-between gap-3 lg:justify-end">
                          <div>
                            <p className={cn('font-medium', daysRemaining <= 30 ? 'text-amber-300' : 'text-emerald-300')}>
                              {daysRemaining} days left
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {formatDate(warranty.expirationDate.toDate())}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDeleteWarranty(warranty.id, warranty.productName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Coverage used</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

const WarrantyMetricCard = ({
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
  const wave = getWarrantySparkline(values, 220, 50);

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

const WarrantyCompactMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-sky-500/10 bg-sky-500/5 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

const getWarrantySparkline = (values: number[], width: number, height: number) => {
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

const AddWarrantyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { addWarranty } = useDataStore();

  const [productName, setProductName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState('12');
  const [retailer, setRetailer] = useState('');
  const [warrantyProvider, setWarrantyProvider] = useState('');
  const [contactInfo, setContactInfo] = useState('');
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
        warrantyProvider: warrantyProvider || undefined,
        contactInfo: contactInfo || undefined,
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
        <Input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="iPhone 15"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Purchase Date</label>
        <Input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Warranty Duration (Months)</label>
        <Input
          type="number"
          value={warrantyDurationMonths}
          onChange={(e) => setWarrantyDurationMonths(e.target.value)}
          placeholder="12"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Retailer</label>
        <Input
          value={retailer}
          onChange={(e) => setRetailer(e.target.value)}
          placeholder="Apple Store"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Warranty Provider</label>
        <Input
          value={warrantyProvider}
          onChange={(e) => setWarrantyProvider(e.target.value)}
          placeholder="Apple Care"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Contact Info</label>
        <Input
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="support@example.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Add Warranty'}
      </Button>
    </form>
  );
};
