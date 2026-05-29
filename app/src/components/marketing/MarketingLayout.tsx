import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Mail, Menu, ShieldCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectedCubeField } from '@/components/marketing/MarketingAtmosphere';
import { marketingPages } from '@/components/marketing/marketingPages';
import arcoraLogo from '@/assets/branding/arcora-logo.png';

type MarketingLayoutProps = {
  badge?: string;
  title?: string;
  description?: string;
  fullWidth?: boolean;
  children: ReactNode;
};

const mainNavLinks = [
  { to: '/bill-reminder-app', label: 'Bills' },
  { to: '/subscription-tracker', label: 'Subscriptions' },
  { to: '/warranty-tracker', label: 'Warranties' },
  { to: '/personal-document-organizer', label: 'Documents' },
  { to: '/important-date-reminder-app', label: 'Reminders' },
  { to: '/password-organizer', label: 'Passwords' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const footerGroups = [
  {
    title: 'Product',
    links: [
      { to: '/bill-reminder-app', label: 'Bills' },
      { to: '/subscription-tracker', label: 'Subscriptions' },
      { to: '/warranty-tracker', label: 'Warranties' },
      { to: '/personal-document-organizer', label: 'Documents' },
      { to: '/password-organizer', label: 'Passwords' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/security', label: 'Security' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/important-date-reminder-app', label: 'Reminders' },
      { to: '/household-management-app', label: 'Home admin' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
];

const productLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap',
    isActive
      ? 'bg-[#111044] text-white shadow-sm'
      : 'text-[#17164d]/75 hover:bg-white hover:text-[#111044] hover:shadow-[0_4px_12px_rgba(59,72,130,0.05)]',
  ].join(' ');

const mobileLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-[#111044] text-white shadow-[0_12px_24px_rgba(17,16,68,0.16)]'
      : 'text-[#17164d]/72 hover:bg-white hover:text-[#17164d]',
  ].join(' ');

export const MarketingLayout = ({
  badge,
  title,
  description,
  fullWidth = false,
  children,
}: MarketingLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="arcora-marketing-shell relative min-h-screen overflow-x-hidden text-[#17164d]">
      <div className="relative z-20 bg-[#0f172a] px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-white shadow-sm">
        <span>🚀 Just launched: Arcora brings bills, documents, warranties, subscriptions, passwords, and reminders together. </span>
        <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 ml-1 inline-flex items-center gap-0.5 hover:underline">
          Get started <span className="text-[10px] sm:text-xs">→</span>
        </Link>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#d9ddf3]/90 bg-white/78 shadow-[0_18px_52px_rgba(59,72,130,0.12)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex shrink-0 items-center gap-3"
              aria-label="Arcora homepage"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-[#10175f] shadow-[0_16px_32px_rgba(16,23,95,0.22)] ring-1 ring-white/80">
                <img
                  src={arcoraLogo}
                  alt="Arcora logo"
                  className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.35)]"
                />
              </div>
              <div className="shrink-0">
                <p className="text-xl font-semibold tracking-tight text-[#17164d] whitespace-nowrap">Arcora</p>
                <p className="text-xs font-medium leading-4 text-slate-500 whitespace-nowrap">Secure life admin</p>
              </div>
            </Link>

            <div className="hidden items-center justify-center gap-2 xl:gap-3 2xl:gap-5 xl:flex">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={productLinkClassName}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <Button asChild variant="ghost" className="rounded-full px-4 font-semibold text-[#17164d] hover:bg-white hover:text-[#111044]">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm transition-transform hover:-translate-y-0.5">
                <Link to="/register">
                  Start your free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 xl:hidden">
              <Button asChild className="hidden rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 shadow-sm sm:inline-flex">
                <Link to="/register" onClick={closeMobileMenu}>
                  Start your free account
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-2xl border-[#d9ddf3] bg-white text-[#17164d] hover:bg-[#eef1ff]"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-3 rounded-3xl border border-[#d9ddf3] bg-white/[0.96] p-4 shadow-[0_24px_60px_rgba(59,72,130,0.18)] backdrop-blur-2xl xl:hidden max-h-[75vh] overflow-y-auto">
              <div className="grid gap-1">
                <NavLink
                  to="/"
                  end
                  onClick={closeMobileMenu}
                  className={mobileLinkClassName}
                >
                  Home
                </NavLink>
                {mainNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={mobileLinkClassName}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="my-3 h-px bg-[#e3e7f4]" />

              <div className="grid gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-[#17164d]/75 hover:bg-[#eef1ff] hover:text-[#17164d]"
                >
                  Sign in
                </Link>
                <Button asChild className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white min-h-11">
                  <Link to="/register" onClick={closeMobileMenu}>
                    Start your free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className={`relative z-10 ${fullWidth ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}`}>
        {(badge || title || description) && (
          <section className="arcora-page-hero mx-auto max-w-7xl p-6 px-4 py-8 sm:px-6 lg:px-8 lg:p-7">
            <ConnectedCubeField density="section" className="opacity-[0.35]" />
            <div className="relative z-10">
            {badge ? (
              <Badge className="rounded-full border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
                {badge}
              </Badge>
            ) : null}
            {title ? (
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-[#17164d] md:text-5xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="arcora-readable mt-4 max-w-3xl text-sm leading-7 md:text-base">
                {description}
              </p>
            ) : null}
            </div>
          </section>
        )}

        <div className={badge || title || description ? 'mt-6' : ''}>{children}</div>
      </main>

      <footer className="relative z-10 mt-16 border-t border-[#e2e5f3] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-[#10175f] shadow-[0_16px_32px_rgba(16,23,95,0.18)] ring-1 ring-white/80">
                  <img
                    src={arcoraLogo}
                    alt="Arcora logo"
                    className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.35)]"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#17164d]">Arcora</p>
                  <p className="text-sm text-slate-500">Secure life admin</p>
                </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                Keep bills, documents, renewals, warranties, passwords, and reminders easier to trust.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-[#17164d]">{group.title}</h3>
                  <div className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <Link key={link.to} to={link.to} className="block text-sm text-slate-600 hover:text-blue-600 hover:underline">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#17164d]">Built for calm household review</p>
                <p className="text-sm text-slate-600">Privacy, reminders, and records in one place.</p>
              </div>
            </div>

            <div className="w-full max-w-sm">
              <div className="rounded-[1.35rem] border border-[#dfe4f4] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#17164d]">
                      Need help or have a privacy question?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Contact Arcora for support, product feedback, account requests, or privacy questions.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 rounded-full border-slate-300 hover:bg-slate-50 text-slate-700">
                  <Link to="/contact">Contact Arcora</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>Arcora, secure life admin.</p>
            <p>Copyright (c) 2026 Arcora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
