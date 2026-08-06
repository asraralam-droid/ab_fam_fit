import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomTabs } from './BottomTabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { DailyMessagingRunner } from '../DailyMessagingRunner';
import { TrackingReminderRunner } from '../TrackingReminderRunner';

const BESTIE_AVATAR = '/assets/authentic-bestie-avatar.png';

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const hideBestie =
    location.pathname === '/bestie' ||
    location.pathname.endsWith('/bestie') ||
    location.pathname.startsWith('/chat');
  const isAffiliateModule = location.pathname.startsWith('/affiliate');
  return (
    <div className="flex flex-col h-full w-full relative">
      <DailyMessagingRunner />
      <TrackingReminderRunner />
      {!isAffiliateModule && <TopBar />}

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background pb-6">
        <Outlet />
      </main>

      {!hideBestie && !isAffiliateModule && (
        <button
          type="button"
          onClick={() => navigate('/bestie')}
          aria-label="Open Authentic Bestie"
          className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          <span className="relative w-14 h-14 rounded-full shadow-lg ring-2 ring-white dark:ring-surface overflow-hidden bg-accent-sage">
            <img
              src={BESTIE_AVATAR}
              alt="Authentic Bestie"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-accent-sage border-2 border-white" />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-text bg-surface/90 backdrop-blur px-1.5 py-0.5 rounded-full border border-border shadow-sm">
            Bestie
          </span>
        </button>
      )}

      <BottomTabs />
    </div>
  );
}
