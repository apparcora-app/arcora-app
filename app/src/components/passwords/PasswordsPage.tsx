import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
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
import { showToast } from '@/lib/notifications';
import { UploadDocumentButton } from '@/components/upload/UploadDocumentButton';
import { DocumentThumbnail } from '@/components/documents/DocumentThumbnail';
import { getSectionTheme } from '@/lib/sectionTheme';
import { cn, formatDate, formatRelativeTime, getCategoryColor } from '@/lib/utils';
import type {
  Password as PasswordRecord,
  PasswordCategory,
  PasswordStrength,
} from '@/types';

const MASKED_PASSWORD = '************';

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

const strengthBadgeClassNames: Record<PasswordStrength, string> = {
  weak: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300',
  fair: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  strong: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  'very-strong': 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300',
};

export const PasswordsPage = () => {
  const { passwords, documents, getDecryptedPassword, deletePassword, deleteDocument } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [sessionMasterKey, setSessionMasterKey] = useState('');
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [addPasswordOpen, setAddPasswordOpen] = useState(false);

  const passwordsTheme = getSectionTheme('passwords');
  const uploadedDocs = documents.filter((doc) => doc.section === 'passwords');

  const filteredPasswords = useMemo(
    () =>
      passwords
        .filter((item) =>
          [item.serviceName, item.username, item.serviceUrl]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        .sort((left, right) => right.updatedAt.toDate().getTime() - left.updatedAt.toDate().getTime()),
    [passwords, searchQuery],
  );

  const stats = useMemo(() => {
    const withWebsite = passwords.filter((item) => Boolean(item.serviceUrl)).length;
    const financeCount = passwords.filter((item) => item.category === 'finance').length;
    const strongCount = passwords.filter(
      (item) => item.strength === 'strong' || item.strength === 'very-strong',
    ).length;
    const weakCount = passwords.filter((item) => item.strength === 'weak' || item.strength === 'fair').length;
    const latest = [...passwords].sort(
      (left, right) => right.lastChanged.toDate().getTime() - left.lastChanged.toDate().getTime(),
    )[0];

    return {
      total: passwords.length,
      withWebsite,
      financeCount,
      strongCount,
      weakCount,
      latest,
    };
  }, [passwords]);
  const strongPercent = stats.total === 0 ? 0 : Math.round((stats.strongCount / stats.total) * 100);
  const securityFlowRows = [
    {
      label: 'Saved logins',
      value: stats.total,
      display: stats.total.toString(),
      helper: 'Credentials in vault',
      color: '#38bdf8',
      max: Math.max(stats.total + 1, 1),
    },
    {
      label: 'Strong coverage',
      value: stats.strongCount,
      display: `${strongPercent}%`,
      helper: `${stats.strongCount} strong records`,
      color: '#14b8a6',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Needs review',
      value: stats.weakCount,
      display: stats.weakCount.toString(),
      helper: stats.weakCount > 0 ? 'Weak or fair' : 'All clear',
      color: '#f59e0b',
      max: Math.max(stats.total, 1),
    },
    {
      label: 'Vault uploads',
      value: uploadedDocs.length,
      display: uploadedDocs.length.toString(),
      helper: 'Recovery files',
      color: '#8b5cf6',
      max: Math.max(uploadedDocs.length + 1, 1),
    },
  ];

  useEffect(() => {
    queueMicrotask(() => {
      setRevealedPasswords(new Set());
      setDecryptedPasswords({});
    });
  }, [sessionMasterKey]);

  const decryptPassword = (item: PasswordRecord) => {
    if (!sessionMasterKey) {
      showToast({
        title: 'Master key required',
        description: 'Enter your session master key to reveal or copy passwords.',
        type: 'warning',
      });
      return null;
    }

    try {
      const decrypted = getDecryptedPassword(item, sessionMasterKey);
      setDecryptedPasswords((current) => ({ ...current, [item.id]: decrypted }));
      return decrypted;
    } catch {
      showToast({
        title: 'Invalid master key',
        description: 'The current master key could not decrypt this password.',
        type: 'error',
      });
      return null;
    }
  };

  const toggleReveal = (item: PasswordRecord) => {
    if (!revealedPasswords.has(item.id)) {
      const decrypted = decryptedPasswords[item.id] ?? decryptPassword(item);
      if (!decrypted) return;
    }

    setRevealedPasswords((previous) => {
      const next = new Set(previous);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const handleCopyPassword = async (item: PasswordRecord) => {
    const decrypted = decryptedPasswords[item.id] ?? decryptPassword(item);
    if (!decrypted) return;

    await navigator.clipboard.writeText(decrypted);
    showToast({ title: 'Password copied', type: 'success' });
  };

  const handleDeletePassword = async (item: PasswordRecord) => {
    if (!confirm(`Delete "${item.serviceName}"?`)) return;

    await deletePassword(item.id);
    showToast({ title: 'Password deleted', type: 'success' });
  };

  const handleDeleteUploadedDocument = async (documentId: string, title: string) => {
    const shouldDelete = confirm(
      `Delete "${title}"? Any linked password-related uploads tied to this record will also be removed.`,
    );

    if (!shouldDelete) return;

    await deleteDocument(documentId);
    showToast({ title: 'Password document deleted', type: 'success' });
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
            Passwords
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Essential logins, recovery files, and local reveal controls in the same clean workspace as your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500">
                <Sparkles className="mr-2 h-4 w-4" />
                Generator
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Password Generator</DialogTitle>
              </DialogHeader>
              <PasswordGenerator />
            </DialogContent>
          </Dialog>

          <Dialog open={addPasswordOpen} onOpenChange={setAddPasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Password
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Password</DialogTitle>
              </DialogHeader>
              <AddPasswordForm onSuccess={() => setAddPasswordOpen(false)} />
            </DialogContent>
          </Dialog>

          <UploadDocumentButton defaultSection="passwords" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PasswordMetricCard
          icon={Lock}
          label="Saved Logins"
          value={stats.total.toString()}
          helper={`${stats.withWebsite} web accounts`}
          colors={['#2563eb', '#0e7490']}
          values={[0, stats.total, stats.withWebsite, stats.total + 1, stats.strongCount]}
        />
        <PasswordMetricCard
          icon={ShieldCheck}
          label="Strong Coverage"
          value={`${strongPercent}%`}
          helper={`${stats.strongCount} strong`}
          colors={['#0f766e', '#115e59']}
          values={[0, stats.strongCount, strongPercent, stats.total, stats.strongCount + 1]}
        />
        <PasswordMetricCard
          icon={KeyRound}
          label="Needs Review"
          value={stats.weakCount.toString()}
          helper={stats.weakCount > 0 ? 'Weak or fair' : 'All clear'}
          colors={['#b45309', '#92400e']}
          values={[stats.weakCount, stats.weakCount + 1, stats.total, stats.weakCount, stats.strongCount]}
        />
        <PasswordMetricCard
          icon={Sparkles}
          label="Vault Uploads"
          value={uploadedDocs.length.toString()}
          helper="Recovery files"
          colors={['#7c3aed', '#5b21b6']}
          values={[0, uploadedDocs.length, uploadedDocs.length + 1, uploadedDocs.length, uploadedDocs.length + 2]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-sky-100 bg-white p-0 dark:border-white/10 dark:bg-white/[0.07]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Security Flow</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Vault coverage, strength, and recovery material that need review.
                </p>
              </div>
              <Badge className="rounded-full border-0 bg-sky-500/12 text-sky-700 hover:bg-sky-500/12 dark:text-sky-200">
                {strongPercent}% strong
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                {securityFlowRows.map((row) => (
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
                <p className="mt-5 text-sm font-semibold">Private Access Vault</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  Keep credentials, linked websites, and recovery documents together while reveal actions stay local.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <span className="rounded-xl bg-white/15 px-3 py-2">{stats.financeCount} finance</span>
                  <span className="rounded-xl bg-white/15 px-3 py-2">{uploadedDocs.length} files</span>
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
                  Session Unlock
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">
                  Reveal and copy locally
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/10 p-3">
                <KeyRound className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your master key stays only in this browser session. Arcora uses it locally so you stay in control of reveal and copy actions.
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-medium">Session Master Key</label>
                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={sessionMasterKey}
                    onChange={(e) => setSessionMasterKey(e.target.value)}
                    placeholder="Enter your master key to reveal and copy passwords"
                    className="h-12 rounded-2xl border-border/70 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PasswordCompactMetric label="Unlocked" value={revealedPasswords.size.toString()} />
                <PasswordCompactMetric label="Web Accounts" value={stats.withWebsite.toString()} />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSessionMasterKey('')}
                disabled={!sessionMasterKey}
                className="w-full rounded-full"
              >
                Clear Session Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services, usernames, or websites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-2xl border-border/70 pl-10"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/70 bg-card/85">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Password-related uploads</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exports, recovery letters, or security PDFs stay visible beside the vault.
                </p>
              </div>
              <Badge className={passwordsTheme.badgeClassName}>{uploadedDocs.length} files</Badge>
            </div>

            {uploadedDocs.length === 0 ? (
              <div className="mt-5 rounded-[1.6rem] border border-dashed border-rose-500/20 bg-rose-500/5 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
                  <Lock className="h-6 w-6 text-rose-600 dark:text-rose-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No password files uploaded yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Upload recovery letters or password exports so critical account access details stay in the same place as your saved logins.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {uploadedDocs.map((doc) => (
                  <motion.a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="overflow-hidden rounded-[1.6rem] border border-border/70 bg-background/60"
                  >
                    <DocumentThumbnail doc={doc} className="h-44 rounded-none border-0" />
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 font-semibold">{doc.title}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void handleDeleteUploadedDocument(doc.id, doc.title);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
        {filteredPasswords.length === 0 ? (
          <Card className="border-dashed border-rose-500/20 bg-rose-500/5">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-rose-500/20 bg-rose-500/10">
                <Lock className="h-7 w-7 text-rose-600 dark:text-rose-300" />
              </div>
              {passwords.length === 0 ? (
                <>
                  <h3 className="mt-5 text-xl font-semibold">Add your first login to keep access under control</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Start with one important account and Arcora gives you a calmer place to manage credentials when you need them most.
                  </p>
                  <Button variant="outline" onClick={() => setAddPasswordOpen(true)} className="mt-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Password
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="mt-5 text-xl font-semibold">No passwords match this view</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Try another search, or add another login to keep important accounts easier to access and manage.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPasswords.map((item) => {
              const revealed = revealedPasswords.has(item.id);

              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
                  whileTap={{ scale: 0.985 }}
                  className="h-full"
                >
                  <Card className="h-full border-border/70 bg-card/80">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn('capitalize border-transparent', getCategoryColor(item.category))}>
                              {item.category}
                            </Badge>
                            <Badge variant="outline" className={cn('capitalize', strengthBadgeClassNames[item.strength])}>
                              {item.strength.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{item.serviceName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.username || 'No username saved'}
                            </p>
                          </div>
                        </div>

                        <div className={cn('rounded-2xl p-3', passwordsTheme.iconWrapClassName)}>
                          <Lock className={cn('h-5 w-5', passwordsTheme.iconClassName)} />
                        </div>
                      </div>

                      <div className="mt-5 rounded-[1.3rem] border border-border/60 bg-muted/25 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                          Secret
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="max-w-[11rem] truncate font-mono text-sm md:max-w-[13rem]">
                            {revealed ? (decryptedPasswords[item.id] ?? MASKED_PASSWORD) : MASKED_PASSWORD}
                          </span>

                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => toggleReveal(item)}>
                              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleCopyPassword(item)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                            Last Changed
                          </p>
                          <p className="mt-1">{formatDate(item.lastChanged)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
                            Updated
                          </p>
                          <p className="mt-1">{formatRelativeTime(item.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">
                          {item.serviceUrl ? 'Website linked' : 'Manual entry'}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.serviceUrl ? (
                            <a
                              href={item.serviceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={cn('inline-flex items-center gap-2 text-sm font-medium', passwordsTheme.accentTextClassName)}
                            >
                              <Globe className="h-4 w-4" />
                              Open
                            </a>
                          ) : null}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDeletePassword(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const charset = useMemo(
    () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}<>?',
    [],
  );

  const generatePassword = () => {
    const safeLength = Math.min(Math.max(length, 8), 64);
    const max = charset.length;
    const cryptoApi = globalThis.crypto;

    if (!cryptoApi) {
      showToast({
        title: 'Secure random unavailable',
        description: 'This browser cannot generate a secure password right now.',
        type: 'error',
      });
      return;
    }

    const randomValues = new Uint32Array(safeLength);
    cryptoApi.getRandomValues(randomValues);

    let result = '';
    for (const value of randomValues) {
      result += charset[value % max];
    }

    setGeneratedPassword(result);
    setLength(safeLength);
  };

  const copyGenerated = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    showToast({ title: 'Generated password copied', type: 'success' });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Generate a secure password locally in the browser, then copy it into the add-password form or use it wherever you need stronger credentials.
      </p>

      <div>
        <label className="text-sm font-medium">Length</label>
        <Input
          type="number"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Generated Password</label>
        <Input value={generatedPassword} readOnly placeholder="Click generate" className="mt-2" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" onClick={generatePassword}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate
        </Button>

        <Button type="button" variant="outline" onClick={copyGenerated} disabled={!generatedPassword}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
};

const AddPasswordForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { addPassword } = useDataStore();

  const [serviceName, setServiceName] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<PasswordCategory>('other');
  const [masterKey, setMasterKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!serviceName || !password || !masterKey) return;

    setSaving(true);
    try {
      await addPassword(
        {
          serviceName,
          serviceUrl: serviceUrl || undefined,
          username: username || undefined,
          password,
          category,
          strength: 'strong',
          lastChanged: Timestamp.now(),
        },
        masterKey,
      );

      showToast({
        title: 'Password added',
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
        <label className="text-sm font-medium">Service Name</label>
        <Input
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Google"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Service URL</label>
        <Input
          value={serviceUrl}
          onChange={(e) => setServiceUrl(e.target.value)}
          placeholder="https://google.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Username / Email</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PasswordCategory)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="social">Social</option>
          <option value="finance">Finance</option>
          <option value="work">Work</option>
          <option value="shopping">Shopping</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Master Key</label>
        <Input
          type="password"
          value={masterKey}
          onChange={(e) => setMasterKey(e.target.value)}
          placeholder="Enter your Arcora master key"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : 'Add Password'}
      </Button>
    </form>
  );
};

const PasswordMetricCard = ({
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
  const wave = getPasswordSparkline(values, 220, 50);

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

const PasswordCompactMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-sky-500/10 bg-sky-500/5 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{value}</p>
  </div>
);

const getPasswordSparkline = (values: number[], width: number, height: number) => {
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
