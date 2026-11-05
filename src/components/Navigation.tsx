import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Dumbbell, 
  HeartPulse, 
  Trophy, 
  UtensilsCrossed, 
  Users, 
  FileText, 
  UserCog,
  ChevronRight,
  Shield,
  Calendar,
  Sparkles,
  Menu,
  X,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export type TabType = 
  | 'dashboard' 
  | 'checkin' 
  | 'training' 
  | 'health' 
  | 'winloss' 
  | 'meals' 
  | 'registry' 
  | 'reports' 
  | 'maintenance';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isTopBar?: boolean;
  isLeftDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenLeftDrawer?: () => void;
  isDesktopSidebar?: boolean;
  isMobileOnly?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  isTopBar = false,
  isLeftDrawer = false,
  isOpen = false,
  onClose,
  onOpenLeftDrawer,
  isDesktopSidebar = false
}) => {
  const { isAdmin, currentUser } = useAuth();
  const { members, checkins, trainingLogs, winLossRecords, healthLogs, mealLogs } = useData();

  const activeHolds = members.filter(m => m.status === 'Medical Hold').length;

  const allTabs: {
    id: TabType;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number | string;
    badgeColor?: string;
    accentColor: string;
  }[] = [
    { 
      id: 'dashboard', 
      label: 'Delegation Hub', 
      sublabel: 'Overview & Standings',
      icon: LayoutDashboard,
      accentColor: 'from-blue-600 to-indigo-600',
    },
    { 
      id: 'checkin', 
      label: 'Whereabouts', 
      sublabel: 'Check-In Logs',
      icon: MapPin,
      count: checkins.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      accentColor: 'from-emerald-600 to-teal-600',
    },
    { 
      id: 'training', 
      label: 'Training Drills', 
      sublabel: 'Practice & Coverage',
      icon: Dumbbell,
      count: trainingLogs.length,
      badgeColor: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      accentColor: 'from-blue-600 to-cyan-600',
    },
    { 
      id: 'health', 
      label: 'Medical & Temp', 
      sublabel: activeHolds > 0 ? `${activeHolds} on hold` : 'Health Monitoring',
      icon: HeartPulse,
      count: activeHolds > 0 ? activeHolds : healthLogs.length,
      badgeColor: activeHolds > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      accentColor: 'from-rose-600 to-red-600',
    },
    { 
      id: 'winloss', 
      label: 'Tournament Bouts', 
      sublabel: 'Matches & Medals',
      icon: Trophy,
      count: winLossRecords.length,
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      accentColor: 'from-amber-500 to-yellow-600',
    },
    { 
      id: 'meals', 
      label: 'Nutrition & Meals', 
      sublabel: 'Distribution & Claims',
      icon: UtensilsCrossed,
      count: mealLogs.length,
      badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      accentColor: 'from-orange-500 to-amber-600',
    },
    { 
      id: 'registry', 
      label: 'Delegation Roster', 
      sublabel: 'Athletes & Coaches',
      icon: Users,
      count: members.length,
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      accentColor: 'from-indigo-600 to-purple-600',
    },
    ...(isAdmin ? [
      { 
        id: 'reports' as TabType, 
        label: 'Reports & Audit', 
        sublabel: 'CSV/PDF Extraction',
        icon: FileText,
        accentColor: 'from-slate-700 to-slate-900',
      },
      { 
        id: 'maintenance' as TabType, 
        label: 'User Admin', 
        sublabel: 'Roles & Credentials',
        icon: UserCog,
        accentColor: 'from-emerald-700 to-slate-900',
      },
    ] : []),
  ];

  // 1. Mobile & Tablet Left-Side Slide-Over Menu Drawer
  if (isLeftDrawer) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
        {/* Backdrop */}
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Drawer positioned on the LEFT side */}
        <div className="relative z-10 w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
          <div className="p-4 space-y-4">
            {/* Header Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-300/40">
                      Matahum nga Bais
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase mt-0.5">
                    Delegation Deck
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close left menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tournament badge */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase">
                <span>2026 Batang Pinoy</span>
                <span>8 Sports</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Dec 10 - 19, 2026
              </div>
            </div>

            {/* Menu items on the left drawer */}
            <nav aria-label="Left slide-out module navigation" className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Delegation Modules
              </div>

              {allTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full group flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {tab.label}
                        </div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {tab.sublabel}
                        </div>
                      </div>
                    </div>

                    {tab.count !== undefined && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile at the bottom of left drawer */}
          {currentUser && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    {currentUser.role} • {currentUser.sport || 'General'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Mobile & Tablet Top Horizontal Module Bar (<lg)
  if (isTopBar) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Quick button to open Left Drawer on mobile & tablet */}
        {onOpenLeftDrawer && (
          <button
            onClick={onOpenLeftDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
            title="Open Left Side Menu Drawer"
            aria-label="Open Left Menu Drawer"
          >
            <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        )}

        {/* Scrollable module tabs at top */}
        <div className="flex items-center gap-1.5 min-w-0">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label.split(' ')[0]}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Desktop Right Sidebar Navigation (>= lg)
  return (
    <div className="sticky top-20 space-y-4">
      {/* Brand Deck Header Card */}
      <div className="rounded-3xl p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-blue-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Matahum nga Bais
                </span>
              </div>
              <h3 className="text-xs font-black tracking-wider text-white uppercase mt-0.5">
                Delegation Deck
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50">
            2026 BP
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Dec 10-19, 2026
          </span>
          <span className="font-extrabold text-emerald-300">
            8 Disciplines
          </span>
        </div>
      </div>

      {/* Module Menu List */}
      <nav aria-label="Delegation modules menu" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs space-y-1">
        <div className="px-3 py-2 text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Official Modules</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {allTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full group flex items-center justify-between p-2.5 rounded-2xl text-left transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-600/25'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl transition-transform group-hover:scale-105 shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {tab.sublabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? 'text-white translate-x-0.5'
                      : 'text-slate-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Session Status Card at bottom of Right Sidebar */}
      {currentUser && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Authorized Staff
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Session Active" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                {currentUser.role} • {currentUser.sport || 'General'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
