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
  UserCog 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, currentUser } = useAuth();

  const allTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-In', icon: MapPin },
    { id: 'training', label: 'Training', icon: Dumbbell },
    { id: 'health', label: 'Medical', icon: HeartPulse },
    { id: 'winloss', label: 'Matches', icon: Trophy },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'registry', label: 'Registry', icon: Users },
    ...(isAdmin ? [
      { id: 'reports', label: 'Reports & Audit', icon: FileText },
      { id: 'maintenance', label: 'User Admin', icon: UserCog },
    ] : []),
  ];

  return (
    <>
      {/* Top desktop navigation bar */}
      <nav className="hidden lg:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 overflow-x-auto py-2">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation (React Native / Native App feel) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {allTabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] truncate max-w-[55px] text-center">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu / Remaining tabs trigger for mobile */}
        {allTabs.length > 5 && (
          <div className="relative group">
            <select
              aria-label="More navigation tabs"
              value={allTabs.slice(5).some(t => t.id === activeTab) ? activeTab : ''}
              onChange={(e) => {
                if (e.target.value) setActiveTab(e.target.value as TabType);
              }}
              className={`text-[10px] py-1 px-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold ${
                allTabs.slice(5).some(t => t.id === activeTab)
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <option value="" disabled>More...</option>
              {allTabs.slice(5).map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>
    </>
  );
};
