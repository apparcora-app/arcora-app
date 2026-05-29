// Auth Layout - For login/register pages
import { Link, Outlet } from 'react-router-dom';
import { GlobalAtmosphere } from '@/components/layout/GlobalAtmosphere';

export const AuthLayout = () => {
  return (
    <div className="arcora-app-shell relative min-h-screen overflow-hidden bg-background">
      {/* Light-mode gradient overlays (hidden in dark) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(251,252,255,0.22),rgba(238,241,255,0.84)_52%,rgba(219,234,254,0.48))] dark:hidden" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(217,221,243,0.34)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,221,243,0.28)_1px,transparent_1px)] bg-[size:120px_120px] dark:hidden" />

      {/* Dark-mode animated atmosphere background */}
      <div className="pointer-events-none fixed inset-0 z-[1] hidden dark:block">
        <GlobalAtmosphere theme="dark" />
      </div>

      {/* Semi-transparent dark overlay */}
      <div className="pointer-events-none fixed inset-0 z-[2] hidden dark:block arcora-atmosphere-overlay" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div>
            <Outlet />
          </div>

          <div className="arcora-glow-edge mt-6 rounded-2xl border border-[#d9ddf3] bg-white/90 px-4 py-3 shadow-[0_18px_45px_rgba(59,72,130,0.12)] backdrop-blur-2xl dark:border-border/70 dark:bg-card/70 dark:shadow-none">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#17164d]/75 dark:text-muted-foreground">
              <Link to="/privacy" className="transition-colors hover:text-primary dark:hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-primary dark:hover:text-foreground">
                Terms
              </Link>
              <Link to="/contact" className="transition-colors hover:text-primary dark:hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

