import React from 'react';
import { 
  Users, 
  MapPin, 
  Trophy, 
  Dumbbell, 
  UtensilsCrossed, 
  HeartPulse, 
  Calendar, 
  Plus, 
  FlaskConical, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';
import { useAuth } from '../context/AuthContext';
import { computeTournamentTally, computeMealStats, computeTrainingSummary } from '../utils/pureLogic';
import { TabType } from './Navigation';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    members, 
    checkins, 
    winLossRecords, 
    trainingLogs, 
    mealLogs, 
    healthLogs,
    seedPracticeData, 
    clearPracticeData 
  } = useData();
  const { isLive, env } = useDatabaseEnv();
  const { currentUser, isAdmin } = useAuth();

  const medalTally = computeTournamentTally(winLossRecords);
  const mealStats = computeMealStats(mealLogs);
  const trainingSummary = computeTrainingSummary(trainingLogs);

  const activeAthletesCount = members.filter(m => m.role === 'Athlete' && m.status === 'Active').length;
  const coachesCount = members.filter(m => m.role === 'Coach').length;
  const chaperonesCount = members.filter(m => m.role === 'Chaperone').length;
  const medicalHoldsCount = members.filter(m => m.status === 'Medical Hold').length;

  // Latest checkins
  const recentCheckins = checkins.slice(0, 3);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Batang Pinoy National Championships • Dec 10-19, 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bais City Delegation Hub
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time athlete whereabouts tracking, check-ins, sports training drills, temperature monitoring, and official competition standings for Bais City.
          </p>
          
          <div className="pt-3 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('checkin')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Log Whereabouts Check-In
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4" /> Training Drills Log
            </button>
            <button
              onClick={() => onNavigate('meals')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" /> Meal Claiming
            </button>
          </div>
        </div>

        {/* Practice Database Controls (Visible in practice mode) */}
        {!isLive && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <FlaskConical className="w-4 h-4" />
              <span>Practice Database Testing Mode (Clean buildup data is protected in LIVE)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={seedPracticeData}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Load Practice Rehearsal Data
              </button>
              <button
                onClick={clearPracticeData}
                className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Practice DB
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Members Headcount */}
        <div 
          onClick={() => onNavigate('registry')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Roster
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{members.length}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{activeAthletesCount} athletes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {coachesCount} coaches • {chaperonesCount} chaperones
          </p>
        </div>

        {/* Whereabouts Submissions */}
        <div 
          onClick={() => onNavigate('checkin')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Check-In Logs
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{checkins.length}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">submissions</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-athlete entry
          </p>
        </div>

        {/* Medals & Standings */}
        <div 
          onClick={() => onNavigate('winloss')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tournament Medals
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{medalTally.totalMedals}</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {medalTally.gold}🥇 {medalTally.silver}🥈 {medalTally.bronze}🥉
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {medalTally.wins} Wins • {medalTally.winRate}% win rate
          </p>
        </div>

        {/* Training Hours */}
        <div 
          onClick={() => onNavigate('training')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Practice Coverage
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{trainingSummary.totalHours}</span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">hours drilled</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {trainingSummary.sessionsCount} logged sessions
          </p>
        </div>

      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2 spans): Whereabouts & Sports Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Latest Whereabouts Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Real-Time Whereabouts Feed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Recent check-in logs submitted by coaches and chaperones</p>
              </div>
              <button
                onClick={() => onNavigate('checkin')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentCheckins.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isLive ? 'No check-in logs recorded yet. Build up data is clean.' : 'No check-in logs in practice database yet.'}
                </p>
                <button
                  onClick={() => onNavigate('checkin')}
                  className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit First Check-In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckins.map((chk) => (
                  <div key={chk.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{chk.location}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          {chk.sport}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {chk.activity} • <span className="font-semibold text-slate-800 dark:text-slate-200">{chk.participantNames.length} athletes checked in</span>
                      </p>
                      {chk.remarks && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{chk.remarks}"</p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{chk.timeWindow}</div>
                      <div className="text-[10px]">Logged by {chk.submittedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bais City 8 Sports Disciplines Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Bais City Sports Delegation Disciplines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Authorized sports competing at the 2026 Batang Pinoy
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                'Arnis', 
                'Taekwondo', 
                'Athletics', 
                'Futsal', 
                '3x3 Basketball', 
                'Beach Volleyball', 
                'Badminton', 
                'Table Tennis'
              ].map((sport) => {
                const count = members.filter(m => m.sport === sport).length;
                const matches = winLossRecords.filter(w => w.sport === sport).length;
                return (
                  <div key={sport} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{sport}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{count} registered</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{matches} bouts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: Meal Status & Medical Holds */}
        <div className="space-y-6">
          
          {/* Meal Distribution Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Meal Distribution</h3>
              <button
                onClick={() => onNavigate('meals')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Total Claim Rate</span>
                <span className="text-emerald-600 dark:text-emerald-400">{mealStats.claimRate}% ({mealStats.claimed}/{mealStats.total})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mealStats.claimRate}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {Object.entries(mealStats.byType).map(([type, stats]) => (
                  <div key={type} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{type}</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {stats.claimed} / {stats.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health & Medical Alerts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Medical & Temperature</h3>
              <button
                onClick={() => onNavigate('health')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Log Health
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <span className="text-slate-600 dark:text-slate-400">Active Medical Holds</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${medicalHoldsCount > 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                  {medicalHoldsCount} Athlete(s)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <span className="text-slate-600 dark:text-slate-400">Temperature Checks</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {healthLogs.length} Checked
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
