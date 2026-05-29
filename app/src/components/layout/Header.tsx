import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  Check,
  X,
  Download,
  Menu,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, formatRelativeTime } from '@/lib/utils';
import { showToast } from '@/lib/notifications';
import { useIsMobile } from '@/hooks/use-mobile';

const isStandaloneDisplayMode = () => {
  const browserMode =
    window.matchMedia?.('(display-mode: browser)').matches === true;

  if (browserMode) {
    return false;
  }

  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches === true ||
    window.matchMedia?.('(display-mode: fullscreen)').matches === true ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
  );
};

export const Header = () => {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const notificationsOpen = useUIStore((state) => state.notificationsOpen);
  const setNotificationsOpen = useUIStore((state) => state.setNotificationsOpen);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  const notifications = useDataStore((state) => state.notifications);
  const markNotificationAsRead = useDataStore((state) => state.markNotificationAsRead);
  const clearAllNotifications = useDataStore((state) => state.clearAllNotifications);
  const isMobile = useIsMobile();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.deferredInstallPrompt ?? null,
  );
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplayMode());

  const unreadCount = notifications.filter((n) => !n.read).length;
  const legalLinks = [
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
    { to: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    const checkInstalledState = () => {
      setIsInstalled(isStandaloneDisplayMode());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setInstallPrompt(promptEvent);
      window.deferredInstallPrompt = promptEvent;
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      window.deferredInstallPrompt = undefined;
      checkInstalledState();
      showToast({
        title: 'Arcora installed',
        description: 'You can now launch Arcora from your home screen or desktop.',
        type: 'success',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    const displayModeQueries = [
      '(display-mode: browser)',
      '(display-mode: standalone)',
      '(display-mode: minimal-ui)',
      '(display-mode: fullscreen)',
      '(display-mode: window-controls-overlay)',
    ]
      .map((query) => window.matchMedia?.(query))
      .filter((mediaQuery): mediaQuery is MediaQueryList => Boolean(mediaQuery));

    displayModeQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener?.('change', checkInstalledState);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayModeQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener?.('change', checkInstalledState);
      });
    };
  }, []);

  const handleClearAll = async () => {
    await clearAllNotifications();
    showToast({
      title: 'Notifications cleared',
      type: 'success',
    });
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleInstallClick = async () => {
    const promptEvent = window.deferredInstallPrompt || installPrompt;

    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      window.deferredInstallPrompt = undefined;
      setInstallPrompt(null);

      if (outcome === 'accepted') {
        setIsInstalled(isStandaloneDisplayMode());
        return;
      }

      showToast({
        title: 'Install canceled',
        description: 'You can install Arcora later from the browser menu whenever you are ready.',
        type: 'info',
      });
      return;
    }

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);

    if (isIOS) {
      showToast({
        title: 'Install Arcora',
        description: 'On iPhone/iPad, tap Share and then Add to Home Screen.',
        type: 'info',
      });
      return;
    }

    if (isAndroidChrome) {
      showToast({
        title: 'Install Arcora',
        description:
          'In Chrome, open the browser menu and tap Install app or Add to Home screen.',
        type: 'info',
      });
      return;
    }

    showToast({
      title: 'Install Arcora',
      description: 'Use your browser menu to install or create a shortcut for Arcora on this device.',
      type: 'info',
    });
  };

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 right-0 z-40 flex h-16 items-center justify-between px-4 transition-all duration-300 sm:px-6',
          'border-b border-[#d9ddf3]/80 bg-[rgba(248,250,255,0.92)] shadow-[0_18px_50px_rgba(59,72,130,0.10)] backdrop-blur-2xl',
          'dark:border-border/60 dark:bg-slate-950/65 dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]'
        )}
        initial={false}
        animate={{
          left: isMobile ? '0rem' : sidebarOpen ? '16rem' : '5rem',
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSidebar}
              className="h-10 w-10 rounded-2xl border border-[#dfe4f4] bg-white/70 hover:border-primary/30 hover:bg-[#eef1ff]/70 dark:border-border/50 dark:bg-card/60 dark:hover:bg-muted/60"
            >
              <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </Button>
          )}
          <h1 className="text-base font-semibold tracking-tight md:text-lg lg:text-xl">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="hidden items-center gap-1.5 lg:flex">
            {legalLinks.map((link) => (
              <Button
                key={link.to}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 rounded-2xl border px-3 text-sm font-medium transition-all duration-200',
                  location.pathname === link.to
                    ? 'border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.10)]'
                    : 'border-transparent text-[#17164d]/60 hover:border-primary/25 hover:bg-white/70 hover:text-[#17164d] dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-foreground'
                )}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'hidden h-11 min-w-[220px] items-center gap-3 md:flex lg:min-w-[260px] 2xl:min-w-[340px]',
              'rounded-2xl border border-[#dfe4f4] bg-white/75 px-4 text-left backdrop-blur-xl dark:border-border/70 dark:bg-card/70',
              'text-[#586174] hover:bg-[#eef1ff]/70 hover:text-[#17164d] dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-foreground',
              'transition-all duration-200 hover:border-primary/35 hover:shadow-[0_0_24px_hsl(var(--primary)/0.10)]'
            )}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-sm">Search bills, documents, reminders...</span>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="relative rounded-2xl border border-[#dfe4f4] bg-white/70 hover:border-primary/30 hover:bg-[#eef1ff]/70 dark:border-border/50 dark:bg-card/60 dark:hover:bg-muted/60 md:hidden"
          >
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Button>

          {!isInstalled && (
            <Button
              type="button"
              onClick={handleInstallClick}
              className="h-10 gap-2 rounded-2xl bg-primary px-3 text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.18)] hover:bg-primary/90 sm:px-4"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative rounded-2xl border border-transparent hover:border-primary/30 hover:bg-white/70 dark:hover:bg-muted/60"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-violet-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-2xl border border-transparent hover:border-primary/30 hover:bg-white/70 dark:hover:bg-muted/60"
              >
                <Bell className="w-5 h-5 text-orange-500 dark:text-orange-300" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 rounded-[1.35rem] border-[#d9ddf3]/80 bg-white/95 p-2 shadow-[0_24px_70px_rgba(59,72,130,0.16)] backdrop-blur-2xl dark:border-border/70 dark:bg-slate-950/95 dark:shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-auto rounded-full px-2 py-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                  className={cn(
                    'flex cursor-pointer flex-col items-start gap-1 rounded-2xl p-3',
                    !notification.read && 'bg-primary/5'
                  )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            !notification.read && 'text-primary'
                          )}
                        >
                          {notification.title}
                        </span>

                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>

                      <span className="text-xs text-muted-foreground/60">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-[1.5rem] border-[#d9ddf3]/80 bg-white/95 p-0 shadow-[0_28px_90px_rgba(59,72,130,0.18)] backdrop-blur-2xl dark:border-border/70 dark:bg-slate-950/95 dark:shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
          <DialogHeader className="border-b border-[#dfe4f4]/80 p-4 dark:border-border/50">
            <DialogTitle className="sr-only">Search</DialogTitle>

            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4f4] bg-[rgba(238,241,255,0.55)] px-4 py-3 dark:border-border/70 dark:bg-muted/40">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search bills, subscriptions, documents, reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-base placeholder:text-muted-foreground/50 focus-visible:ring-0"
                autoFocus
              />
              <kbd className="hidden rounded-full border border-[#dfe4f4] bg-white/80 px-2 py-1 text-xs dark:border-border/60 dark:bg-background/80 sm:inline-flex">
                ESC
              </kbd>
            </div>
          </DialogHeader>

          <div className="p-4">
            <SearchResults query={searchQuery} onClose={() => setSearchOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const getPageTitle = (path: string) => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/bills': 'Bills & Finance',
    '/subscriptions': 'Subscriptions',
    '/warranties': 'Warranties',
    '/documents': 'Documents',
    '/passwords': 'Passwords',
    '/reminders': 'Reminders',
    '/others': 'Others',
    '/settings': 'Settings',
  };
  return titles[path] || 'Arcora';
};

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const bills = useDataStore((state) => state.bills);
  const subscriptions = useDataStore((state) => state.subscriptions);
  const warranties = useDataStore((state) => state.warranties);
  const documents = useDataStore((state) => state.documents);
  const reminders = useDataStore((state) => state.reminders);

  const results = useMemo(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const lowerQuery = trimmedQuery.toLowerCase();

    return [
      ...bills
        .filter((b) => b.title.toLowerCase().includes(lowerQuery))
        .map((b) => ({ type: 'bill' as const, item: b, title: b.title })),
      ...subscriptions
        .filter((s) => s.name.toLowerCase().includes(lowerQuery))
        .map((s) => ({ type: 'subscription' as const, item: s, title: s.name })),
      ...warranties
        .filter((w) => w.productName.toLowerCase().includes(lowerQuery))
        .map((w) => ({ type: 'warranty' as const, item: w, title: w.productName })),
      ...documents
        .filter((d) => d.title.toLowerCase().includes(lowerQuery) || d.fileName.toLowerCase().includes(lowerQuery))
        .map((d) => ({ type: 'document' as const, item: d, title: d.title })),
      ...reminders
        .filter((r) => r.title.toLowerCase().includes(lowerQuery))
        .map((r) => ({ type: 'reminder' as const, item: r, title: r.title })),
    ].slice(0, 10);
  }, [bills, documents, query, reminders, subscriptions, warranties]);

  const getSearchResultRoute = (type: (typeof results)[number]['type']) => {
    const routes = {
      bill: '/bills',
      subscription: '/subscriptions',
      warranty: '/warranties',
      document: '/documents',
      reminder: '/reminders',
    } satisfies Record<(typeof results)[number]['type'], string>;

    return routes[type];
  };

  if (!query.trim()) {
    return (
      <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/25 py-8 text-center text-muted-foreground">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/10">
          <Command className="h-5 w-5 text-primary" />
        </div>
        <p className="font-medium text-foreground">Start typing to search Arcora</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['bills', 'subscriptions', 'documents', 'reminders', 'others'].map((item) => (
            <span
              key={item}
              className="rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-xs capitalize"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/25 py-8 text-center text-muted-foreground">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-border/70 bg-card/70">
          <X className="h-5 w-5 text-slate-400" />
        </div>
        <p className="font-medium text-foreground">No results found</p>
        <p className="mt-1 text-sm">Nothing matched &quot;{query}&quot;.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {results.length} result{results.length !== 1 ? 's' : ''}
      </p>

      {results.map((result, index) => (
        <motion.div
          key={`${result.type}-${result.item.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            to={getSearchResultRoute(result.type)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border/55 bg-muted/25 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/60"
            onClick={onClose}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Check className="w-4 h-4 text-primary" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{result.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
