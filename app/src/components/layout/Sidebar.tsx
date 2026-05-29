import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  ShieldCheck,
  FileText,
  Lock,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import arcoraLogo from '../../assets/branding/arcora-logo.png';

const navItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    iconWrapClassName: 'bg-blue-500/12 dark:bg-blue-500/10',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    activeWrapClassName: 'bg-blue-500/18 dark:bg-blue-500/15',
    activeIconClassName: 'text-blue-700 dark:text-blue-300',
    activeRailClassName: 'bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.85)]',
  },
  {
    path: '/bills',
    icon: Receipt,
    label: 'Bills & Finance',
    iconWrapClassName: 'bg-amber-500/12 dark:bg-amber-500/10',
    iconClassName: 'text-amber-600 dark:text-amber-300',
    activeWrapClassName: 'bg-amber-500/18 dark:bg-amber-500/15',
    activeIconClassName: 'text-amber-700 dark:text-amber-200',
    activeRailClassName: 'bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.8)]',
  },
  {
    path: '/subscriptions',
    icon: CreditCard,
    label: 'Subscriptions',
    iconWrapClassName: 'bg-purple-500/12 dark:bg-purple-500/10',
    iconClassName: 'text-purple-600 dark:text-purple-400',
    activeWrapClassName: 'bg-purple-500/18 dark:bg-purple-500/15',
    activeIconClassName: 'text-purple-700 dark:text-purple-300',
    activeRailClassName: 'bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.8)]',
  },
  {
    path: '/warranties',
    icon: ShieldCheck,
    label: 'Warranties',
    iconWrapClassName: 'bg-emerald-500/12 dark:bg-emerald-500/10',
    iconClassName: 'text-emerald-600 dark:text-emerald-300',
    activeWrapClassName: 'bg-emerald-500/18 dark:bg-emerald-500/15',
    activeIconClassName: 'text-emerald-700 dark:text-emerald-200',
    activeRailClassName: 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.82)]',
  },
  {
    path: '/documents',
    icon: FileText,
    label: 'Documents',
    iconWrapClassName: 'bg-sky-500/12 dark:bg-sky-500/10',
    iconClassName: 'text-sky-600 dark:text-sky-300',
    activeWrapClassName: 'bg-sky-500/18 dark:bg-sky-500/15',
    activeIconClassName: 'text-sky-700 dark:text-sky-200',
    activeRailClassName: 'bg-sky-500 shadow-[0_0_14px_rgba(14,165,233,0.82)]',
  },
  {
    path: '/passwords',
    icon: Lock,
    label: 'Passwords',
    iconWrapClassName: 'bg-rose-500/12 dark:bg-rose-500/10',
    iconClassName: 'text-rose-600 dark:text-rose-300',
    activeWrapClassName: 'bg-rose-500/18 dark:bg-rose-500/15',
    activeIconClassName: 'text-rose-700 dark:text-rose-200',
    activeRailClassName: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.78)]',
  },
  {
    path: '/reminders',
    icon: Bell,
    label: 'Reminders',
    iconWrapClassName: 'bg-orange-500/12 dark:bg-orange-500/10',
    iconClassName: 'text-orange-600 dark:text-orange-400',
    activeWrapClassName: 'bg-orange-500/18 dark:bg-orange-500/15',
    activeIconClassName: 'text-orange-700 dark:text-orange-300',
    activeRailClassName: 'bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.78)]',
  },
  {
    path: '/others',
    icon: FolderKanban,
    label: 'Others',
    iconWrapClassName: 'bg-fuchsia-500/12 dark:bg-fuchsia-500/10',
    iconClassName: 'text-fuchsia-600 dark:text-fuchsia-300',
    activeWrapClassName: 'bg-fuchsia-500/18 dark:bg-fuchsia-500/15',
    activeIconClassName: 'text-fuchsia-700 dark:text-fuchsia-200',
    activeRailClassName: 'bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.78)]',
  },
];

const bottomItems = [
  {
    path: '/settings',
    icon: Settings,
    label: 'Settings',
    iconWrapClassName: 'bg-slate-500/12 dark:bg-slate-500/10',
    iconClassName: 'text-slate-700 dark:text-slate-300',
    activeWrapClassName: 'bg-slate-500/18 dark:bg-slate-500/15',
    activeIconClassName: 'text-slate-900 dark:text-slate-200',
    activeRailClassName: 'bg-slate-500 shadow-[0_0_14px_rgba(100,116,139,0.72)]',
  },
];

export const Sidebar = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const theme = useUIStore((state) => state.theme);
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile, setMobileSidebarOpen]);

  const isLightMode = theme === 'light';

  const sidebarBody = (
    <>
      <div className="flex h-16 items-center justify-between overflow-hidden border-b border-[#d9ddf3]/80 bg-[#f8faff]/75 px-4 backdrop-blur-2xl dark:border-border/60 dark:bg-slate-950/30">
        <NavLink
          to="/dashboard"
          className={cn(
            'flex items-center min-w-0 flex-1 overflow-hidden',
            sidebarOpen || isMobile ? 'gap-3' : 'gap-0'
          )}
        >
          {isLightMode ? (
            <div className="h-14 w-14 rounded-lg bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[0_16px_34px_rgba(37,99,235,0.22)] ring-1 ring-sky-200/70">
              <img
                src={arcoraLogo}
                alt="Arcora logo"
                className="h-[3.15rem] w-[3.15rem] object-contain select-none pointer-events-none [filter:drop-shadow(0_10px_18px_rgba(8,15,33,0.22))_contrast(1.08)_saturate(1.08)]"
                draggable={false}
              />
            </div>
          ) : (
            <div className="h-14 w-14 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={arcoraLogo}
                alt="Arcora logo"
                className="h-[3.25rem] w-[3.25rem] object-contain select-none pointer-events-none"
                draggable={false}
              />
            </div>
          )}

          <AnimatePresence initial={false}>
            {(sidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.16 }}
                className="min-w-0 overflow-hidden"
              >
                <span className="block font-semibold text-lg tracking-tight whitespace-nowrap text-foreground leading-none">
                  Arcora
                </span>
                <span className="block text-[11px] text-muted-foreground whitespace-nowrap mt-1">
                  Secure life admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-2 flex-shrink-0 rounded-2xl border border-transparent hover:border-primary/30 hover:bg-white/75 dark:hover:bg-muted/60"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      <nav className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-2 py-4">
        {navItems.map((item, index) => (
          <NavItem
            key={item.path}
            {...item}
            isOpen={isMobile ? true : sidebarOpen}
            index={index}
            currentPath={location.pathname}
            onNavigate={() => isMobile && setMobileSidebarOpen(false)}
          />
        ))}
      </nav>

      <div className="space-y-2 border-t border-border/60 px-2 py-4">
        {bottomItems.map((item, index) => (
          <NavItem
            key={item.path}
            {...item}
            isOpen={isMobile ? true : sidebarOpen}
            index={index + navItems.length}
            currentPath={location.pathname}
            onNavigate={() => isMobile && setMobileSidebarOpen(false)}
          />
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-transparent',
                'text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20',
                'transition-all duration-200 justify-start overflow-hidden'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence initial={false}>
                {(sidebarOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -8, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -8, width: 0 }}
                    transition={{ duration: 0.16 }}
                    className="whitespace-nowrap font-medium tracking-tight overflow-hidden"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          {!sidebarOpen && !isMobile && (
            <TooltipContent side="right" sideOffset={10}>
              <p>Sign Out</p>
            </TooltipContent>
          )}
        </Tooltip>

        <div
          className={cn(
            'mt-4 pt-4 border-t border-border/70',
            sidebarOpen || isMobile ? 'px-3' : 'px-1'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-[#dfe4f4] bg-white/70 px-2 py-2 transition-colors overflow-hidden',
                  'shadow-[0_14px_32px_rgba(59,72,130,0.08)] backdrop-blur-xl dark:border-border/70 dark:bg-white/[0.04] dark:shadow-[0_14px_32px_rgba(15,23,42,0.06)]',
                  !(sidebarOpen || isMobile) && 'justify-center px-0 py-2 border-transparent bg-transparent shadow-none'
                )}
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>

                <AnimatePresence initial={false}>
                  {(sidebarOpen || isMobile) && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, x: -8, width: 0 }}
                      transition={{ duration: 0.16 }}
                      className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center"
                    >
                      <p className="text-sm font-semibold truncate tracking-tight text-foreground leading-normal">
                        {user?.displayName || 'User'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TooltipTrigger>
            {!sidebarOpen && !isMobile && (
              <TooltipContent side="right" sideOffset={10}>
                <p>{user?.displayName || user?.email}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={120}>
      {isMobile ? (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[18.5rem] max-w-[85vw] border-r border-[#d9ddf3]/80 bg-[rgba(248,250,255,0.92)] p-0 shadow-[18px_0_60px_rgba(59,72,130,0.16)] backdrop-blur-2xl dark:border-border/60 dark:bg-slate-950/90 dark:shadow-[18px_0_60px_rgba(15,23,42,0.18)]"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col">
              {sidebarBody}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <motion.aside
          className={cn(
            'fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden',
            'border-r border-[#d9ddf3]/80 bg-[rgba(248,250,255,0.88)] shadow-[18px_0_60px_rgba(59,72,130,0.12)] backdrop-blur-2xl',
            'dark:border-border/60 dark:bg-slate-950/75 dark:shadow-[18px_0_60px_rgba(0,0,0,0.24)]'
          )}
          initial={false}
          animate={{ width: sidebarOpen ? '16rem' : '5rem' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {sidebarBody}
        </motion.aside>
      )}
    </TooltipProvider>
  );
};

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
  index: number;
  currentPath: string;
  iconWrapClassName?: string;
  iconClassName?: string;
  activeWrapClassName?: string;
  activeIconClassName?: string;
  activeRailClassName?: string;
  onNavigate?: () => void;
}

const NavItem = ({
  path,
  icon: Icon,
  label,
  isOpen,
  index,
  currentPath,
  iconWrapClassName,
  iconClassName,
  activeWrapClassName,
  activeIconClassName,
  activeRailClassName,
  onNavigate,
}: NavItemProps) => {
  const isCurrent = currentPath === path;

  const content = (
    <NavLink
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 border overflow-hidden',
          isActive
            ? 'bg-white/80 text-foreground border-[#dfe4f4] shadow-[0_0_24px_hsl(var(--primary)/0.10),0_10px_30px_rgba(59,72,130,0.08)] dark:border-border/70 dark:bg-white/[0.06] dark:shadow-[0_0_24px_hsl(var(--primary)/0.11),0_10px_30px_rgba(15,23,42,0.08)]'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#eef1ff]/70 hover:border-primary/25 dark:hover:bg-muted/60'
        )
      }
    >
      {isCurrent && (
        <span
          className={cn(
            'absolute bottom-2 left-0 top-2 w-1 rounded-r-full',
            activeRailClassName || 'bg-primary shadow-[0_0_12px_rgba(59,130,246,0.8)]'
          )}
        />
      )}

      <div
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all duration-200',
          isCurrent
            ? activeWrapClassName || 'bg-primary/15'
            : iconWrapClassName || 'bg-transparent group-hover:bg-muted'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 transition-all duration-200',
            'group-hover:scale-110',
            isCurrent
              ? activeIconClassName || 'text-primary'
              : iconClassName || 'opacity-90 group-hover:opacity-100'
          )}
        />
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, x: -8, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -8, width: 0 }}
            transition={{ duration: 0.16, delay: index * 0.015 }}
            className="whitespace-nowrap font-medium tracking-tight overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );

  if (isOpen) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
