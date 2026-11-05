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
  Award,
  Sparkles,
  Flame,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';
import { useAuth } from '../context/AuthContext';
import { computeTournamentTally, computeMealStats, computeTrainingSummary } from '../utils/pureLogic';
import { TabType } from './Navigation';
import { SportType } from '../types';

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
    clearPracticeData 
  } = useData();
  const { isLive } = useDatabaseEnv();
  const { currentUser, isAdmin } = useAuth();

  const medalTally = computeTournamentTally(winLossRecords);
  const mealStats = computeMealStats(mealLogs);
  const trainingSummary = computeTrainingSummary(trainingLogs);

  const activeAthletes = members.filter(m => m.role === 'Athlete' && m.status === 'Active');
  const maleAthletes = activeAthletes.filter(m => m.gender === 'Male').length;
  const femaleAthletes = activeAthletes.filter(m => m.gender === 'Female').length;
  const coachesCount = members.filter(m => m.role === 'Coach').length;
  const chaperonesCount = members.filter(m => m.role === 'Chaperone').length;
  const medicalHoldsCount = members.filter(m => m.status === 'Medical Hold').length;

  // Latest checkins
  const recentCheckins = checkins.slice(0, 4);

  // The 8 Authorized Bais City sports disciplines
  const sportsList: SportType[] = [
    'Arnis',
    'Taekwondo',
    'Athletics',
    'Futsal',
    '3x3 Basketball',
    'Beach Volleyball',
    'Badminton',
    'Table Tennis',
  ];

  return (
    <div className="space-y-6">
      
      {/* Grand Hero Pavilion: Matahum nga Bais Brand x 2026 Batang Pinoy Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950 border-2 border-blue-800/40 text-white p-6 sm:p-8 shadow-2xl">
        {/* Glow & Theme Ambient Accents */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          
          {/* Official Brand Header Ribbons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Matahum nga Bais
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" /> City of Champions
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Dec 10 - 19, 2026</span>
            </div>
          </div>

          {/* Delegation Title & Slogan */}
          <div className="space-y-1.5 max-w-3xl">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bais City Delegation Hub
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/90 font-semibold tracking-wide">
              2026 Batang Pinoy National Championships • Official Operations & Monitoring Center
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Real-time whereabouts check-in, sports practice drills, temperature monitoring, meal claiming, and competition standings for Bais City across 8 official disciplines.
            </p>
          </div>

          {/* Quick Action Command Deck */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('checkin')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4 text-emerald-100" />
              <span>Log Whereabouts</span>
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Dumbbell className="w-4 h-4 text-blue-100" />
              <span>Training Drills</span>
            </button>
            <button
              onClick={() => onNavigate('meals')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-100" />
              <span>Claim Meals</span>
            </button>
            <button
              onClick={() => onNavigate('registry')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Users className="w-4 h-4 text-slate-200" />
              <span>Roster Masterlist</span>
            </button>
          </div>

        </div>

        {/* Practice Database Controls (Visible in practice mode) */}
        {!isLive && (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <FlaskConical className="w-4 h-4" />
              <span>Practice Testing Environment Active (Official live competition data remains clean)</span>
            </div>
            {isAdmin && (
              <button
                onClick={clearPracticeData}
                className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Reset practice database (Administrator only)"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Practice DB
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Prestige Metric Cards (Batang Pinoy Colors Infused with Matahum nga Bais) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Bais Delegation Roster (Tañon Sapphire Blue) */}
        <div 
          onClick={() => onNavigate('registry')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Delegation Roster
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{members.length}</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">total registered</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{activeAthletes.length} athletes ({maleAthletes}M • {femaleAthletes}F)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{coachesCount} coaches</span>
          </div>
        </div>

        {/* Card 2: Whereabouts Check-In Logs (Matahum Mangrove Emerald) */}
        <div 
          onClick={() => onNavigate('checkin')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Whereabouts Feed
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{checkins.length}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">timed logs</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Real-time location sync</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Multi-athlete</span>
          </div>
        </div>

        {/* Card 3: Tournament Medals & Standings (Batang Pinoy Gold & Crimson) */}
        <div 
          onClick={() => onNavigate('winloss')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Tournament Medals
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{medalTally.totalMedals}</span>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
              {medalTally.gold}🥇 {medalTally.silver}🥈 {medalTally.bronze}🥉
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{medalTally.wins} Wins • {medalTally.losses} Losses</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{medalTally.winRate}% Win Rate</span>
          </div>
        </div>

        {/* Card 4: Practice Coverage & Drills (Azure & Cyan) */}
        <div 
          onClick={() => onNavigate('training')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Practice Coverage
            </span>
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{trainingSummary.totalHours}</span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">hours drilled</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Across {trainingSummary.sessionsCount} sessions</span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Time-tracked</span>
          </div>
        </div>

      </div>

      {/* The 8 Official Bais City Disciplines Arena */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Bais City Sports Delegation Disciplines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized sports competing at the 2026 Batang Pinoy National Championships
            </p>
          </div>
          <button
            onClick={() => onNavigate('winloss')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Bouts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sportsList.map((sportName) => {
            const count = members.filter(m => m.sport === sportName).length;
            const matches = winLossRecords.filter(w => w.sport === sportName).length;

            return (
              <div 
                key={sportName} 
                onClick={() => onNavigate('winloss')}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {sportName}
                  </h4>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{count} athletes</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{matches} bouts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Deck: Live Whereabouts Activity & Welfare Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Spans): Live Whereabouts Feed & Competition Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Whereabouts Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Real-Time Whereabouts Feed
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Logged athlete locations with time windows submitted by coaches and chaperones
                </p>
              </div>
              <button
                onClick={() => onNavigate('checkin')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentCheckins.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Check-In Logs Recorded Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {isLive ? 'The tournament database is clean and ready. Submit initial team check-ins to populate.' : 'No check-in logs in practice mode yet.'}
                </p>
                <button
                  onClick={() => onNavigate('checkin')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Log First Whereabouts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckins.map((chk, idx) => (
                  <div 
                    key={`${chk.id}-${idx}`} 
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{chk.location}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                          {chk.sport}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {chk.activity} • <span className="font-bold text-emerald-600 dark:text-emerald-400">{chk.participantNames.length} athletes logged</span>
                      </p>
                      {chk.remarks && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{chk.remarks}"</p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg text-[11px]">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {chk.timeWindow}
                      </div>
                      <div className="text-[10px] mt-1 text-slate-500">By {chk.submittedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament Daily Timeline Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                Tournament Period
              </span>
              <h4 className="text-base font-black">December 10 to 19, 2026</h4>
              <p className="text-xs text-blue-200">
                10 Days of National Competition across 8 sports disciplines for Bais City
              </p>
            </div>
            <button
              onClick={() => onNavigate('winloss')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 self-start sm:self-auto"
            >
              Track Medal Board
            </button>
          </div>

        </div>

        {/* Right Column: Nutrition & Medical Welfare Station */}
        <div className="space-y-6">
          
          {/* Nutrition & Meal Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Nutrition & Meals</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distribution & claim rates</p>
              </div>
              <button
                onClick={() => onNavigate('meals')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Total Claim Rate</span>
                <span className="text-amber-600 dark:text-amber-400">{mealStats.claimRate}% ({mealStats.claimed}/{mealStats.total})</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${mealStats.claimRate}%` }}
                />
              </div>

              {/* All 7 meal categories */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {Object.entries(mealStats.byType).map(([type, stats]) => (
                  <div key={type} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">{type}</span>
                    <div className="font-extrabold text-slate-900 dark:text-white mt-0.5 text-xs">
                      {stats.claimed} / {stats.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical Readiness & Temperature Monitoring */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Medical & Temp</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Health monitoring & holds</p>
              </div>
              <button
                onClick={() => onNavigate('health')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Log Health
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Active Medical Holds</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                  medicalHoldsCount > 0 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold animate-pulse' 
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}>
                  {medicalHoldsCount} Athlete(s)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Temperature Logs (°C)</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {healthLogs.length} Checked
                </span>
              </div>

              <button
                onClick={() => onNavigate('health')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>Log Health & Temperature</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
