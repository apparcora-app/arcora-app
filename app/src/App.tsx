import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import { useReminderEngine } from '@/hooks/useReminders';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { marketingPageMap } from '@/components/marketing/marketingPages';
import { trackPageView } from '@/lib/analytics';
import { localClassifier } from '@/services/localClassifier';

import arcoraLogo from './assets/branding/arcora-logo.png';

const loadAuthLayout = () => import('@/components/layout/AuthLayout');
const loadMainLayout = () => import('@/components/layout/MainLayout');
const loadLoginPage = () => import('@/components/auth/LoginPage');
const loadRegisterPage = () => import('@/components/auth/RegisterPage');
const loadForgotPasswordPage = () => import('@/components/auth/ForgotPasswordPage');
const loadPrivacyPage = () => import('@/components/legal/PrivacyPage');
const loadTermsPage = () => import('@/components/legal/TermsPage');
const loadContactPage = () => import('@/components/legal/ContactPage');
const loadAboutPage = () => import('@/components/marketing/AboutPage');
const loadMarketingFeaturePage = () => import('@/components/marketing/MarketingFeaturePage');
const loadMarketingHomePage = () => import('@/components/marketing/MarketingHomePage');
const loadMarketingRootLayout = () => import('@/components/marketing/MarketingRootLayout');
const loadSecurityPage = () => import('@/components/marketing/SecurityPage');
const loadDashboard = () => import('@/components/dashboard/Dashboard');
const loadBillsPage = () => import('@/components/bills/BillsPage');
const loadSubscriptionsPage = () => import('@/components/subscriptions/SubscriptionsPage');
const loadWarrantiesPage = () => import('@/components/warranties/WarrantiesPage');
const loadDocumentsPage = () => import('@/components/documents/DocumentsPage');
const loadPasswordsPage = () => import('@/components/passwords/PasswordsPage');
const loadRemindersPage = () => import('@/components/reminders/RemindersPage');
const loadOthersPage = () => import('@/components/others/OthersPage');
const loadSettingsPage = () => import('@/components/settings/SettingsPage');

const AuthLayout = lazy(() =>
  loadAuthLayout().then((module) => ({ default: module.AuthLayout })),
);
const MainLayout = lazy(() =>
  loadMainLayout().then((module) => ({ default: module.MainLayout })),
);
const LoginPage = lazy(() =>
  loadLoginPage().then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  loadRegisterPage().then((module) => ({ default: module.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  loadForgotPasswordPage().then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const PrivacyPage = lazy(() =>
  loadPrivacyPage().then((module) => ({ default: module.PrivacyPage })),
);
const TermsPage = lazy(() =>
  loadTermsPage().then((module) => ({ default: module.TermsPage })),
);
const ContactPage = lazy(() =>
  loadContactPage().then((module) => ({ default: module.ContactPage })),
);
const AboutPage = lazy(() =>
  loadAboutPage().then((module) => ({ default: module.AboutPage })),
);
const MarketingFeaturePage = lazy(() =>
  loadMarketingFeaturePage().then((module) => ({
    default: module.MarketingFeaturePage,
  })),
);
const MarketingHomePage = lazy(() =>
  loadMarketingHomePage().then((module) => ({
    default: module.MarketingHomePage,
  })),
);
const MarketingRootLayout = lazy(() =>
  loadMarketingRootLayout().then((module) => ({
    default: module.MarketingRootLayout,
  })),
);
const SecurityPage = lazy(() =>
  loadSecurityPage().then((module) => ({ default: module.SecurityPage })),
);
const Dashboard = lazy(() =>
  loadDashboard().then((module) => ({ default: module.Dashboard })),
);
const BillsPage = lazy(() =>
  loadBillsPage().then((module) => ({ default: module.BillsPage })),
);
const SubscriptionsPage = lazy(() =>
  loadSubscriptionsPage().then((module) => ({
    default: module.SubscriptionsPage,
  })),
);
const WarrantiesPage = lazy(() =>
  loadWarrantiesPage().then((module) => ({
    default: module.WarrantiesPage,
  })),
);
const DocumentsPage = lazy(() =>
  loadDocumentsPage().then((module) => ({
    default: module.DocumentsPage,
  })),
);
const PasswordsPage = lazy(() =>
  loadPasswordsPage().then((module) => ({
    default: module.PasswordsPage,
  })),
);
const RemindersPage = lazy(() =>
  loadRemindersPage().then((module) => ({
    default: module.RemindersPage,
  })),
);
const OthersPage = lazy(() =>
  loadOthersPage().then((module) => ({ default: module.OthersPage })),
);
const SettingsPage = lazy(() =>
  loadSettingsPage().then((module) => ({ default: module.SettingsPage })),
);

const warmRouteChunks = (loaders: Array<() => Promise<unknown>>) => {
  let cancelled = false;
  const queue = [...loaders];
  const idleIds = new Set<number>();
  const timeoutIds = new Set<ReturnType<typeof globalThis.setTimeout>>();

  const scheduleNextBatch = () => {
    if (cancelled || queue.length === 0) return;

    const warm = () => {
      if (cancelled) return;

      const batch = queue.splice(0, 2);
      void Promise.allSettled(batch.map((loader) => loader())).finally(scheduleNextBatch);
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warm, { timeout: 1800 });
      idleIds.add(idleId);
      return;
    }

    const timeoutId = globalThis.setTimeout(warm, 450);
    timeoutIds.add(timeoutId);
  };

  scheduleNextBatch();

  return () => {
    cancelled = true;
    idleIds.forEach((idleId) => window.cancelIdleCallback?.(idleId));
    timeoutIds.forEach((timeoutId) => globalThis.clearTimeout(timeoutId));
  };
};

const AppLoadingScreen = ({ message = 'Loading Arcora...' }: { message?: string }) => (
  <div className="arcora-app-shell relative min-h-screen overflow-hidden bg-background">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(251,252,255,0.22),rgba(238,241,255,0.84)_52%,rgba(219,234,254,0.48))] dark:hidden" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(217,221,243,0.42)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,221,243,0.34)_1px,transparent_1px)] bg-[size:128px_128px] dark:hidden" />
    <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div className="flex min-w-64 flex-col items-center gap-5 rounded-[2rem] border border-[#d9ddf3] bg-white/[0.88] px-8 py-9 text-center shadow-[0_30px_90px_rgba(59,72,130,0.18)] backdrop-blur-xl dark:border-border/70 dark:bg-card/70 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[1.75rem] border border-sky-200/80 bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] shadow-[0_22px_48px_rgba(37,99,235,0.30)] ring-1 ring-white/70 dark:h-44 dark:w-44 dark:border-transparent dark:bg-transparent dark:bg-none dark:shadow-none dark:ring-0">
          <img
            src={arcoraLogo}
            alt="Arcora logo"
            className="arcora-logo h-[8.2rem] w-[8.2rem] scale-125 object-contain opacity-100 drop-shadow-[0_14px_24px_rgba(8,15,33,0.30)] dark:h-40 dark:w-auto dark:scale-100 dark:drop-shadow-none"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/75 dark:text-primary/80">
            Secure life admin
          </p>
          <motion.p
            animate={{ opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-2 max-w-xs text-balance text-base font-semibold text-[#17164d] dark:text-slate-100 sm:max-w-sm sm:text-lg"
          >
            {message}
          </motion.p>
        </div>
      </div>
    </div>
  </div>
);

const AppRuntimeEffects = () => {
  useReminderEngine();
  usePushNotifications();

  return null;
};

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userId = useAuthStore((state) => state.user?.uid);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const subscribeToData = useDataStore((state) => state.subscribeToData);
  const resetData = useDataStore((state) => state.resetData);
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      resetData();
      return;
    }

    const unsubscribe = subscribeToData();
    return unsubscribe;
  }, [isAuthenticated, resetData, subscribeToData, userId]);

  // Preload the SmartDetection AI (ModernBERT/WebGPU) in the background once the
  // user is authenticated. Uses requestIdleCallback so it only starts when the
  // browser has nothing else to do — zero impact on initial page load.
  useEffect(() => {
    if (!isAuthenticated) return;

    const start = () => localClassifier.preload();

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }

    // Fallback for browsers without requestIdleCallback (Safari < 16)
    const id = setTimeout(start, 3000);
    return () => clearTimeout(id);
  }, [isAuthenticated]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme === 'light' ? 'light' : 'dark');
  }, [theme]);

  useEffect(() => {
    if (isLoading) return;

    return warmRouteChunks(
      isAuthenticated
        ? [
            loadMainLayout,
            loadDashboard,
            loadBillsPage,
            loadDocumentsPage,
            loadRemindersPage,
          ]
        : [
            loadAuthLayout,
            loadLoginPage,
            loadRegisterPage,
            loadForgotPasswordPage,
            loadMarketingRootLayout,
            loadMarketingHomePage,
            loadMarketingFeaturePage,
            loadPrivacyPage,
            loadTermsPage,
            loadContactPage,
            loadAboutPage,
            loadSecurityPage,
          ],
    );
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <AppRuntimeEffects />

      <BrowserRouter>
        <AnalyticsTracker />
        <Suspense fallback={<AppLoadingScreen message="Loading your workspace..." />}>
          <Routes>
            <Route element={<MarketingRootLayout />}>
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/bill-reminder-app" element={<MarketingFeaturePage page={marketingPageMap['/bill-reminder-app']} />} />
              <Route path="/subscription-tracker" element={<MarketingFeaturePage page={marketingPageMap['/subscription-tracker']} />} />
              <Route path="/warranty-tracker" element={<MarketingFeaturePage page={marketingPageMap['/warranty-tracker']} />} />
              <Route path="/personal-document-organizer" element={<MarketingFeaturePage page={marketingPageMap['/personal-document-organizer']} />} />
              <Route path="/important-date-reminder-app" element={<MarketingFeaturePage page={marketingPageMap['/important-date-reminder-app']} />} />
              <Route path="/password-organizer" element={<MarketingFeaturePage page={marketingPageMap['/password-organizer']} />} />
              <Route path="/household-management-app" element={<MarketingFeaturePage page={marketingPageMap['/household-management-app']} />} />
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <MarketingHomePage />}
              />
            </Route>

            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/register"
                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/forgot-password"
                element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />}
              />
            </Route>

            <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bills" element={<BillsPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/warranties" element={<WarrantiesPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/passwords" element={<PasswordsPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/others" element={<OthersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Marketing pages are now wrapped in the MarketingRootLayout block above */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </>
  );
}

export default App;
