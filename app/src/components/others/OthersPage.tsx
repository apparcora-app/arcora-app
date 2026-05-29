import { useMemo, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, FolderKanban, Image, Layers3, Search, Sparkles, Trash2 } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UploadDocumentButton } from '@/components/upload/UploadDocumentButton';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatDate, toDateValue } from '@/lib/utils';
import { showToast } from '@/lib/notifications';

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

export const OthersPage = () => {
  const { activeDocuments, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

  const othersTheme = getSectionTheme('others');
  const otherDocs = activeDocuments.filter((doc) => doc.section === 'others');

  const filteredDocs = useMemo(
    () =>
      otherDocs
        .filter((doc) =>
          [doc.title, doc.fileName, doc.extractedData?.summary]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        .sort(
          (left, right) =>
            (toDateValue(right.createdAt)?.getTime() ?? 0) -
            (toDateValue(left.createdAt)?.getTime() ?? 0),
        ),
    [otherDocs, searchQuery],
  );

  const stats = useMemo(() => {
    const previewReady = otherDocs.filter((doc) => doc.mimeType.startsWith('image/')).length;
    const recent = otherDocs.filter((doc) => {
      const createdAt = toDateValue(doc.createdAt);
      return createdAt ? differenceInDays(new Date(), createdAt) <= 30 : false;
    }).length;
    const latestDocument =
      otherDocs
        .slice()
        .sort(
          (left, right) =>
            (toDateValue(right.createdAt)?.getTime() ?? 0) -
            (toDateValue(left.createdAt)?.getTime() ?? 0),
        )[0] ?? null;

    return {
      total: otherDocs.length,
      previewReady,
      recent,
      types: new Set(otherDocs.map((doc) => doc.type)).size,
      latestDocument,
    };
  }, [otherDocs]);

  const intakeFlowRows = [
    {
      label: 'Stored records',
      value: stats.total,
      display: stats.total.toString(),
      helper: 'Miscellaneous files',
      color: '#38bdf8',
      max: Math.max(stats.total + 1, 1),
    },
    {
      label: 'Preview ready',
      value: stats.previewReady,
      display: stats.previewReady.toString(),
      helper: 'Image thumbnails',
      color: '#14b8a6',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Recent adds',
      value: stats.recent,
      display: stats.recent.toString(),
      helper: 'Last 30 days',
      color: '#f59e0b',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Document types',
      value: stats.types,
      display: stats.types.toString(),
      helper: 'Unique formats',
      color: '#8b5cf6',
      max: Math.max(stats.types + 1, 1),
    },
  ];

  const handleDeleteDocument = async (documentId: string, title: string) => {
    const shouldDelete = confirm(`Delete "${title}"?`);
    if (!shouldDelete) return;

    await deleteDocument(documentId);
    showToast({ title: 'Document deleted', type: 'success' });
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
            Others
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Miscellaneous life-admin files in the same clean workspace pattern as the rest of Arcora.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <UploadDocumentButton defaultSection="others" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OtherMetricCard
          icon={FolderKanban}
          label="Stored Records"
          value={stats.total.toString()}
          helper={`${stats.types} types`}
          colors={['#2563eb', '#0e7490']}
          values={[0, stats.total, stats.previewReady, stats.total + 1, stats.recent]}
        />
        <OtherMetricCard
          icon={Image}
          label="Preview Ready"
          value={stats.previewReady.toString()}
          helper="Image files"
          colors={['#0f766e', '#115e59']}
          values={[0, stats.previewReady, stats.previewReady + 1, stats.total, stats.previewReady]}
        />
        <OtherMetricCard
          icon={Sparkles}
          label="Recent Adds"
          value={stats.recent.toString()}
          helper="Last 30 days"
          colors={['#b45309', '#92400e']}
          values={[0, stats.recent, stats.total, stats.recent + 1, stats.previewReady]}
        />
        <OtherMetricCard
          icon={Layers3}
          label="Doc Types"
          value={stats.types.toString()}
          helper="Queue spread"
          colors={['#7c3aed', '#5b21b6']}
          values={[0, stats.types, stats.types + 1, stats.total, stats.types]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Intake Flow</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Miscellaneous records that are parked safely until they deserve a better home.
                </p>
              </div>
              <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                {stats.total} stored
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                {intakeFlowRows.map((row) => (
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
                  <FolderKanban className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold">Clean Holding Space</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  Keep important loose files searchable now, then move them into a dedicated section when they fit.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-white/15 px-3 py-2">{stats.previewReady} previews</span>
                  <span className="rounded-xl bg-white/15 px-3 py-2">{stats.recent} recent</span>
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
                  Latest Misc File
                </p>
                <p className="mt-2 line-clamp-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  {stats.latestDocument ? stats.latestDocument.title : 'Clean slate'}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {stats.latestDocument
                ? stats.latestDocument.extractedData?.summary || stats.latestDocument.fileName
                : 'Upload one important uncategorized file so it has a visible place to live while you decide where it belongs.'}
            </p>

            <div className="mt-5 space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <SummaryRow label="Stored" value={stats.total.toString()} />
              <SummaryRow label="Preview Ready" value={stats.previewReady.toString()} />
              <SummaryRow label="Recent Adds" value={stats.recent.toString()} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <OtherCompactMetric label="Types" value={stats.types.toString()} />
              <OtherCompactMetric label="Queue" value={Math.max(stats.total - stats.previewReady, 0).toString()} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search uncategorized uploads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-2xl border-border/70 pl-10"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        {filteredDocs.length === 0 ? (
          <Card className="border-dashed border-fuchsia-500/20 bg-fuchsia-500/5">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-fuchsia-500/20 bg-fuchsia-500/10">
                <FolderKanban className="h-7 w-7 text-fuchsia-600 dark:text-fuchsia-300" />
              </div>
              {otherDocs.length === 0 ? (
                <>
                  <h3 className="mt-5 text-xl font-semibold">Keep miscellaneous records from getting lost</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Upload a file here when it matters but does not fit a main section yet. Arcora gives it a clean place to land.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <UploadDocumentButton defaultSection="others" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="mt-5 text-xl font-semibold">No uncategorized uploads match this view</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Change your search to browse the queue, or add another file when something important needs a temporary home.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <UploadDocumentButton defaultSection="others" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocs.map((doc) => (
              <motion.a
                key={doc.id}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
                whileTap={{ scale: 0.985 }}
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-[1.7rem] border border-border/70 bg-card/75"
              >
                <DocumentThumbnail doc={doc} className="h-52 rounded-none border-0" />

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={othersTheme.badgeClassName}>{doc.type.replace('-', ' ')}</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void handleDeleteDocument(doc.id, doc.title);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ArrowRight className={cn('h-4 w-4 transition-transform group-hover:translate-x-1', othersTheme.accentTextClassName)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{doc.title}</h3>
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {doc.extractedData?.summary || 'No extracted preview available yet.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                        Added
                      </p>
                      <p className="mt-1">{formatDate(doc.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                        File
                      </p>
                      <p className="mt-1 line-clamp-1">{doc.fileName}</p>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const OtherMetricCard = ({
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
  const wave = getOtherSparkline(values, 220, 50);

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

const OtherCompactMetric = ({ label, value }: { label: string; value: string }) => (
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

const getOtherSparkline = (values: number[], width: number, height: number) => {
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
