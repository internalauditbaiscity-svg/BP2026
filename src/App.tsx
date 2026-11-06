import React, { useState, useEffect } from 'react';
import { DatabaseEnvProvider } from './context/DatabaseEnvContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CheckInView } from './components/CheckInView';
import { TrainingView } from './components/TrainingView';
import { HealthView } from './components/HealthView';
import { WinLossView } from './components/WinLossView';
import { MealView } from './components/MealView';
import { RegistryView } from './components/RegistryView';
import { ReportsView } from './components/ReportsView';
import { UserMaintenanceView } from './components/UserMaintenanceView';
import { LoginModal } from './components/LoginModal';
import { NotificationModal } from './components/NotificationModal';
import { CoachManualModal } from './components/CoachManualModal';
import { testConnection } from './lib/firebase';

const MainLayout: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCoachManualOpen, setIsCoachManualOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('bais_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bais_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bais_theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Secure Login Modal (shown if unauthenticated) */}
      <LoginModal />

      {/* App Header with Mobile Left-Menu Toggle Button */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isDark={isDark}
        toggleDark={toggleDark}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        onOpenCoachManual={() => setIsCoachManualOpen(true)}
      />

      {/* Mobile & Tablet Top Horizontal Module Bar (<lg) */}
      <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-[61px] z-20 shadow-2xs">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isTopBar 
          onOpenLeftDrawer={() => setIsMobileMenuOpen(true)} 
        />
      </div>

      {/* Mobile & Tablet Slide-Over Left Menu Drawer (<lg) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLeftDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Layout: Views on Left/Center, Desktop Module Navigation on the Right */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-8 flex flex-col lg:flex-row items-start gap-6">
        {/* Left / Center Area: Main Content Views */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'checkin' && <CheckInView />}
          {activeTab === 'training' && <TrainingView />}
          {activeTab === 'health' && <HealthView />}
          {activeTab === 'winloss' && <WinLossView />}
          {activeTab === 'meals' && <MealView />}
          {activeTab === 'registry' && <RegistryView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'maintenance' && <UserMaintenanceView />}
        </main>

        {/* Right Side: Module Menu Sidebar (Desktop >= lg) */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </aside>
      </div>

      {/* Push Notification & Broadcast Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Coach's Operations Playbook & Printable PDF Modal */}
      <CoachManualModal
        isOpen={isCoachManualOpen}
        onClose={() => setIsCoachManualOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DatabaseEnvProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </DatabaseEnvProvider>
  );
}
