import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileStack,
  FileText,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Lock,
  Receipt,
  ShieldCheck,
  Tags,
  Search,
  Plus,
  Upload,
  Info,
  Activity,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import {
  ConnectedCubeField,
  MarketingReveal,
} from '@/components/marketing/MarketingAtmosphere';
import { marketingPages } from '@/components/marketing/marketingPages';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createFaqSchema,
  createOrganizationSchema,
  createSoftwareApplicationSchema,
  createWebSiteSchema,
} from '@/lib/seo';

const homeFaqs = [
  {
    question: 'How much does Arcora cost?',
    answer:
      'Arcora is completely free to start with our Basic plan, which includes full access to all 6 core dashboard modules. For advanced power users needing larger storage capacities, secure offline backups, and multi-member family sharing, we offer premium tier upgrades.',
  },
  {
    question: 'Is Arcora secure?',
    answer:
      'Yes, Arcora employs industry-leading bank-grade security. All personal records, documents, and credentials are protected by robust client-side AES-256 encryption, ensuring that only you hold the keys to view your household\'s sensitive data.',
  },
  {
    question: 'What features does Arcora offer for household management?',
    answer:
      'Arcora provides a secure life-admin ecosystem comprising 6 integrated modules: a recurring bill reminder tracker, an active subscription manager, a product warranty registry, an encrypted document vault, a secure password safe, and a smart reminder alert manager.',
  },
  {
    question: 'How is Arcora different from standard cloud storage or note apps?',
    answer:
      'Unlike general-purpose cloud storage, Arcora is custom-tailored for domestic operations. It connects your documents, due dates, billing cycles, and reminders directly together, giving you a structured and proactive review layer rather than static files.',
  },
];

const logoCloud = ['Bills', 'Subscriptions', 'Warranties', 'Documents', 'Passwords', 'Reminders'];

const solutionRows = [
  {
    title: 'Household admin gets scattered quickly',
    description:
      'Bills live in email, subscriptions renew in the background, warranties hide in folders, and important dates often depend on memory.',
  },
  {
    title: 'Arcora gives those records one organized home',
    description:
      'Keep bills, subscriptions, warranties, documents, passwords, reminders, and deadlines in a dedicated life admin dashboard.',
  },
  {
    title: 'Review what needs attention next',
    description:
      'Use one review layer to see what is due soon, what renews next, and which record supports the action before it becomes urgent.',
  },
];

const productSignals = [
  { label: 'Product category', value: 'Life admin' },
  { label: 'Core modules', value: '6' },
  { label: 'Review layer', value: 'Dashboard' },
];

const audienceRows = [
  {
    title: 'Busy households',
    description:
      'For people who want fewer places to check when bills, renewals, documents, and reminders start piling up.',
  },
  {
    title: 'Solo professionals',
    description:
      'For people managing personal admin alongside work, projects, clients, tools, subscriptions, and recurring obligations.',
  },
  {
    title: 'Family organizers',
    description:
      'For anyone who keeps track of shared records, product coverage, due dates, and the details others ask for later.',
  },
];

const featureOrbits = [
  { icon: Receipt, label: 'Bills', delay: 0, className: 'left-[8%] top-[28%] text-amber-600 bg-amber-100' },
  { icon: CreditCard, label: 'Subscriptions', delay: 0.45, className: 'left-[27%] top-[6%] text-violet-600 bg-violet-100' },
  { icon: BadgeCheck, label: 'Warranties', delay: 0.9, className: 'right-[18%] top-[8%] text-emerald-600 bg-emerald-100' },
  { icon: FileText, label: 'Documents', delay: 1.35, className: 'right-[7%] top-[36%] text-cyan-700 bg-cyan-100' },
  { icon: KeyRound, label: 'Passwords', delay: 1.8, className: 'bottom-[15%] right-[27%] text-rose-600 bg-rose-100' },
  { icon: BellRing, label: 'Reminders', delay: 2.25, className: 'bottom-[18%] left-[24%] text-orange-600 bg-orange-100' },
];

const previewPanels = [
  {
    icon: Receipt,
    title: 'Add the record',
    rows: ['Bill due date', 'Subscription renewal', 'Warranty expiration'],
  },
  {
    icon: Tags,
    title: 'Connect the context',
    rows: ['Notes and files', 'Reminder timing', 'Related details'],
  },
  {
    icon: FileStack,
    title: 'Review what is next',
    rows: ['Upcoming bills', 'Renewing subscriptions', 'Important dates'],
  },
];

const heroModules = [
  { icon: Receipt, label: 'Bills', detail: 'Due dates', tone: 'text-blue-600 bg-blue-50' },
  { icon: CreditCard, label: 'Subscriptions', detail: 'Renewals', tone: 'text-indigo-600 bg-indigo-50' },
  { icon: BadgeCheck, label: 'Warranties', detail: 'Coverage', tone: 'text-teal-600 bg-teal-50' },
  { icon: FileText, label: 'Documents', detail: 'Records', tone: 'text-cyan-700 bg-cyan-50' },
  { icon: KeyRound, label: 'Passwords', detail: 'Access', tone: 'text-violet-600 bg-violet-50' },
  { icon: BellRing, label: 'Reminders', detail: 'Next actions', tone: 'text-sky-600 bg-sky-50' },
];

const dashboardRows = [
  { label: 'Internet bill', meta: 'Due tomorrow', status: 'Statement attached' },
  { label: 'Home warranty', meta: 'Expires in 18 days', status: 'Receipt saved' },
  { label: 'Cloud storage plan', meta: 'Renews May 30', status: 'Review before charge' },
];

export const MarketingHomePage = () => {
  return (
    <>
      <SEOHead
        title="Secure Life Admin Dashboard for Household Records | Arcora"
        description="Arcora is a secure life admin dashboard for organizing bills, subscriptions, warranties, documents, passwords, reminders, deadlines, and household records."
        path="/"
        schemas={[
          createOrganizationSchema(),
          createWebSiteSchema(),
          createSoftwareApplicationSchema({
            description:
              'Arcora is a secure life admin dashboard for organizing bills, subscriptions, warranties, documents, passwords, reminders, deadlines, and household records.',
          }),
          createFaqSchema(homeFaqs),
        ]}
        breadcrumbs={[{ name: 'Arcora', path: '/' }]}
      />

      <MarketingLayout fullWidth>
        {/* Main Hero & Integrated Dashboard Panel */}
        <section className="arcora-hero-cinematic relative -mt-8 overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8">
            <div className="arcora-glass-panel relative overflow-hidden p-6 sm:p-10 lg:p-12 shadow-2xl border border-[#dbe4ff]/90 bg-white/70 backdrop-blur-2xl grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              
              {/* Left Column (Hero Content) */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="max-w-xl text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-50/70 px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur-xl">
                  <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                  All your life admin. One calm place.
                </div>
                <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[#111044] sm:text-5xl lg:text-[3.5rem]">
                  Your household in <span className="text-blue-600">one calm place</span>
                </h1>
                <p className="mt-6 text-base leading-7 text-[#475569] sm:text-lg">
                  Arcora brings bills, documents, warranties, subscriptions, passwords, and reminders into one secure, organized workspace, so the next deadline and the record behind it are always easy to review.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm transition-transform hover:-translate-y-0.5">
                    <Link to="/register">
                      Start your free account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full border-[#17164d]/15 bg-white text-[#17164d] px-8 hover:-translate-y-0.5 hover:bg-[#f8faff] hover:text-[#17164d] shadow-sm"
                  >
                    <Link to="/login" className="inline-flex items-center gap-2">
                      <span className="text-xs text-blue-600 font-bold">►</span> See how it works
                    </Link>
                  </Button>
                </div>

                <div className="mt-10 border-t border-[#e2e8f0] pt-8 space-y-4">
                  {[
                    { title: 'Bank-level security', desc: 'End-to-end data encryption and secure key architecture', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
                    { title: 'Backup & sync', desc: 'Secure cloud backups ensure your data stays current across devices', icon: BadgeCheck, color: 'text-blue-600 bg-blue-50' },
                    { title: 'Built for real life', desc: 'Clean, simple interface designed for calm household organization', icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
                  ].map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.title} className="flex gap-4 items-start">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feat.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#111044]">{feat.title}</h3>
                          <p className="mt-0.5 text-xs text-[#64748b] leading-5">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Right Column (In-Code simulated Dashboard) */}
              <motion.div
                initial={{ opacity: 0, y: 28, rotate: 1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="relative w-full max-w-[820px] lg:-mr-4"
              >
                <HeroSystemVisual />
              </motion.div>
            </div>
          </div>

          {/* Logo Cloud section */}
          <div className="relative mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#17164d]/60">
              Organize the everyday admin that keeps a household running
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#17164d]/70">
              {logoCloud.map((label) => (
                <div key={label} className="arcora-module-pill rounded-full px-6 py-2.5 shadow-sm text-xs">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lower Feature Grid (Phase 4 Refactor) */}
        <MarketingReveal as="section" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-[#e2e8f0]/40">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur-xl">
              Everything in its place
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-[#12114a] sm:text-4xl">
              Life admin made simple
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475569] max-w-2xl mx-auto">
              Arcora consolidates all the paperwork, reminders, due dates, and accounts that typically get scattered, letting you maintain a calm household rhythm.
            </p>
          </div>

          <div className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Bills & Finance', desc: 'Track utility due dates, insurance statements, payment schedules, and history in a centralized view.', icon: Receipt, slug: '/bill-reminder-app', color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300' },
              { title: 'Subscriptions', desc: 'Keep track of active streaming services, cancellation windows, billing cycles, and recurring costs.', icon: CreditCard, slug: '/subscription-tracker', color: 'text-violet-600 bg-violet-50 border-violet-100 hover:border-violet-300' },
              { title: 'Warranties', desc: 'Store appliance purchase dates, receipts, serial numbers, and check coverage before it expires.', icon: BadgeCheck, slug: '/warranty-tracker', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
              { title: 'Documents', desc: 'Organize statements, contract PDFs, and receipts with full text search and automatic date extraction.', icon: FileText, slug: '/personal-document-organizer', color: 'text-cyan-700 bg-cyan-50 border-cyan-100 hover:border-cyan-300' },
              { title: 'Passwords', desc: 'Manage account access records and recovery documents with user-scoped session encryption keys.', icon: KeyRound, slug: '/password-organizer', color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300' },
              { title: 'Reminders', desc: 'Set up custom schedules, priority tasks, and smart alerts for the home deadlines you cannot afford to miss.', icon: BellRing, slug: '/important-date-reminder-app', color: 'text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300' },
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link
                    to={card.slug}
                    className="arcora-premium-card group block rounded-2xl p-6 shadow-sm border bg-white/70 hover:bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.color} transition-all`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#17164d] dark:text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#52617f] leading-6 min-h-[72px]">
                      {card.desc}
                    </p>
                    <div className="mt-5 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700">
                      Explore Workflow
                      <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </MarketingReveal>

        {/* Outer section wrapper for secondary features & FAQs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <MarketingReveal as="section" className="mt-12" delay={0.04}>
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="arcora-section-kicker">
                How Arcora works
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#12114a] md:text-4xl">
                Add the record, connect the context, review what comes next.
              </h2>
              <p className="arcora-readable mt-4 text-sm leading-7 md:text-base">
                Arcora turns scattered home admin into a repeatable workflow for due dates,
                renewals, documents, password records, and reminders.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {previewPanels.map((panel) => (
                <PreviewPanel key={panel.title} {...panel} />
              ))}
            </div>
          </MarketingReveal>

          <MarketingReveal as="section" className="mt-20" delay={0.04}>
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="arcora-section-kicker">
                Who it is for
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#12114a] md:text-4xl">
                Built for people who manage the details behind everyday life.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {audienceRows.map((row) => (
                <div key={row.title} className="arcora-premium-card rounded-2xl bg-white/70 backdrop-blur p-5">
                  <h3 className="text-lg font-semibold text-[#17164d]">{row.title}</h3>
                  <p className="arcora-readable mt-3 text-sm leading-6">{row.description}</p>
                </div>
              ))}
            </div>
          </MarketingReveal>

          <MarketingReveal as="section" className="arcora-dark-cta mx-auto mt-20 max-w-6xl rounded-2xl px-6 py-12 text-center text-white shadow-[0_28px_80px_rgba(23,16,74,0.28)] sm:px-10" delay={0.04}>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/80">
                Ready to organize your life admin?
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-semibold leading-9 md:text-3xl">
                Start with the records and reminders you already manage, then use Arcora
                as the review layer that keeps them connected.
              </h2>
              <Button asChild className="mt-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-7">
                <Link to="/register">Start your free account</Link>
              </Button>
            </div>
          </MarketingReveal>

          <MarketingReveal as="section" className="mt-20" delay={0.04}>
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="arcora-section-kicker">
                Arcora workflows
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#12114a] md:text-4xl">
                Explore the core parts of a household admin system.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {marketingPages.map((page) => (
                <Link
                  key={page.slug}
                  to={page.slug}
                  className="arcora-premium-card group block rounded-2xl bg-white/70 backdrop-blur p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/75">
                    {page.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#17164d] dark:text-foreground">
                    {page.shortTitle}
                  </h3>
                  <p className="arcora-readable mt-3 text-sm leading-6">{page.metaDescription}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                    Explore workflow
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </MarketingReveal>

          <MarketingReveal as="section" className="mt-20" delay={0.04}>
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="arcora-section-kicker">
                Arcora FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#12114a] md:text-4xl">
                Clear answers about Arcora and life admin.
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {homeFaqs.map((faq) => (
                <div key={faq.question} className="arcora-premium-card rounded-2xl bg-white/70 backdrop-blur p-5">
                  <h3 className="text-base font-semibold text-[#17164d]">{faq.question}</h3>
                  <p className="arcora-readable mt-3 text-sm leading-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          </MarketingReveal>
        </div>
      </MarketingLayout>
    </>
  );
};const HeroSystemVisual = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const tabs = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      iconWrapClassName: 'bg-blue-500/12 dark:bg-blue-500/10',
      iconClassName: 'text-blue-600 dark:text-blue-400',
      activeWrapClassName: 'bg-blue-500/18 dark:bg-blue-500/15',
      activeIconClassName: 'text-blue-700 dark:text-blue-300',
      activeRailClassName: 'bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.85)]',
    },
    {
      name: 'Bills & Finance',
      icon: Receipt,
      iconWrapClassName: 'bg-amber-500/12 dark:bg-amber-500/10',
      iconClassName: 'text-amber-600 dark:text-amber-300',
      activeWrapClassName: 'bg-amber-500/18 dark:bg-amber-500/15',
      activeIconClassName: 'text-amber-700 dark:text-amber-200',
      activeRailClassName: 'bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.8)]',
    },
    {
      name: 'Subscriptions',
      icon: CreditCard,
      iconWrapClassName: 'bg-purple-500/12 dark:bg-purple-500/10',
      iconClassName: 'text-purple-600 dark:text-purple-400',
      activeWrapClassName: 'bg-purple-500/18 dark:bg-purple-500/15',
      activeIconClassName: 'text-purple-700 dark:text-purple-300',
      activeRailClassName: 'bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.8)]',
    },
    {
      name: 'Warranties',
      icon: ShieldCheck,
      iconWrapClassName: 'bg-emerald-500/12 dark:bg-emerald-500/10',
      iconClassName: 'text-emerald-600 dark:text-emerald-300',
      activeWrapClassName: 'bg-emerald-500/18 dark:bg-emerald-500/15',
      activeIconClassName: 'text-emerald-700 dark:text-emerald-200',
      activeRailClassName: 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.82)]',
    },
    {
      name: 'Documents',
      icon: FileText,
      iconWrapClassName: 'bg-sky-500/12 dark:bg-sky-500/10',
      iconClassName: 'text-sky-600 dark:text-sky-300',
      activeWrapClassName: 'bg-sky-500/18 dark:bg-sky-500/15',
      activeIconClassName: 'text-sky-700 dark:text-sky-200',
      activeRailClassName: 'bg-sky-500 shadow-[0_0_14px_rgba(14,165,233,0.82)]',
    },
    {
      name: 'Passwords',
      icon: Lock,
      iconWrapClassName: 'bg-rose-500/12 dark:bg-rose-500/10',
      iconClassName: 'text-rose-600 dark:text-rose-300',
      activeWrapClassName: 'bg-rose-500/18 dark:bg-rose-500/15',
      activeIconClassName: 'text-rose-700 dark:text-rose-200',
      activeRailClassName: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.78)]',
    },
    {
      name: 'Reminders',
      icon: Bell,
      iconWrapClassName: 'bg-orange-500/12 dark:bg-orange-500/10',
      iconClassName: 'text-orange-600 dark:text-orange-400',
      activeWrapClassName: 'bg-orange-500/18 dark:bg-orange-500/15',
      activeIconClassName: 'text-orange-700 dark:text-orange-300',
      activeRailClassName: 'bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.78)]',
    },
    {
      name: 'Others',
      icon: FolderKanban,
      iconWrapClassName: 'bg-fuchsia-500/12 dark:bg-fuchsia-500/10',
      iconClassName: 'text-fuchsia-600 dark:text-fuchsia-300',
      activeWrapClassName: 'bg-fuchsia-500/18 dark:bg-fuchsia-500/15',
      activeIconClassName: 'text-fuchsia-700 dark:text-fuchsia-200',
      activeRailClassName: 'bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.78)]',
    },
  ];

  return (
    <div className="relative rounded-[2rem] border border-blue-100/60 bg-white/40 p-2 shadow-2xl backdrop-blur-xl">
      <div className="rounded-2xl border border-white/80 bg-white/95 shadow-md overflow-hidden">
        {/* Browser Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-md border border-slate-200/50 bg-white px-6 py-0.5 text-[10px] font-medium text-slate-400 w-44 sm:w-64 truncate text-center shadow-inner font-mono">
            app.usearcora.com/{activeTab === 'Dashboard' ? 'dashboard' : activeTab.toLowerCase().replace(' & ', '-')}
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-blue-600 shadow-sm">
            LIVE WORKSPACE
          </span>
        </div>

        <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[188px_1fr] min-h-[490px]">
          {/* Sidebar Navigation */}
          <aside className="border-r border-[#d9ddf3]/50 bg-[#f8faff]/40 p-2 sm:p-3 flex flex-col justify-between">
            <div>
              <div className="flex h-12 items-center gap-2.5 px-2 border-b border-[#d9ddf3]/40 mb-4">
                <div className="h-7 w-7 rounded-lg bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] flex items-center justify-center text-white text-xs font-black shadow-[0_6px_12px_rgba(37,99,235,0.18)]">
                  A
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <span className="block text-xs font-bold text-slate-800 tracking-tight">Arcora</span>
                  <span className="block text-[8px] text-slate-400 font-semibold mt-0.5">Secure life admin</span>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.name;
                  return (
                    <button
                      key={tab.name}
                      type="button"
                      onClick={() => setActiveTab(tab.name)}
                      className={cn(
                        "group relative w-full flex items-center justify-center sm:justify-start gap-2.5 rounded-lg px-2 sm:px-2.5 py-2 text-xs font-bold transition-all duration-200 border overflow-hidden",
                        isActive
                          ? "bg-white/80 text-slate-900 border-[#dfe4f4] shadow-[0_0_24px_rgba(59,72,130,0.06),0_10px_30px_rgba(59,72,130,0.08)]"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#eef1ff]/70 hover:border-primary/25"
                      )}
                    >
                      {isActive && (
                        <span
                          className={cn(
                            'absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-r-full',
                            tab.activeRailClassName || 'bg-primary shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                          )}
                        />
                      )}

                      <div
                        className={cn(
                          'flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200',
                          isActive
                            ? tab.activeWrapClassName || 'bg-primary/15'
                            : tab.iconWrapClassName || 'bg-transparent group-hover:bg-slate-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 transition-all duration-200 group-hover:scale-110',
                            isActive
                              ? tab.activeIconClassName || 'text-primary'
                              : tab.iconClassName || 'opacity-90 group-hover:opacity-100'
                          )}
                        />
                      </div>
                      <span className="hidden sm:inline tracking-tight font-semibold text-[11px]">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
                       
          </aside>
          {/* Simulated Workspace Content */}
          <main className="p-4 sm:p-5 overflow-x-hidden overflow-y-auto max-h-[500px] text-left bg-slate-50/20 relative">
            
            {/* Active Tab: Dashboard */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Dashboard'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a secure life admin dashboard?</h3>
                <p>A secure life admin dashboard is a centralized digital workspace for organizing household records, recurring deadlines, and critical documents in one place. Arcora simplifies personal administration by bringing scattered notifications, files, and credentials into a single structured overview.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Comprehensive status metrics showing total due and active plans</li>
                  <li>Smart visual analytics representing recent bill trends</li>
                  <li>One-click quick actions to add records, upload files, or set alerts</li>
                </ul>
              </div>

              {/* Inner Content Navigation Header */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-3 py-2 mb-4 shadow-[0_2px_12px_rgba(59,72,130,0.015)] rounded-xl">
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="font-extrabold text-xs text-[#111044]">Dashboard</span>
                  <span className="hidden md:inline text-slate-400 font-bold hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
                  <span className="hidden md:inline text-slate-400 font-bold hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
                  <span className="hidden md:inline text-slate-400 font-bold hover:text-blue-600 cursor-pointer transition-colors">Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative hidden lg:block">
                    <Search className="absolute left-2 top-1.5 h-2.5 w-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bills..."
                      className="h-6 w-32 rounded-full border border-slate-200 bg-slate-50/50 pl-7 pr-3 text-[9px] focus:outline-none font-semibold text-slate-700"
                      readOnly
                    />
                  </div>
                  {/* Install App */}
                  <button type="button" className="hidden sm:flex items-center gap-1 bg-[#2563eb] hover:bg-blue-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm transition-colors">
                    <Plus className="h-2.5 w-2.5" /> Install App
                  </button>
                  {/* Sun Theme Toggle */}
                  <button type="button" className="h-5 w-5 rounded hover:bg-slate-50 flex items-center justify-center text-amber-500 transition-colors">
                    <Sun className="h-3 w-3" />
                  </button>
                  {/* Notification Bell */}
                  <button type="button" className="h-5 w-5 rounded hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                    <Bell className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Subtitle Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4">
                <div>
                  <h2 className="text-sm font-black text-[#111044] leading-none">Dashboard</h2>
                  <p className="text-[9px] text-slate-400 mt-1 font-semibold">Welcome back. Here is your secure life-admin overview.</p>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" className="rounded border border-slate-200 bg-white hover:bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-700 flex items-center gap-0.5 transition-colors">
                    <Receipt className="h-2.5 w-2.5 text-slate-500" /> Add Bill
                  </button>
                  <button type="button" className="rounded border border-slate-200 bg-white hover:bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-700 flex items-center gap-0.5 transition-colors">
                    <Upload className="h-2.5 w-2.5 text-slate-500" /> Upload
                  </button>
                  <button type="button" className="rounded border border-slate-200 bg-white hover:bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-700 flex items-center gap-0.5 transition-colors">
                    <Bell className="h-2.5 w-2.5 text-slate-500" /> Reminder
                  </button>
                </div>
              </div>

              {/* 3 Premium Solid Colored Gradient KPI Cards - Highly spacious & legible */}
              <div className="grid grid-cols-3 gap-2.5 mb-4.5">
                {/* Card 1: Total Due (Blue) */}
                <div className="relative rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-3 text-white overflow-hidden shadow-[0_6px_14px_rgba(37,99,235,0.1)] group transition-all duration-300 hover:-translate-y-0.5 shrink-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="h-6 w-6 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="rounded-full bg-white/20 border border-white/5 px-1.5 py-0.2 text-[8px] font-extrabold text-white backdrop-blur-md whitespace-nowrap scale-90">
                      2 due
                    </span>
                  </div>
                  <div className="mt-3.5 relative z-10 text-left">
                    <p className="text-[14px] sm:text-[15px] font-black leading-none whitespace-nowrap">$142.50</p>
                    <p className="text-[9px] text-white/80 font-bold mt-1 uppercase tracking-wide whitespace-nowrap">Total Due</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 w-full opacity-20 select-none pointer-events-none">
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,15 Q25,5 50,15 T100,5 L100,20 L0,20 Z" fill="rgba(255,255,255,0.25)" />
                    </svg>
                  </div>
                </div>

                {/* Card 2: Monthly Subscriptions (Teal) */}
                <div className="relative rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-3 text-white overflow-hidden shadow-[0_6px_14px_rgba(13,148,136,0.1)] group transition-all duration-300 hover:-translate-y-0.5 shrink-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="h-6 w-6 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                      <CreditCard className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="rounded-full bg-white/20 border border-white/5 px-1.5 py-0.2 text-[8px] font-extrabold text-white backdrop-blur-md whitespace-nowrap scale-90">
                      8 active
                    </span>
                  </div>
                  <div className="mt-3.5 relative z-10 text-left">
                    <p className="text-[14px] sm:text-[15px] font-black leading-none whitespace-nowrap">$89.90</p>
                    <p className="text-[9px] text-white/80 font-bold mt-1 uppercase tracking-wide whitespace-nowrap">Subscriptions</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 w-full opacity-20 select-none pointer-events-none">
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,10 Q30,18 60,8 T100,12 L100,20 L0,20 Z" fill="rgba(255,255,255,0.25)" />
                    </svg>
                  </div>
                </div>

                {/* Card 3: Security Score (Purple) */}
                <div className="relative rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-3 text-white overflow-hidden shadow-[0_6px_14px_rgba(124,58,237,0.1)] group transition-all duration-300 hover:-translate-y-0.5 shrink-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="h-6 w-6 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="rounded-full bg-white/20 border border-white/5 px-1.5 py-0.2 text-[8px] font-extrabold text-white backdrop-blur-md whitespace-nowrap scale-90">
                      Healthy
                    </span>
                  </div>
                  <div className="mt-3.5 relative z-10 text-left">
                    <p className="text-[14px] sm:text-[15px] font-black leading-none whitespace-nowrap">100/100</p>
                    <p className="text-[9px] text-white/80 font-bold mt-1 uppercase tracking-wide whitespace-nowrap">Security Score</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 w-full opacity-20 select-none pointer-events-none">
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,15 Q20,5 60,12 T100,8 L100,20 L0,20 Z" fill="rgba(255,255,255,0.25)" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2-Column Visual Trailer Grid - Spacious and 100% legible */}
              <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2">
                {/* Left Column: Activity Chart Panel */}
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-black text-[#111044] tracking-tight">Activity</h3>
                      <div className="flex items-center gap-2 text-[8px] font-extrabold text-slate-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Due</span>
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Watch</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold">Bill movement by month</p>

                    {/* CSS Bar Chart */}
                    <div className="flex items-end justify-between h-24 px-1 mt-4 mb-2">
                      {[
                        { month: 'Jun', blue: 12, yellow: 18 },
                        { month: 'Feb', blue: 25, yellow: 22 },
                        { month: 'Mar', blue: 38, yellow: 30 },
                        { month: 'Apr', blue: 82, yellow: 60 },
                        { month: 'May', blue: 20, yellow: 15 },
                        { month: 'Jun', blue: 30, yellow: 22 }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                          <div className="flex items-end gap-1 h-16 w-full justify-center">
                            <div className="w-1.5 bg-blue-500 rounded-t-full shadow-sm" style={{ height: `${bar.blue}%` }} />
                            <div className="w-1.5 bg-amber-400 rounded-t-full shadow-sm" style={{ height: `${bar.yellow}%` }} />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 mt-1">{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Due Date Flow Banner */}
                  <div className="rounded-lg bg-[#1d4ed8] hover:bg-blue-800 text-white p-2 flex items-center justify-between text-[10px] font-black shadow-sm cursor-pointer group transition-colors mt-2">
                    <span>Due Date Flow</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Right Column: Efficiency & Quick Admin Combo Panel */}
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                      <div className="text-left">
                        <h3 className="text-xs font-black text-[#111044] tracking-tight">System Health</h3>
                        <p className="text-[8.5px] text-slate-400 font-semibold mt-0.5">Automations & active metrics</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 mb-3.5">
                      <div className="text-left">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Efficiency</span>
                        <span className="block text-[11px] font-black text-slate-800 mt-0.5">Calm score: 89</span>
                      </div>
                      {/* Compact Circular SVG Donut */}
                      <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <path className="text-slate-100" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-[#38bdf8]" stroke="currentColor" strokeWidth="4" strokeDasharray="89, 100" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-slate-800">89</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Admin Action Row */}
                  <div className="space-y-1.5 border-t border-slate-50 pt-3">
                    <div className="flex items-center justify-between text-[8px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">
                      <span>Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button type="button" className="flex items-center justify-center gap-0.5 bg-[#2563eb] hover:bg-blue-700 text-white text-[8px] font-black py-1.5 rounded shadow-sm transition-colors">
                        <Plus className="h-2 w-2" /> Bill
                      </button>
                      <button type="button" className="flex items-center justify-center gap-0.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[8px] font-black py-1.5 rounded bg-white transition-colors">
                        <Upload className="h-2 w-2 text-slate-500" /> Upload
                      </button>
                      <button type="button" className="flex items-center justify-center gap-0.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[8px] font-black py-1.5 rounded bg-white transition-colors">
                        <Bell className="h-2 w-2 text-slate-500" /> Alert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Tab: Bills & Finance */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Bills & Finance'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a bill reminder app?</h3>
                <p>A bill reminder app is a secure financial organizer that tracks recurring utility bills, statements, and household due dates. Arcora ensures your bills are always paid on time by linking payment deadlines directly to the supporting invoices in one dashboard.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Outstanding utility bill tracking with automatic due-date alerts</li>
                  <li>Secure storage for statement history and digital receipts</li>
                  <li>Payment status labels for pending, auto-paid, and scheduled bills</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600">BILLS & FINANCE</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Recurring Obligations</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 flex items-center gap-1.5 shadow-sm">
                    3 Unpaid Bills
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-600 uppercase whitespace-nowrap truncate block w-full">Outstanding</span>
                  <p className="text-sm sm:text-base font-extrabold text-amber-700 mt-1 truncate">$322.50</p>
                  <p className="text-[8px] sm:text-[9px] text-amber-500 mt-0.5 truncate w-full">3 unpaid bills</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase whitespace-nowrap truncate block w-full">Paid This Month</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 truncate">$1,450.00</p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5 truncate w-full">8 bills cleared</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase whitespace-nowrap truncate block w-full">Next Due</span>
                  <p className="text-sm sm:text-base font-extrabold text-blue-700 mt-1 truncate">June 1</p>
                  <p className="text-[8px] sm:text-[9px] text-blue-500 mt-0.5 truncate w-full">Electricity bill</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracked Bills</h3>
                  <button type="button" className="text-[9px] font-bold text-blue-600 hover:underline">+ Add Bill</button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Electricity Utility Bill', due: 'Due June 1 (in 3 days)', amount: '$142.50', status: 'Pending', statusColor: 'border-rose-100 bg-rose-50 text-rose-700' },
                    { title: 'Water Utility', due: 'Due June 5 (in 7 days)', amount: '$80.00', status: 'Auto-Pay', statusColor: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
                    { title: 'Internet & Cable Combo', due: 'Due June 8 (in 10 days)', amount: '$100.00', status: 'Scheduled', statusColor: 'border-blue-100 bg-blue-50 text-blue-700' },
                    { title: 'Municipal Gas Service', due: 'Paid May 24', amount: '$75.00', status: 'Paid', statusColor: 'border-slate-100 bg-slate-50 text-slate-500' }
                  ].map((bill, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                          <Receipt className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{bill.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{bill.due}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-800">{bill.amount}</p>
                        <span className={cn("inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border mt-0.5", bill.statusColor)}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Subscriptions */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Subscriptions'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a subscription tracker?</h3>
                <p>A subscription tracker is a dedicated tool to manage recurring plans, streaming services, and contract cancellation cycles. Arcora maps out your monthly software and service commitments to help you identify unused accounts and optimize household spending.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Comprehensive billing cycle timelines and renewal dates</li>
                  <li>Projected annual expenses and detailed price break-downs</li>
                  <li>Instant cancellation alerts to prevent unwanted auto-renewals</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-purple-600">SUBSCRIPTIONS</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Recurring Services</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-purple-50 border border-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700 flex items-center gap-1.5 shadow-sm">
                    8 Active Plans
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-purple-600 uppercase whitespace-nowrap truncate block w-full">Monthly Spend</span>
                  <p className="text-sm sm:text-base font-extrabold text-purple-700 mt-1 truncate">$89.90</p>
                  <p className="text-[8px] sm:text-[9px] text-purple-500 mt-0.5 truncate w-full">8 active plans</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase whitespace-nowrap truncate block w-full">Annual Cost</span>
                  <p className="text-sm sm:text-base font-extrabold text-indigo-700 mt-1 truncate">$1,078.80</p>
                  <p className="text-[8px] sm:text-[9px] text-indigo-500 mt-0.5 truncate w-full">Projected</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase whitespace-nowrap truncate block w-full">Savings Found</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 truncate">$35.00/mo</p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5 truncate w-full">2 cancelled plans</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Plans</h3>
                  <span className="rounded-lg bg-purple-100 px-2.5 py-0.5 text-[9px] font-bold text-purple-700">Auto-Renewing</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Netflix Premium (4K)', cost: '$22.99/mo', renew: 'Renews June 4 (in 6 days)', color: 'text-purple-600 bg-purple-500/10' },
                    { title: 'Spotify Family Plan', cost: '$16.99/mo', renew: 'Renews June 12 (in 14 days)', color: 'text-green-600 bg-green-500/10' },
                    { title: 'Adobe Creative Cloud', cost: '$54.99/mo', renew: 'Renews June 19 (in 21 days)', color: 'text-red-600 bg-red-500/10' },
                    { title: 'Amazon Prime Video', cost: '$14.99/mo', renew: 'Renews June 28 (in 30 days)', color: 'text-blue-600 bg-blue-500/10' }
                  ].map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-7 w-7 rounded flex items-center justify-center shrink-0", sub.color)}>
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{sub.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{sub.renew}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-800">{sub.cost}</p>
                        <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border border-purple-100 bg-purple-50 text-purple-700 mt-0.5">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Warranties */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Warranties'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a warranty tracker?</h3>
                <p>A warranty tracker is a secure digital registry designed to log product purchase dates, serial numbers, and coverage expiration periods. Arcora helps households protect their investments by keeping warranties organized and searchable before claim deadlines pass.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Digital receipt storage and simplified serial number logging</li>
                  <li>Automated email alerts for upcoming warranty expirations</li>
                  <li>Step-by-step history tracking for product repairs and replacements</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">WARRANTIES</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Product Protection</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 flex items-center gap-1.5 shadow-sm">
                    18 Tracked Items
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase whitespace-nowrap truncate block w-full">Tracked Items</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 truncate">18 Items</p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5 truncate w-full">Receipts saved</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-600 uppercase whitespace-nowrap truncate block w-full">Expiring Soon</span>
                  <p className="text-sm sm:text-base font-extrabold text-amber-700 mt-1 truncate">3 Warranties</p>
                  <p className="text-[8px] sm:text-[9px] text-amber-500 mt-0.5 truncate w-full">Within 3 months</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase whitespace-nowrap truncate block w-full">Claims Filed</span>
                  <p className="text-sm sm:text-base font-extrabold text-blue-700 mt-1 truncate">1 Approved</p>
                  <p className="text-[8px] sm:text-[9px] text-blue-500 mt-0.5 truncate w-full">Full refund received</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coverage Registry</h3>
                  <button type="button" className="text-[9px] font-bold text-blue-600 hover:underline">Scan Receipt</button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Panasonic Microwave Oven', brand: 'Panasonic • Purchased May 2024', expiry: 'Expires June 10 (in 12 days)', status: 'Receipt Saved', color: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
                    { title: 'iPhone 15 Pro Max', brand: 'Apple • Purchased Sept 2023', expiry: 'Expires Sept 22, 2025', status: 'AppleCare+', color: 'border-sky-100 bg-sky-50 text-sky-700' },
                    { title: 'Bosch 800 Series Dishwasher', brand: 'Bosch • Purchased Jan 2025', expiry: 'Expires Jan 15, 2028', status: 'Registered', color: 'border-blue-100 bg-blue-50 text-blue-700' },
                    { title: 'Steelcase Gesture Chair', brand: 'Steelcase • Purchased Dec 2021', expiry: 'Expires Dec 31, 2033', status: '12y Warranty', color: 'border-purple-100 bg-purple-50 text-purple-700' }
                  ].map((war, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{war.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{war.brand}</p>
                          <p className="text-[9px] text-amber-600 font-semibold mt-0.5">{war.expiry}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn("inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border", war.color)}>
                          {war.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Documents */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Documents'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a personal document organizer?</h3>
                <p>A personal document organizer is an encrypted file vault for digitizing and categorizing important household records. Arcora secures your contract agreements, leases, tax returns, and medical statements in folders protected by advanced user-scoped encryption keys.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Advanced folder structures for passports, leases, taxes, and medical files</li>
                  <li>High-density text search with instant tag-based categorization</li>
                  <li>End-to-end file encryption ensuring absolute document privacy</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-sky-600">DOCUMENTS</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Secure Document Vault</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-sky-50 border border-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 flex items-center gap-1.5 shadow-sm">
                    42 Records Stored
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-sky-600 uppercase whitespace-nowrap truncate block w-full">Total Files</span>
                  <p className="text-sm sm:text-base font-extrabold text-sky-700 mt-1 truncate">42 Records</p>
                  <p className="text-[8px] sm:text-[9px] text-sky-500 mt-0.5 truncate w-full">Encrypted at rest</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase whitespace-nowrap truncate block w-full">Storage</span>
                  <p className="text-sm sm:text-base font-extrabold text-blue-700 mt-1 truncate">18% Used</p>
                  <p className="text-[8px] sm:text-[9px] text-blue-500 mt-0.5 truncate w-full">90 MB of 500 MB</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase whitespace-nowrap truncate block w-full">Categories</span>
                  <p className="text-sm sm:text-base font-extrabold text-indigo-700 mt-1 truncate">6 Folders</p>
                  <p className="text-[8px] sm:text-[9px] text-indigo-500 mt-0.5 truncate w-full">Organized vault</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vault Folders</h3>
                  <button type="button" className="text-[9px] font-bold text-blue-600 hover:underline">Upload PDF</button>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {[
                    { folder: 'Passports & IDs', count: '4 items', update: 'Jan 2026' },
                    { folder: 'Rental Lease & Home', count: '6 items', update: 'Mar 2026' },
                    { folder: 'Health & Insurance', count: '12 items', update: 'May 2026' },
                    { folder: 'Tax Returns & Receipts', count: '15 items', update: 'Feb 2026' }
                  ].map((fol, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50/50 transition-colors text-xs flex flex-col justify-between bg-slate-50/10 hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded bg-sky-500/10 flex items-center justify-center text-sky-600">
                          <FileText className="h-4 w-4" />
                        </span>
                        <p className="font-bold text-[#111044] truncate">{fol.folder}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400 font-semibold">
                        <span>{fol.count}</span>
                        <span>Updated {fol.update}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Passwords */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Passwords'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a household password organizer?</h3>
                <p>A household password organizer is a secure credentials safe that manages private access keys and local account details. Arcora protects your home Wi-Fi codes, landlord portals, and utility accounts using client-side AES-256 encryption.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>User-scoped local session encryption keys for absolute safety</li>
                  <li>Real-time password strength diagnostics and audit tools</li>
                  <li>Multi-member credentials vault with zero-knowledge security</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-rose-600">PASSWORDS</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Encrypted Credential Safe</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700 flex items-center gap-1.5 shadow-sm">
                    AES-256 Lock
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-rose-600 uppercase whitespace-nowrap truncate block w-full">Strength</span>
                  <p className="text-sm sm:text-base font-extrabold text-rose-700 mt-1 truncate">94% Excellent</p>
                  <p className="text-[8px] sm:text-[9px] text-rose-500 mt-0.5 truncate w-full">High entropy keys</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase whitespace-nowrap truncate block w-full">Reused Keys</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 truncate">0 Reused</p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5 truncate w-full">Zero security risk</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase whitespace-nowrap truncate block w-full">Total Logins</span>
                  <p className="text-sm sm:text-base font-extrabold text-blue-700 mt-1 truncate">128 Entries</p>
                  <p className="text-[8px] sm:text-[9px] text-blue-500 mt-0.5 truncate w-full">Secure entries</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vault Logins</h3>
                  <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">Encrypted</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Home Wi-Fi Network', user: 'SSID: Arcora_5G_Secure', time: 'Last changed 1 day ago' },
                    { title: 'Landlord Rent Portal', user: 'reach@email.com', time: 'Last changed 3 months ago' },
                    { title: 'Electric Utility Portal', user: 'reach@email.com', time: 'Last changed 6 months ago' }
                  ].map((pass, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                          <Lock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{pass.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{pass.user}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{pass.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[9px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 hover:bg-rose-100/50 cursor-pointer transition-colors font-mono">
                          ••••••••
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Reminders */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Reminders'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is an important date reminder app?</h3>
                <p>An important date reminder app is a smart scheduling assistant for custom tasks, maintenance cycles, and life events. Arcora automates recurrent alerts for home maintenance, medical checkups, and licensing deadlines to keep your life on track.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Customized recurrence intervals for filters, cars, and licenses</li>
                  <li>High-priority indicator badges and dynamic list styling</li>
                  <li>Unified notification systems that alert you before deadlines arrive</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-orange-600">REMINDERS</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Tasks & Deadlines</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700 flex items-center gap-1.5 shadow-sm">
                    2 Due Today
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-orange-600 uppercase whitespace-nowrap truncate block w-full">Due in 24h</span>
                  <p className="text-sm sm:text-base font-extrabold text-orange-700 mt-1 truncate">2 Reminders</p>
                  <p className="text-[8px] sm:text-[9px] text-orange-500 mt-0.5 truncate w-full">Immediate action</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-600 uppercase whitespace-nowrap truncate block w-full">Active Schedule</span>
                  <p className="text-sm sm:text-base font-extrabold text-amber-700 mt-1 truncate">14 Tracked</p>
                  <p className="text-[8px] sm:text-[9px] text-amber-500 mt-0.5 truncate w-full">Recurring alerts</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase whitespace-nowrap truncate block w-full">Completed</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 truncate">4 Cleared</p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-500 mt-0.5 truncate w-full">On time</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Alerts</h3>
                  <button type="button" className="text-[9px] font-bold text-blue-600 hover:underline">+ New Alert</button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Replace HVAC Home Air Filters', frequency: 'Every 3 months', due: 'Due tomorrow', priority: 'High Priority', color: 'border-rose-100 bg-rose-50 text-rose-700' },
                    { title: 'Schedule Bi-Annual Dental Cleanings', frequency: 'Every 6 months', due: 'Due in 7 days', priority: 'Routine', color: 'border-amber-100 bg-amber-50 text-amber-700' },
                    { title: 'Car Routine Maintenance & Oil Change', frequency: 'Every 10,000 miles', due: 'Due in 14 days', priority: 'Planned', color: 'border-blue-100 bg-blue-50 text-blue-700' },
                    { title: 'Renew Local Driver License', frequency: 'Every 5 years', due: 'Due in 30 days', priority: 'Critical', color: 'border-rose-100 bg-rose-50 text-rose-700' }
                  ].map((rem, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                          <Bell className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{rem.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{rem.frequency} • {rem.due}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn("inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border", rem.color)}>
                          {rem.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Tab: Others */}
            <div
              className={cn(
                "w-full transition-opacity duration-300 ease-in-out",
                activeTab === 'Others'
                  ? "opacity-100 relative z-10"
                  : "opacity-0 pointer-events-none absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 z-0"
              )}
            >
              {/* Semantic GEO Definition Block */}
              <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-xl p-3 mb-4 text-[10px] text-slate-600 leading-relaxed shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-xs mb-1">What is a household project and checklist organizer?</h3>
                <p>A household project and checklist organizer is a collaborative planner for managing family tasks, vacation lists, and home improvement plans. Arcora enables smooth household coordination by keeping shopping lists and projects organized in one shared registry.</p>
                <ul className="list-disc pl-4 mt-2 space-y-0.5 font-semibold text-slate-500">
                  <li>Real-time family checklists for grocery shopping and travel prep</li>
                  <li>Milestones and task trackers for major household repairs</li>
                  <li>Secure multi-member collaboration with simple read-write access</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-fuchsia-600">OTHERS</p>
                  <h2 className="text-lg font-black text-[#111044] mt-0.5">Household Lists & Projects</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-1 text-[10px] font-bold text-fuchsia-700 flex items-center gap-1.5 shadow-sm">
                    3 Active Checklists
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-fuchsia-600 uppercase whitespace-nowrap truncate block w-full">Shared Lists</span>
                  <p className="text-sm sm:text-base font-extrabold text-fuchsia-700 mt-1 truncate">3 Lists</p>
                  <p className="text-[8px] sm:text-[9px] text-fuchsia-500 mt-0.5 truncate w-full">Family accessible</p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-purple-600 uppercase whitespace-nowrap truncate block w-full">Active Projects</span>
                  <p className="text-sm sm:text-base font-extrabold text-purple-700 mt-1 truncate">4 Projects</p>
                  <p className="text-[8px] sm:text-[9px] text-purple-500 mt-0.5 truncate w-full">Household related</p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 hover:shadow transition-shadow">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase whitespace-nowrap truncate block w-full">Collaborators</span>
                  <p className="text-sm sm:text-base font-extrabold text-indigo-700 mt-1 truncate">2 Members</p>
                  <p className="text-[8px] sm:text-[9px] text-indigo-500 mt-0.5 truncate w-full">Full access</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Household Projects</h3>
                  <button type="button" className="text-[9px] font-bold text-blue-600 hover:underline">+ New List</button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Weekly Grocery Shopping List', desc: '12 items pending • Shared with partner', status: 'In Progress', color: 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700' },
                    { title: 'Living Room Remodel Plan', desc: '4 milestones • Design approved', status: 'Active', color: 'border-purple-100 bg-purple-50 text-purple-700' },
                    { title: 'Summer Trip Packing Registry', desc: '28 essential items • Draft checklist', status: 'Draft', color: 'border-slate-100 bg-slate-50 text-slate-500' }
                  ].map((oth, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-slate-100/75 rounded-lg p-2.5 hover:bg-slate-50/40 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-600 shrink-0">
                          <FolderKanban className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-[#111044]">{oth.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{oth.desc}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn("inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border", oth.color)}>
                          {oth.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

const PreviewPanel = ({
  icon: Icon,
  title,
  rows,
}: {
  icon: LucideIcon;
  title: string;
  rows: string[];
}) => (
  <div className="arcora-premium-card rounded-2xl bg-white/70 backdrop-blur p-5 text-left">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-[#17164d]">{title}</h3>
    </div>
    <div className="mt-5 space-y-3">
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between rounded-xl border border-[#dfe4f4] bg-white/50 px-4 py-3 text-sm">
          <span className="font-semibold text-[#17164d]">{row}</span>
          <ShieldCheck className="h-4 w-4 text-teal-600" />
        </div>
      ))}
    </div>
  </div>
);
