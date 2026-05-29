import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Calendar,
  Check,
  Clock3,
  Download,
  Edit,
  FileText,
  Home,
  MoreVertical,
  Plus,
  Receipt,
  Search,
  Shield,
  Trash2,
  Zap,
  CreditCard,
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatCurrency, formatDate, formatRelativeTime, getCategoryColor, getUrgency, getUrgencyColor } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import type { Bill, BillCategory, BillStatus } from '@/types';
import { AddBillForm } from './AddBillForm';
import { EditBillForm } from './EditBillForm';
import { UploadDocumentButton } from '@/components/upload/UploadDocumentButton';

const categoryIcons: Record<BillCategory, React.ElementType> = {
  utilities: Zap,
  housing: Home,
  insurance: Shield,
  'credit-card': CreditCard,
  loan: Banknote,
  other: FileText,
};

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

export const BillsPage = () => {
  const { bills, activeDocuments, deleteBill, markBillAsPaid, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<BillCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || bill.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uploadedBillDocs = activeDocuments.filter((doc) => doc.section === 'bills');
  const billsTheme = getSectionTheme('bills');

  const totalDue = bills
    .filter((bill) => bill.status !== 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const paidThisMonth = bills
    .filter((bill) => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const pendingCount = bills.filter((bill) => bill.status === 'pending').length;
  const overdueCount = bills.filter((bill) => bill.status === 'overdue').length;
  const paidCount = bills.filter((bill) => bill.status === 'paid').length;
  const nextDueBill = useMemo(
    () =>
      bills
        .filter((bill) => bill.status !== 'paid')
        .sort((left, right) => left.dueDate.toDate().getTime() - right.dueDate.toDate().getTime())[0] ?? null,
    [bills],
  );
  const categoryCounts = {
    utilities: bills.filter((bill) => bill.category === 'utilities').length,
    housing: bills.filter((bill) => bill.category === 'housing').length,
    insurance: bills.filter((bill) => bill.category === 'insurance').length,
    creditCard: bills.filter((bill) => bill.category === 'credit-card').length,
  };
  const paymentFlowRows = [
    {
      label: 'Current due',
      value: totalDue,
      display: formatCurrency(totalDue),
      helper: `${pendingCount} pending`,
      color: '#38bdf8',
      max: Math.max(totalDue + paidThisMonth, 1),
    },
    {
      label: 'Paid this month',
      value: paidThisMonth,
      display: formatCurrency(paidThisMonth),
      helper: `${paidCount} settled`,
      color: '#14b8a6',
      max: Math.max(totalDue + paidThisMonth, 1),
    },
    {
      label: 'Overdue',
      value: overdueCount,
      display: overdueCount.toString(),
      helper: overdueCount > 0 ? 'Needs review' : 'All clear',
      color: '#f59e0b',
      max: Math.max(bills.length, 1),
    },
    {
      label: 'Uploaded proof',
      value: uploadedBillDocs.length,
      display: uploadedBillDocs.length.toString(),
      helper: 'Bill files stored',
      color: '#8b5cf6',
      max: Math.max(uploadedBillDocs.length + 1, 1),
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    await deleteBill(id);
    showToast({ title: 'Bill deleted', type: 'success' });
  };

  const handleMarkAsPaid = async (id: string) => {
    await markBillAsPaid(id);
    showToast({ title: 'Bill marked as paid', type: 'success' });
  };

  const handleDeleteUploadedDocument = async (documentId: string, title: string) => {
    const shouldDelete = confirm(
      `Delete "${title}"? Any linked bill entry or automatic reminders from this upload will also be removed.`,
    );

    if (!shouldDelete) return;

    await deleteDocument(documentId);
    showToast({
      title: 'Uploaded bill deleted',
      description: 'Linked bill and reminder records were cleaned up where needed.',
      type: 'success',
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Amount', 'Due Date', 'Category', 'Status'].join(','),
      ...bills.map((item) => [
        item.title,
        item.amount,
        formatDate(item.dueDate.toDate()),
        item.category,
        item.status,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bills-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    showToast({ title: 'Bills exported', type: 'success' });
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
            Bills & Finance
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Due dates, payment history, and bill documents in the same calm workspace pattern as your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500">
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Button>
          <UploadDocumentButton defaultSection="bills" />
          <Button variant="outline" onClick={handleExport} className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BillMetricCard
          icon={Receipt}
          label="Total Due"
          value={formatCurrency(totalDue)}
          helper={`${pendingCount} pending`}
          colors={['#2563eb', '#0e7490']}
          values={[0, totalDue * 0.35, totalDue * 0.18, totalDue, totalDue * 0.7, totalDue * 0.9]}
        />
        <BillMetricCard
          icon={Check}
          label="Paid This Month"
          value={formatCurrency(paidThisMonth)}
          helper={`${paidCount} settled`}
          colors={['#0f766e', '#115e59']}
          values={[paidThisMonth * 0.2, paidThisMonth * 0.55, paidThisMonth * 0.35, paidThisMonth, paidThisMonth * 0.7]}
        />
        <BillMetricCard
          icon={AlertCircle}
          label="Open Bills"
          value={(pendingCount + overdueCount).toString()}
          helper={overdueCount > 0 ? `${overdueCount} overdue` : 'All clear'}
          colors={['#b45309', '#92400e']}
          values={[pendingCount, pendingCount + 1, overdueCount, pendingCount + overdueCount + 1, pendingCount]}
        />
        <BillMetricCard
          icon={FileText}
          label="Bill Uploads"
          value={uploadedBillDocs.length.toString()}
          helper="Stored proof"
          colors={['#7c3aed', '#5b21b6']}
          values={[0, uploadedBillDocs.length, uploadedBillDocs.length + 1, uploadedBillDocs.length, uploadedBillDocs.length + 2]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Payment Flow</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current bill movement and stored payment context.
                </p>
              </div>
              <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                {formatCurrency(totalDue)} due
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                {paymentFlowRows.map((row) => (
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
                  <Receipt className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold">Finance Context</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  Uploaded statements, tracked bills, and paid records stay close enough to review without hunting.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-white/15 px-3 py-2">{bills.length} bills</span>
                  <span className="rounded-xl bg-white/15 px-3 py-2">{uploadedBillDocs.length} files</span>
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
                  Next Payment
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  {nextDueBill ? nextDueBill.title : 'Everything is covered'}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                <Clock3 className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {nextDueBill
                ? `${formatCurrency(nextDueBill.amount)} due ${formatRelativeTime(nextDueBill.dueDate.toDate()).toLowerCase()}. Handling it early keeps the rest of the month quieter.`
                : 'No unpaid bills are competing for attention right now.'}
            </p>

            <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <SummaryRow
                label="Amount"
                value={nextDueBill ? formatCurrency(nextDueBill.amount) : 'Nothing due'}
              />
              <SummaryRow
                label="Due"
                value={nextDueBill ? formatDate(nextDueBill.dueDate.toDate()) : 'All clear'}
              />
              <SummaryRow
                label="Status"
                value={nextDueBill ? nextDueBill.status.replace('-', ' ') : 'On track'}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <BillCompactMetric label="Utilities" value={categoryCounts.utilities.toString()} />
              <BillCompactMetric label="Housing" value={categoryCounts.housing.toString()} />
              <BillCompactMetric label="Insurance" value={categoryCounts.insurance.toString()} />
              <BillCompactMetric label="Cards" value={categoryCounts.creditCard.toString()} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-border/70 pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BillStatus | 'all')}
            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as BillCategory | 'all')}
            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="utilities">Utilities</option>
            <option value="housing">Housing</option>
            <option value="insurance">Insurance</option>
            <option value="credit-card">Credit Card</option>
            <option value="loan">Loan</option>
            <option value="other">Other</option>
          </select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Uploaded bill documents</h2>
                <p className="text-sm text-muted-foreground">
                  Auto-detected and organized bill uploads.
                </p>
              </div>
              <Badge className={billsTheme.badgeClassName}>{uploadedBillDocs.length}</Badge>
            </div>

            {uploadedBillDocs.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-amber-500/20 bg-amber-500/5 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                  <Receipt className="h-6 w-6 text-amber-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Upload your first bill document</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Upload a bill or statement to keep the amount, provider, and due date easier to verify when payment time comes around.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {uploadedBillDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/70"
                  >
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="block">
                      <DocumentThumbnail doc={doc} className="h-40 rounded-none border-0" />
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={billsTheme.badgeClassName}>bill upload</Badge>
                          <ArrowRight className="h-4 w-4 text-amber-300 transition-transform group-hover:translate-x-1" />
                        </div>
                        <p className="line-clamp-2 font-semibold group-hover:text-amber-200">{doc.title}</p>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          {doc.extractedData?.bill?.providerName ? (
                            <p>Provider: {doc.extractedData.bill.providerName}</p>
                          ) : null}
                          {doc.extractedData?.bill?.amountDue ? (
                            <p>
                              Current due:{' '}
                              {formatCurrency(doc.extractedData.bill.amountDue, doc.extractedData.bill.currency)}
                            </p>
                          ) : null}
                          {doc.extractedData?.bill?.invoiceNumber ? (
                            <p>Invoice #: {doc.extractedData.bill.invoiceNumber}</p>
                          ) : null}
                        </div>
                      </div>
                    </a>
                    <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn('text-sm font-medium', billsTheme.accentTextClassName)}
                      >
                        Open
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteUploadedDocument(doc.id, doc.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {filteredBills.length === 0 ? (
          <Card className="border-dashed border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-amber-500/20 bg-amber-500/10">
                <Receipt className="h-7 w-7 text-amber-300" />
              </div>
              {bills.length === 0 ? (
                <>
                  <h3 className="mt-5 text-xl font-semibold">Add your first bill to stay ahead of due dates</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Start with one bill and Arcora will give you a clearer place to track what is due, what is paid, and what needs attention next.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bill
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="mt-5 text-xl font-semibold">No bills match this view</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Adjust the filters, or add another bill to keep upcoming payments visible before they become urgent.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredBills.map((bill) => {
            const Icon = categoryIcons[bill.category] || FileText;
            const urgency = getUrgency(bill.dueDate.toDate());

            return (
              <motion.div
                key={bill.id}
                whileHover={{ y: -4 }}
                className={cn(
                  'group rounded-[1.65rem] border bg-card/85 p-5 transition-all hover:border-amber-500/25 hover:shadow-[0_14px_36px_-18px_rgba(245,158,11,0.35)]',
                  bill.status === 'overdue' && 'border-destructive/35 bg-destructive/5',
                )}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0',
                      getCategoryColor(bill.category),
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold">{bill.title}</h3>
                      {bill.isRecurring && (
                        <Badge variant="outline" className="rounded-full text-[11px] uppercase tracking-[0.2em]">
                          Recurring
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {bill.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(bill.dueDate.toDate())}
                      </span>
                      <span className="capitalize">{bill.category.replace('-', ' ')}</span>
                      {urgency !== 'future' && bill.status !== 'paid' && (
                        <Badge variant="outline" className={cn('text-xs', getUrgencyColor(urgency))}>
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {urgency}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 lg:items-end">
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Amount</p>
                      <p className="mt-2 text-2xl font-semibold">{formatCurrency(bill.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {bill.status !== 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(bill.id)}>
                          <Check className="mr-1 h-4 w-4" />
                          Pay
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingBill(bill)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDelete(bill.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <AddBillForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editingBill ? (
            <EditBillForm bill={editingBill} onSuccess={() => setEditingBill(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const BillMetricCard = ({
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
  const wave = getBillSparkline(values, 220, 50);

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

const BillCompactMetric = ({ label, value }: { label: string; value: string }) => (
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

const getBillSparkline = (values: number[], width: number, height: number) => {
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
