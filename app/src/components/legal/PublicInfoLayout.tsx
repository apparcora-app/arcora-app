import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectedCubeField } from '@/components/marketing/MarketingAtmosphere';
import { cn } from '@/lib/utils';
import arcoraLogo from '@/assets/branding/arcora-logo.png';

type PublicInfoLayoutProps = {
  badge: string;
  title: string;
  description: string;
  asideTitle: string;
  asideDescription: string;
  asideMeta?: ReactNode;
  children: ReactNode;
};

export const PublicInfoLayout = ({
  badge,
  title,
  description,
  asideTitle,
  asideDescription,
  asideMeta,
  children,
}: PublicInfoLayoutProps) => {
  const location = useLocation();
  const legalLinks = [
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent text-[#17164d]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.06),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(20,184,166,0.05),transparent_34%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[1.5rem] border border-[#d9ddf3]/80 bg-white/95 p-3 shadow-[0_20px_50px_rgba(59,72,130,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-[#10175f] shadow-[0_16px_32px_rgba(16,23,95,0.20)] ring-1 ring-white/80">
                <img
                  src={arcoraLogo}
                  alt="Arcora logo"
                  className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.35)]"
                />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-[#17164d]">Arcora</p>
                <p className="text-xs text-slate-500">Secure life admin</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {legalLinks.map((link) => (
                <Button
                  key={link.to}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 rounded-2xl border px-3 text-sm font-medium transition-all duration-200',
                    location.pathname === link.to
                      ? 'border-[#111044]/30 bg-[#111044]/10 text-[#111044] shadow-[0_0_24px_rgba(17,16,68,0.08)]'
                      : 'border-transparent text-[#17164d]/60 hover:border-primary/25 hover:bg-white/70 hover:text-[#17164d]'
                  )}
                >
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="hidden rounded-2xl border border-[#dfe4f4] bg-white/70 px-4 py-2 text-right backdrop-blur-sm md:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
                Public information
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Policy and support details for Arcora users
              </p>
            </div>
            <Button asChild variant="outline" className="h-10 rounded-2xl">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to homepage
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 py-5 lg:py-6">
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <section className="relative rounded-[2rem] border border-[#d9ddf3]/80 bg-white/95 p-5 shadow-[0_20px_50px_rgba(59,72,130,0.08)] lg:p-7">
              <ConnectedCubeField density="section" className="opacity-20" />
              <div className="relative z-10">
                <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                  {badge}
                </Badge>
                <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-[#17164d] md:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                  {description}
                </p>

                <div className="mt-8 space-y-4">{children}</div>
              </div>
            </section>

            <aside className="rounded-[1.5rem] border border-[#d9ddf3]/80 bg-white/95 p-5 shadow-[0_20px_50px_rgba(59,72,130,0.06)] lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Page focus
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[#17164d]">{asideTitle}</h2>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{asideDescription}</p>

              <div className="mt-5 rounded-[1.35rem] border border-[#dfe4f4] bg-[#f8faff] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#17164d]">Need help fast?</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Use the contact page for support, privacy questions, deletion requests, or product feedback.
                    </p>
                  </div>
                </div>
              </div>

              {asideMeta ? <div className="mt-5">{asideMeta}</div> : null}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};
