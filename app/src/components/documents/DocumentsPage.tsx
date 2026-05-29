import { useMemo, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { FileText, Layers3, Search, Shield, Trash2, Upload } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeferredUploadDocumentDialog } from '@/components/upload/DeferredUploadDocumentDialog';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import type { Document, DocumentType } from '@/types';

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

const tabOptions: Array<{ value: DocumentType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'passport', label: 'Passport' },
  { value: 'license', label: 'License' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'contract', label: 'Contracts' },
  { value: 'bill', label: 'Bills' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'other', label: 'Other' },
];

export const DocumentsPage = () => {
  const { activeDocuments, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentType | 'all'>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const filteredDocuments = activeDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeTab === 'all' || doc.type === activeTab;
    return matchesSearch && matchesType;
  });

  const stats = useMemo(() => {
    const expiringSoon = activeDocuments.filter((doc) => {
      if (!doc.expirationDate) return false;
      const days = differenceInDays(doc.expirationDate.toDate(), new Date());
      return days >= 0 && days <= 30;
    }).length;

    return {
      total: activeDocuments.length,
      expiringSoon,
      imageReady: activeDocuments.filter((doc) => doc.mimeType.startsWith('image/')).length,
      sections: new Set(activeDocuments.map((doc) => doc.section)).size,
      totalFileSize: activeDocuments.reduce((sum, doc) => sum + doc.fileSize, 0),
    };
  }, [activeDocuments]);
  const latestDocument = useMemo(
    () =>
      activeDocuments
        .slice()
        .sort((left, right) => right.createdAt.toDate().getTime() - left.createdAt.toDate().getTime())[0] ?? null,
    [activeDocuments],
  );
  const vaultFlowRows = [
    {
      label: 'Stored records',
      value: stats.total,
      display: stats.total.toString(),
      helper: 'Documents in your vault',
      color: '#38bdf8',
      max: Math.max(stats.total + 1, 1),
    },
    {
      label: 'Preview ready',
      value: stats.imageReady,
      display: stats.imageReady.toString(),
      helper: 'Image files with thumbnails',
      color: '#14b8a6',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Expiring soon',
      value: stats.expiringSoon,
      display: stats.expiringSoon.toString(),
      helper: stats.expiringSoon > 0 ? 'Needs review' : 'All clear',
      color: '#f59e0b',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Sections covered',
      value: stats.sections,
      display: stats.sections.toString(),
      helper: 'Organized areas',
      color: '#8b5cf6',
      max: 8,
    },
  ];

  const getExpirationStatus = (doc: Document) => {
    if (!doc.expirationDate) return null;

    const days = differenceInDays(doc.expirationDate.toDate(), new Date());

    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring';
    return 'valid';
  };

  const handleDeleteDocument = async (document: Document) => {
    const shouldDelete = confirm(
      `Delete "${document.title}"? Any linked auto-created reminders or bill entries from this upload will also be removed.`,
    );

    if (!shouldDelete) return;

    await deleteDocument(document.id);
    showToast({
      title: 'Document deleted',
      description: 'Linked reminder and bill records were cleaned up where needed.',
      type: 'success',
    });
  };

  return (
    <>
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
              Documents Vault
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              IDs, bills, certificates, contracts, and everyday records in the same clean workspace as your dashboard.
            </p>
          </div>

          <Button onClick={() => setUploadDialogOpen(true)} className="w-fit rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DocumentMetricCard
            icon={FileText}
            label="Stored Records"
            value={stats.total.toString()}
            helper={`${stats.sections} sections`}
            colors={['#2563eb', '#0e7490']}
            values={[0, stats.total, stats.imageReady, stats.total + 1, stats.sections]}
          />
          <DocumentMetricCard
            icon={Shield}
            label="Expiring Soon"
            value={stats.expiringSoon.toString()}
            helper={stats.expiringSoon > 0 ? 'Review soon' : 'All clear'}
            colors={['#0f766e', '#115e59']}
            values={[stats.expiringSoon, stats.expiringSoon + 1, stats.expiringSoon, stats.total, stats.imageReady]}
          />
          <DocumentMetricCard
            icon={Upload}
            label="Preview Ready"
            value={stats.imageReady.toString()}
            helper="Thumbnail files"
            colors={['#b45309', '#92400e']}
            values={[0, stats.imageReady, stats.imageReady + 1, stats.total, stats.imageReady]}
          />
          <DocumentMetricCard
            icon={Layers3}
            label="Vault Size"
            value={formatFileSize(stats.totalFileSize)}
            helper="Stored files"
            colors={['#7c3aed', '#5b21b6']}
            values={[0, stats.totalFileSize * 0.25, stats.totalFileSize * 0.55, stats.totalFileSize, stats.totalFileSize * 0.8]}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Vault Flow</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Document coverage, previews, and records that need review.
                  </p>
                </div>
                <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                  {stats.total} stored
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-4">
                  {vaultFlowRows.map((row) => (
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
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm font-semibold">Private Record System</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    Keep high-value files browseable, previewable, and close when renewals, claims, or identity checks appear.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                    <span className="rounded-xl bg-white/15 px-3 py-2">{stats.imageReady} previews</span>
                    <span className="rounded-xl bg-white/15 px-3 py-2">{stats.sections} sections</span>
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
                    Latest Record
                  </p>
                  <p className="mt-2 line-clamp-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                    {latestDocument ? latestDocument.title : 'Nothing uploaded yet'}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                  <Shield className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {latestDocument
                  ? latestDocument.extractedData?.summary || latestDocument.fileName
                  : 'Upload one important document to start making your vault useful immediately.'}
              </p>

              <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <SummaryRow label="Expiring Soon" value={stats.expiringSoon.toString()} />
                <SummaryRow label="Preview Ready" value={stats.imageReady.toString()} />
                <SummaryRow label="Sections Covered" value={stats.sections.toString()} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <DocumentCompactMetric label="Stored" value={stats.total.toString()} />
                <DocumentCompactMetric label="Vault Size" value={formatFileSize(stats.totalFileSize)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents, file names, or document titles..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-12 rounded-2xl border-border/70 pl-10"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType | 'all')}>
            <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/70 p-2">
              {tabOptions.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredDocuments.length === 0 ? (
                <Card className="border-dashed border-slate-500/20 bg-slate-500/5">
                  <CardContent className="py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-slate-500/20 bg-slate-500/10">
                      <FileText className="h-7 w-7 text-slate-600 dark:text-slate-300" />
                    </div>
                    {activeDocuments.length === 0 ? (
                      <>
                        <h3 className="mt-5 text-xl font-semibold">Upload your first document to start a calmer record system</h3>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                          Start with one important file and Arcora gives you a cleaner place to keep records protected, browsable, and ready when you need them.
                        </p>
                        <Button onClick={() => setUploadDialogOpen(true)} className="mt-5">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="mt-5 text-xl font-semibold">No documents match this view</h3>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                          Try another filter, or upload another document so your vault stays easy to browse and retrieve from later.
                        </p>
                        <Button onClick={() => setUploadDialogOpen(true)} className="mt-5">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredDocuments.map((doc) => {
                    const expirationStatus = getExpirationStatus(doc);
                    const theme = getSectionTheme(doc.section);

                    return (
                      <motion.div
                        key={doc.id}
                        variants={itemVariants}
                        whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
                        whileTap={{ scale: 0.985 }}
                        layout
                        className="h-full overflow-hidden rounded-[1.7rem] border border-border/70 bg-card/75"
                      >
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="block">
                          <DocumentThumbnail doc={doc} className="h-52 rounded-none border-0" />

                          <div className="flex h-[calc(100%-13rem)] flex-col p-5">
                            <div className="flex items-center justify-between gap-2">
                              <Badge className={cn('capitalize', theme.badgeClassName)}>
                                {doc.section.replace('-', ' ')}
                              </Badge>
                              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                                {doc.type.replace('-', ' ')}
                              </span>
                            </div>

                            <div className="mt-4 space-y-2">
                              <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{doc.title}</h3>
                              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {doc.extractedData?.summary || doc.fileName}
                              </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                                  File Size
                                </p>
                                <p className="mt-1">{formatFileSize(doc.fileSize)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                                  Added
                                </p>
                                <p className="mt-1">{formatDate(doc.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </a>

                        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              expirationStatus === 'expired' && 'border-destructive/30 text-destructive',
                              expirationStatus === 'expiring' && 'border-amber-500/30 text-amber-300',
                              expirationStatus === 'valid' && 'border-emerald-500/30 text-emerald-300',
                            )}
                          >
                            {expirationStatus || doc.parserStatus || 'stored'}
                          </Badge>

                          <div className="flex items-center gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={cn('text-sm font-medium', theme.accentTextClassName)}
                            >
                              Open
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteDocument(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <DeferredUploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        defaultSection="documents"
      />
    </>
  );
};

const DocumentMetricCard = ({
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
  const wave = getDocumentSparkline(values, 220, 50);

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

const DocumentCompactMetric = ({ label, value }: { label: string; value: string }) => (
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

const getDocumentSparkline = (values: number[], width: number, height: number) => {
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
