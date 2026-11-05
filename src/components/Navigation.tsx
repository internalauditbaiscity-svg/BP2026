import React, { useState } from 'react';
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
  X
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
  isMobileOnly?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  isMobileOnly = false 
}) => {
  const { isAdmin, currentUser } = useAuth();
  const { members, checkins, trainingLogs, winLossRecords, healthLogs, mealLogs } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Mobile Bottom Navigation Bar (<lg)
  if (isMobileOnly) {
    return (
      <>
        {/* Slide-over menu for remaining tabs on mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs lg:hidden animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[80vh] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Matahum nga Bais • Module Deck
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      2026 Batang Pinoy Delegation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {allTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-200/80 dark:bg-slate-700/80'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{tab.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {tab.sublabel}
                          </div>
                        </div>
                      </div>
                      {tab.count !== undefined && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
          {allTabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-1 rounded-xl flex-1 transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-950/60 shadow-xs' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 truncate max-w-[65px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-1 rounded-xl flex-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">All Modules</span>
          </button>
        </nav>
      </>
    );
  }

  // Desktop Right Sidebar Navigation (Themed with Batang Pinoy + Matahum nga Bais)
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
      <nav aria-label="Delegation modules menu" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-sm space-y-1">
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
