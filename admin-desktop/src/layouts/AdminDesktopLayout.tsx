import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Activity,
  UtensilsCrossed,
  BookOpen,
  Ticket,
  Sparkles,
  DollarSign,
  Gift,
  UserCheck,
  Scale,
  Link2,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon
} from 'lucide-react';
import { RootState } from '../store';
import { authSlice } from '../store/slices';
import { themeSlice } from '../store/slices';

const SIDEBAR_COLLAPSED_KEY = 'abi-admin-sidebar-collapsed';

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  adminOnly?: boolean;
};

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Members', to: '/admin/members', icon: Users },
  { label: 'Activity', to: '/admin/activity', icon: Activity },
  { label: 'Content', to: '/admin/content', icon: UtensilsCrossed },
  { label: 'Programs', to: '/admin/programs', icon: BookOpen, adminOnly: true },
  { label: 'Promo Codes', to: '/admin/promos', icon: Ticket },
  { label: 'AI Recipes', to: '/admin/recipes', icon: Sparkles },
  { label: 'Pricing', to: '/admin/pricing', icon: DollarSign, adminOnly: true }
];

const affiliateNav: NavItem[] = [
  { label: 'Overview', to: '/admin/affiliate', icon: Gift, end: true },
  { label: 'Affiliates', to: '/admin/affiliate/affiliates', icon: UserCheck },
  { label: 'Commission Rules', to: '/admin/affiliate/rules', icon: Scale },
  { label: 'Referrals', to: '/admin/affiliate/referrals', icon: Link2 }
];

function SidebarLink({
  item,
  collapsed
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-xl text-sm font-medium transition-colors ${
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
        } ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }>
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function SidebarAction({
  label,
  onClick,
  collapsed,
  icon: Icon
}: {
  label: string;
  onClick: () => void;
  collapsed: boolean;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
        collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
      }`}>
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && label}
    </button>
  );
}

export function AdminDesktopLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const [affiliateOpen, setAffiliateOpen] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  const isAdmin = user?.role === 'admin';
  const visibleMain = mainNav.filter((item) => !item.adminOnly || isAdmin);
  const isDarkTheme =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      document.documentElement.classList.contains('dark'));

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      if (next) setAffiliateOpen(true);
      return next;
    });
  };

  const toggleTheme = () => {
    const next =
      themeMode === 'dark'
        ? 'light'
        : themeMode === 'light'
          ? 'dark'
          : document.documentElement.classList.contains('dark')
            ? 'light'
            : 'dark';
    dispatch(themeSlice.actions.setTheme(next));
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleLogout = () => {
    dispatch(authSlice.actions.logout());
    navigate('/admin');
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside
        className={`shrink-0 bg-primary text-white flex flex-col border-r border-primary-hover/30 transition-[width] duration-200 ease-in-out ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        }`}>
        <div
          className={`border-b border-white/10 flex items-start ${
            collapsed ? 'px-2 py-4 justify-center' : 'px-5 py-6'
          }`}>
          {collapsed ? (
            <div
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm"
              title="Admin Console">
              AB
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                Authentic Balance
              </p>
              <h1 className="text-lg font-bold">Admin Console</h1>
              {user && (
                <p className="text-xs text-white/60 mt-2 truncate">
                  {user.name} · {user.role}
                </p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Collapse sidebar"
              className="p-2 -mr-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0">
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="px-2 pt-2">
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Expand sidebar"
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        <nav
          className={`flex-1 overflow-y-auto py-4 space-y-1 ${
            collapsed ? 'px-2' : 'px-3'
          }`}>
          {visibleMain.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}

          <div className={`pt-4 mt-2 border-t border-white/10 ${collapsed ? '' : ''}`}>
            {collapsed ? (
              <div className="space-y-1">
                {affiliateNav.map((item) => (
                  <SidebarLink key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAffiliateOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50 hover:text-white/80">
                  Affiliates
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${affiliateOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {affiliateOpen && (
                  <div className="mt-1 space-y-1">
                    {affiliateNav.map((item) => (
                      <SidebarLink key={item.to} item={item} collapsed={collapsed} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </nav>

        <div
          className={`border-t border-white/10 space-y-1 ${
            collapsed ? 'p-2' : 'p-3'
          }`}>
          <SidebarAction
            label="Toggle theme"
            onClick={toggleTheme}
            collapsed={collapsed}
            icon={isDarkTheme ? Sun : Moon}
          />
          <SidebarAction
            label="Sign out"
            onClick={handleLogout}
            collapsed={collapsed}
            icon={LogOut}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto admin-desktop-main">
          <div className="max-w-[1400px] mx-auto w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
