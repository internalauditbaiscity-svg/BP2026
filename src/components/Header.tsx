import React from 'react';
import { 
  Shield, 
  CloudCheck, 
  CloudRain, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  Database, 
  FlaskConical, 
  UserCheck,
  Menu,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';
import { useData } from '../context/DataContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  isDark: boolean;
  toggleDark: () => void;
  onToggleMobileMenu?: () => void;
  onOpenCoachManual?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNotifications, 
  isDark, 
  toggleDark,
  onToggleMobileMenu,
  onOpenCoachManual
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { env, setEnv, isLive } = useDatabaseEnv();
  const { syncStatus, notifications } = useData();

  const unreadCount = notifications.filter(n => !currentUser || !n.readBy.includes(currentUser.id)).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        
        {/* Brand & Left Navigation Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              title="Open Left Module Menu"
              aria-label="Open Left Module Menu"
            >
              <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-700/25 shrink-0">
            <Shield className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                BAIS CITY
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                Batang Pinoy 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Dec 10 - 19, 2026 • Official Delegation Management & Monitoring
            </p>
          </div>
        </div>

        {/* Action Controls & Environment Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
          
          {/* Cloud Sync Status (Visible on both mobile & desktop) */}
          <div 
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
            title={syncStatus === 'synced' ? 'Real-time cloud database connected' : syncStatus === 'syncing' ? 'Syncing changes to cloud...' : 'Working in local offline cache'}
          >
            {syncStatus === 'synced' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="sm:hidden">Synced</span>
                  <span className="hidden sm:inline">Cloud Synced</span>
                </span>
              </>
            ) : syncStatus === 'syncing' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <span className="sm:hidden">Syncing</span>
                  <span className="hidden sm:inline">Syncing...</span>
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="sm:hidden">Offline</span>
                  <span className="hidden sm:inline">Offline Cache</span>
                </span>
              </>
            )}
          </div>

          {/* Database Environment Switcher Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setEnv('live')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isLive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Live Competition Database (Dec 10-19, 2026) - Clean Data"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LIVE</span>
            </button>
            <button
              onClick={() => setEnv('practice')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !isLive
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Practice & Rehearsal Database - Dry-run testing without affecting live records"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PRACTICE</span>
            </button>
          </div>

          {/* Coach Playbook PDF Manual Button (Administrator Only for Distribution & Control) */}
          {isAdmin && onOpenCoachManual && (
            <button
              onClick={onOpenCoachManual}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-blue-600/15 hover:from-amber-500/25 hover:to-blue-600/25 text-slate-800 dark:text-slate-100 border border-amber-400/40 dark:border-amber-400/30 transition-all font-bold text-xs shadow-2xs group"
              title="Open Coach's Operations Playbook & Download Printable PDF (Admin Distribution)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-extrabold">Coach Playbook</span>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                PDF
              </span>
            </button>
          )}

          {/* Push Alert Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Delegation notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile & Sign Out */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  {currentUser.role} {currentUser.sport && currentUser.sport !== 'General' ? `(${currentUser.sport})` : ''}
                </p>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Practice Environment Notice Banner */}
      {!isLive && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>DRY-RUN / PRACTICE DATABASE ACTIVE • Build-up live data is preserved untouched</span>
        </div>
      )}
    </header>
  );
};
