import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalAtmosphere } from './GlobalAtmosphere';
import { useUIStore } from '@/store/uiStore';
import { useIsMobile } from '@/hooks/use-mobile';

export const MainLayout = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const theme = useUIStore((state) => state.theme);
  const isMobile = useIsMobile();

  return (
    <div className="arcora-app-shell relative min-h-screen overflow-hidden bg-background">
      {/* Theme-aware animated atmosphere — z-[1] places it above the CSS bg but below content */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <GlobalAtmosphere theme={theme} />
      </div>

      {/* Semi-transparent overlay — preserves the grid tint on top of the atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-[2] arcora-atmosphere-overlay" />

      <Sidebar />

      <motion.main
        className="relative z-10 min-h-screen transition-all duration-300"
        initial={false}
        animate={{
          marginLeft: isMobile ? '0rem' : sidebarOpen ? '16rem' : '5rem',
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Header />

        <div className="p-3 pt-20 sm:p-6 sm:pt-24">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};


