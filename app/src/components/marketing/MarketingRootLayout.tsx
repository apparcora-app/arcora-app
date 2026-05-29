import { Outlet } from 'react-router-dom';
import { MarketingAtmosphere } from '@/components/marketing/MarketingAtmosphere';

export const MarketingRootLayout = () => {
  return (
    <>
      <div className="arcora-persistent-bg pointer-events-none fixed inset-0 z-[-1]">
        <MarketingAtmosphere variant="site" />
      </div>
      <Outlet />
    </>
  );
};
