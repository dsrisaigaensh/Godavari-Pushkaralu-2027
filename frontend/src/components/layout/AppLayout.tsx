import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  QrCode,
  ShieldAlert,
  GitBranch,
  MapPin,
  FileSpreadsheet,
  Users,
  History,
  CheckSquare,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  ArrowRightLeft,
  WifiOff,
  Sliders,
  ChevronDown,
  X,
  Compass,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Modal } from '../ui/Modal';
import { NotificationBellDropdown } from '../../features/notifications/NotificationBellDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ErrorBoundary } from '../common/ErrorBoundary';

import apEmblem from '../../assets/ap_emblem.png';
import kalashIcon from '../../assets/kalash_icon.png';
import headerTempleWatermark from '../../assets/header_temple_watermark.png';
import sidebarWatermark from '../../assets/sidebar_bottom_watermark.png';

export const AppLayout: React.FC = () => {
  const { user, logout, quickLogin, hasRole, hasPermission } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isVendor = hasRole('vendor');

  const navItems = [
    { name: t('nav_overview', 'Executive Overview'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav_projects', 'Projects & Works'), path: '/projects', icon: FolderGit2 },
    {
      name: isVendor ? 'Contractor Portal' : t('nav_contractors', 'Contractors & Vendors'),
      path: isVendor ? '/vendors/me' : '/vendors',
      icon: Building2,
    },
    { name: t('nav_inspections', 'Field Verification'), path: '/inspections', icon: ClipboardCheck },
    { name: t('nav_defects', 'Defects & Rework'), path: '/defects', icon: AlertTriangle },
    { name: t('nav_assets', 'Asset Registry & QR'), path: '/assets', icon: QrCode },
    { name: t('nav_readiness', 'Readiness & Risk'), path: '/readiness', icon: ShieldAlert },
    { name: t('nav_dependencies', 'Dependency Graph'), path: '/dependencies', icon: GitBranch },
    { name: t('nav_map', 'Geographic Map'), path: '/map', icon: MapPin },
    { name: t('nav_offline', 'Offline Field Sync'), path: '/offline', icon: WifiOff },
    { name: t('nav_reports', 'Reports'), path: '/reports', icon: FileSpreadsheet },
    { name: t('nav_tasks', 'My Tasks'), path: '/my-tasks', icon: CheckSquare, badge: '13' },
    { name: t('nav_notifications', 'Notifications'), path: '/notifications', icon: Bell, badge: '5' },
    {
      name: t('nav_admin', 'System Configuration'),
      path: '/admin/system',
      icon: Sliders,
      permission: 'users:read',
    },
    {
      name: t('nav_users', 'User Management'),
      path: '/admin/users',
      icon: Users,
      permission: 'users:read',
    },
    {
      name: t('nav_audit', 'Audit Explorer'),
      path: '/admin/audit',
      icon: History,
      permission: 'audit:read',
    },
  ];

  // Filter navigation by permissions
  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission) || hasRole('super_admin');
  });

  const getBreadcrumbTitle = () => {
    const item = navItems.find((n) => location.pathname.startsWith(n.path));
    return item ? item.name : t('nav_overview', 'Executive Overview');
  };

  const primaryRole = user?.roles[0]?.name || 'Super Administrator';

  // Mobile Bottom Navigation Tabs
  const mobileBottomTabs = [
    { name: t('tab_overview', 'Overview'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('tab_projects', 'Projects'), path: '/projects', icon: FolderGit2 },
    { name: t('tab_inspect', 'Inspect'), path: '/inspections', icon: ClipboardCheck },
    { name: t('tab_defects', 'Defects'), path: '/defects', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans text-textPrimary">
      {/* Top Header Bar (Government of Andhra Pradesh & Godavari Pushkaralu 2027) */}
      <header className="h-14 sm:h-16 bg-[#FDFBF7] border-b border-[#EFE6DA] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-subtle sticky top-0 z-40 relative">
        {/* Subtle decorative temple silhouette banner watermark on desktop */}
        <div
          className="absolute inset-y-0 left-1/3 right-1/4 pointer-events-none opacity-20 hidden md:block overflow-hidden"
          style={{
            backgroundImage: `url(${headerTempleWatermark})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          }}
        />

        {/* Left Side: AP Government Emblem & Pushkaralu Branding */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 z-10 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 -ml-1 text-stone-700 hover:text-brand rounded-lg hover:bg-stone-100 shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-stone-800" />
          </button>

          {/* AP Government Crest */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <img
              src={apEmblem}
              alt="Government of Andhra Pradesh Emblem"
              className="h-7 sm:h-9 w-auto object-contain shrink-0 drop-shadow-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] sm:text-xs md:text-sm font-bold text-stone-900 tracking-tight">
                {t('gov_ap', 'Government of Andhra Pradesh')}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 sm:h-8 w-px bg-amber-300/60 mx-0.5 sm:mx-1 hidden xs:block" />

          {/* Godavari Pushkaralu 2027 Title & Sacred Kalash */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <img
              src={kalashIcon}
              alt="Godavari Pushkaralu Kalash"
              className="h-6 sm:h-8 w-auto object-contain shrink-0"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#5B1414] font-serif tracking-tight truncate">
                {t('pushkaralu_title', 'Godavari Pushkaralu 2027')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#883526] font-medium hidden md:inline truncate">
                {t('pushkaralu_sub', 'Sri Godavari Maha Pushkaralu | Rajamahendravaram')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Language Switcher, Role Switcher, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 z-10 shrink-0">
          {/* Multilingual Selector (English / తెలుగు / हिन्दी) */}
          <LanguageSwitcher variant="header" />

          {/* Quick Role Switcher Shortcut (Desktop) */}
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition-colors"
            title="Switch Persona"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-brand" />
            <span>{t('switch_role', 'Switch Role')}</span>
          </button>

          {/* In-App Notification Center Dropdown */}
          <NotificationBellDropdown />

          {/* Quick Role Switcher Shortcut (Desktop) */}
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition-colors"
            title="Switch Persona"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-brand" />
            <span>{t('switch_role', 'Switch Role')}</span>
          </button>

          {/* Quick Role Switcher Button (Mobile icon only) */}
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="sm:hidden p-1.5 rounded-lg text-stone-700 hover:text-brand hover:bg-amber-50"
            title="Switch Persona"
            aria-label="Switch Persona"
          >
            <ArrowRightLeft className="w-4 h-4 text-brand" />
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setRoleSwitcherOpen(true)}
            className="flex items-center gap-2 pl-1.5 py-1 pr-1 sm:pr-1.5 rounded-xl hover:bg-amber-100/30 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#9A3412] to-[#EA580C] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">
              {user?.full_name?.charAt(0) || 'R'}
            </div>
            <div className="hidden lg:flex flex-col leading-tight text-left">
              <span className="text-xs font-bold text-stone-900 truncate max-w-[170px]">
                {user?.full_name || 'Sri K. Ramesh Babu, IAS'}
              </span>
              <span className="text-[10px] text-stone-500 font-medium truncate">
                {primaryRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden lg:block" />
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Deep Maroon/Crimson Sidebar (Visible automatically on Laptop / Desktop md+) */}
        <aside
          className={`hidden md:flex flex-col bg-gradient-to-b from-[#7A1518] via-[#651013] to-[#4F0B0D] text-white transition-all duration-200 z-20 relative shadow-card shrink-0 ${
            collapsed ? 'w-[74px]' : 'w-[245px]'
          }`}
        >
          {/* Sidebar Top: CivicProof Logo & Infrastructure Tagline */}
          <div className="p-4 border-b border-[#8C1E22]/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-1.5 flex items-center justify-center shadow-md shadow-black/20 shrink-0">
                <img src={kalashIcon} alt="CivicProof Emblem" className="w-full h-full object-contain brightness-110" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-0.5">
                    <span className="text-base font-extrabold text-white tracking-tight leading-none">
                      CivicProof
                    </span>
                    <span className="text-[9px] text-amber-300 font-bold leading-none">®</span>
                  </div>
                  <span className="text-[9.5px] text-amber-200/90 font-medium mt-1 leading-tight truncate">
                    {t('infrastructure_tagline', 'Infrastructure Readiness & Asset Monitoring')}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto z-10">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white shadow-md shadow-black/20 font-semibold'
                        : 'text-amber-100/85 hover:text-white hover:bg-white/10'
                    } ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate flex-1">{item.name}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EA580C] text-white shadow-sm border border-amber-300/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Ghat Silhouette Watermark */}
          <div className="pointer-events-none opacity-20 overflow-hidden shrink-0 mt-auto">
            <img
              src={sidebarWatermark}
              alt="Godavari Ghat Watermark"
              className="w-full object-cover scale-105"
            />
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t border-[#8C1E22]/60 z-10 bg-black/10">
            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-white truncate block">
                    {user?.full_name?.split(' ')[0] || 'Official'}
                  </span>
                  <span className="text-[9.5px] text-amber-200/80 truncate block">
                    {user?.department?.code || 'Command Cell'}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 text-amber-200/80 hover:text-white hover:bg-red-900/60 rounded-lg transition-colors"
                title="Sign out of system"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-gradient-to-b from-[#7A1518] via-[#651013] to-[#4F0B0D] text-white h-full flex flex-col shadow-2xl z-10 overflow-hidden">
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#8C1E22]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-1 flex items-center justify-center shadow">
                    <img src={kalashIcon} alt="CivicProof Emblem" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-base tracking-tight block">CivicProof®</span>
                    <span className="text-[10px] text-amber-200 font-medium block">Godavari Pushkaralu 2027</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User Card */}
              <div className="p-3 mx-3 my-2 bg-black/20 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F59E0B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.full_name?.charAt(0) || 'R'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {user?.full_name || 'Sri K. Ramesh Babu, IAS'}
                    </span>
                    <span className="text-[10px] text-amber-200/90 block truncate">{primaryRole}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRoleSwitcherOpen(true);
                  }}
                  className="px-2 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 rounded-lg border border-amber-400/30 shrink-0"
                >
                  Switch
                </button>
              </div>

              {/* Multilingual Selector inside Mobile Drawer */}
              <div className="px-3 py-1">
                <LanguageSwitcher variant="drawer" />
              </div>

              {/* Navigation Items in Drawer */}
              <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white font-bold shadow-md shadow-black/20'
                            : 'text-amber-100/85 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EA580C] text-white shadow-sm border border-amber-300/40">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Mobile Drawer Footer */}
              <div className="p-3 border-t border-[#8C1E22]/60 bg-black/20 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-red-800/80 hover:bg-red-700 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Platform
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-3 sm:space-y-4">
            {/* Breadcrumb Navigation Trail */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#8C3725]">
              <span
                onClick={() => navigate('/dashboard')}
                className="hover:text-brand cursor-pointer"
              >
                CivicProof
              </span>
              <span className="text-amber-600/60">&gt;</span>
              <span className="font-semibold text-[#5B1414] truncate">{getBreadcrumbTitle()}</span>
            </div>

            <ErrorBoundary resetKey={location.pathname} inLayout>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Dedicated Bottom Tab Bar (Visible automatically on screens < 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#EFE6DA] py-1.5 px-3 flex items-center justify-around shadow-lg"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
        aria-label="Mobile Navigation"
      >
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#EA580C] font-bold'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#EA580C]' : 'text-stone-500'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">{tab.name}</span>
            </button>
          );
        })}

        {/* 5th Tab: Menu trigger to open drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileMenuOpen ? 'text-[#EA580C] font-bold' : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-none mt-0.5">{t('tab_more', 'More')}</span>
        </button>
      </nav>

      {/* Role Switcher Modal (Instant Persona Simulation for Evaluators) */}
      <Modal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
        title="Interactive Role Simulator"
        description="Switch between pre-configured Godavari Pushkaralu demo accounts to verify permission boundaries."
        maxWidth="lg"
      >
        <div className="space-y-2.5">
          {DEMO_ACCOUNTS.map((acc) => {
            const isCurrent = user?.email === acc.email;
            return (
              <div
                key={acc.email}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-brand bg-brand-light/50 shadow-sm'
                    : 'border-borderLight hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-textPrimary">{acc.roleName}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EA580C] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-textPrimary font-semibold mt-0.5 truncate">{acc.name}</p>
                  <p className="text-[11px] text-textSecondary mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">
                    {acc.description}
                  </p>
                </div>
                <button
                  disabled={isCurrent}
                  onClick={async () => {
                    await quickLogin(acc.email);
                    setRoleSwitcherOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-saffron to-amberGold text-white hover:opacity-95 shadow-subtle'
                  }`}
                >
                  {isCurrent ? 'Current' : 'Switch To'}
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
