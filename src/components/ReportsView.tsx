import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  History, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';
import { 
  exportCheckInsCSV, 
  exportTrainingCSV, 
  exportHealthCSV, 
  exportWinLossCSV, 
  exportMealCSV, 
  exportAuditCSV, 
  generateDelegationPDFReport 
} from '../utils/exportReports';
import { logAuditEvent } from '../utils/audit';
import { computeTournamentTally, computeMealStats, computeTrainingSummary } from '../utils/pureLogic';

export const ReportsView: React.FC = () => {
  const { 
    members, 
    checkins, 
    trainingLogs, 
    healthLogs, 
    winLossRecords, 
    mealLogs, 
    auditLogs 
  } = useData();
  const { currentUser, isAdmin } = useAuth();
  const { env } = useDatabaseEnv();

  const [selectedDate, setSelectedDate] = useState('2026-12-10');
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  // Strict Administrator guard
  if (!isAdmin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-3">
        <div className="p-4 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Daily report extraction (CSV and PDF) and the complete access audit trail are restricted exclusively to the App Administrator.
        </p>
      </div>
    );
  }

  // PDF Generators
  const handleExportPDF = async (category: string) => {
    if (!currentUser) return;

    if (category === 'whereabouts') {
      const filtered = checkins.filter(c => !selectedDate || c.date === selectedDate);
      generateDelegationPDFReport({
        reportTitle: `Daily Whereabouts & Attendance Report (${selectedDate || 'All Days'})`,
        env,
        adminName: currentUser.fullName,
        adminEmail: currentUser.email,
        summaryNotes: [
          `Total submissions logged: ${filtered.length}`,
          `Athletes covered: ${filtered.reduce((acc, c) => acc + (c.participantNames?.length || 0), 0)} headcounts`,
        ],
        sections: [
          {
            heading: 'Whereabouts & Activity Log',
            columns: ['Time Window', 'Sport', 'Location', 'Activity', 'Count', 'Sub-By'],
            rows: filtered.map(c => [
              c.timeWindow,
              c.sport,
              c.location,
              c.activity,
              c.participantNames?.length || 0,
              c.submittedBy,
            ]),
          },
        ],
      });
    } else if (category === 'training') {
      const summary = computeTrainingSummary(trainingLogs);
      generateDelegationPDFReport({
        reportTitle: 'Training Coverage & Drills Monitoring Report',
        env,
        adminName: currentUser.fullName,
        adminEmail: currentUser.email,
        summaryNotes: [
          `Total Practice Coverage: ${summary.totalHours} Hours (${summary.totalMinutes} minutes)`,
          `Total Training Sessions: ${summary.sessionsCount}`,
        ],
        sections: [
          {
            heading: 'Practice Drills & Time Coverage',
            columns: ['Date', 'Sport', 'Drill Focus', 'Coverage', 'Duration', 'Venue', 'Coach'],
            rows: trainingLogs.map(t => [
              t.date,
              t.sport,
              t.drillFocus,
              `${t.startTime}-${t.endTime}`,
              `${t.durationMinutes}m`,
              t.venue,
              t.coachInCharge,
            ]),
          },
        ],
      });
    } else if (category === 'medical') {
      generateDelegationPDFReport({
        reportTitle: 'Daily Health, Temperature & Injury Log',
        env,
        adminName: currentUser.fullName,
        adminEmail: currentUser.email,
        summaryNotes: [
          `Total Screenings: ${healthLogs.length}`,
          `Active Medical Holds: ${healthLogs.filter(h => !h.clearedToPlay).length}`,
        ],
        sections: [
          {
            heading: 'Health & Temperature Entries',
            columns: ['Date/Time', 'Member', 'Sport', 'Temp', 'Injury', 'Status'],
            rows: healthLogs.map(h => [
              `${h.date} ${h.time}`,
              h.memberName,
              h.sport,
              `${h.temperature}°C`,
              h.hasInjury ? `${h.injuryType} (${h.severity})` : 'None',
              h.clearedToPlay ? 'Cleared' : 'HOLD',
            ]),
          },
        ],
      });
    } else if (category === 'winloss') {
      const tally = computeTournamentTally(winLossRecords);
      generateDelegationPDFReport({
        reportTitle: 'Tournament Match Progression & Medal Standing',
        env,
        adminName: currentUser.fullName,
        adminEmail: currentUser.email,
        summaryNotes: [
          `Total Medals: ${tally.totalMedals} (Gold: ${tally.gold}, Silver: ${tally.silver}, Bronze: ${tally.bronze})`,
          `Win Rate: ${tally.winRate}% (${tally.wins}W - ${tally.losses}L - ${tally.draws}D)`,
        ],
        sections: [
          {
            heading: 'Daily Match Outcomes',
            columns: ['Date', 'Sport', 'Athlete/Team', 'Opponent', 'Stage', 'Score', 'Result'],
            rows: winLossRecords.map(w => [
              w.date,
              w.sport,
              w.athleteOrTeam,
              w.opponent,
              w.roundStage,
              w.score,
              w.result,
            ]),
          },
        ],
      });
    } else if (category === 'meals') {
      const stats = computeMealStats(mealLogs);
      generateDelegationPDFReport({
        reportTitle: `Meal Distribution & Claiming Audit (${selectedDate})`,
        env,
        adminName: currentUser.fullName,
        adminEmail: currentUser.email,
        summaryNotes: [
          `Claim Rate: ${stats.claimRate}% (${stats.claimed} claimed of ${stats.total} total meals)`,
          `Pending Vouchers: ${stats.pending}`,
        ],
        sections: [
          {
            heading: 'Meal Vouchers and Claiming Status',
            columns: ['Meal', 'Member', 'Role', 'Sport', 'Status', 'Claim Time'],
            rows: mealLogs.filter(m => !selectedDate || m.date === selectedDate).map(m => [
              m.mealType,
              m.memberName,
              m.memberRole,
              m.sport,
              m.claimed ? 'CLAIMED' : 'PENDING',
              m.claimedAt || '--',
            ]),
          },
        ],
      });
    }

    await logAuditEvent(
      currentUser.email,
      currentUser.fullName,
      currentUser.role,
      'EXPORT_REPORT',
      `Extracted PDF Official Report: ${category.toUpperCase()}`,
      'REPORTS',
      env
    );
  };

  const handleExportCSV = async (category: string) => {
    if (!currentUser) return;
    if (category === 'whereabouts') exportCheckInsCSV(checkins, selectedDate);
    else if (category === 'training') exportTrainingCSV(trainingLogs);
    else if (category === 'medical') exportHealthCSV(healthLogs);
    else if (category === 'winloss') exportWinLossCSV(winLossRecords);
    else if (category === 'meals') exportMealCSV(mealLogs, selectedDate);
    else if (category === 'audit') exportAuditCSV(auditLogs);

    await logAuditEvent(
      currentUser.email,
      currentUser.fullName,
      currentUser.role,
      'EXPORT_REPORT',
      `Extracted CSV Raw Data Report: ${category.toUpperCase()}`,
      'REPORTS',
      env
    );
  };

  const filteredAuditLogs = auditLogs.filter(a => {
    if (actionFilter !== 'All' && a.actionType !== actionFilter) return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        a.userEmail.toLowerCase().includes(q) ||
        a.userName.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q) ||
        a.targetEntity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Report Extraction & Audit Trail</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export certified PDF summaries and CSV raw datasets with immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Report Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
          />
        </div>
      </div>

      {/* Export Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Whereabouts & Check-ins */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Whereabouts & Check-Ins</h4>
            <span className="text-xs font-bold text-slate-400">{checkins.length} logs</span>
          </div>
          <p className="text-xs text-slate-500">
            Daily athlete location logs, activity time windows, and headcount verifications.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleExportPDF('whereabouts')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> PDF Report
            </button>
            <button
              onClick={() => handleExportCSV('whereabouts')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> CSV Data
            </button>
          </div>
        </div>

        {/* Training Monitoring */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Training & Drills Coverage</h4>
            <span className="text-xs font-bold text-slate-400">{trainingLogs.length} sessions</span>
          </div>
          <p className="text-xs text-slate-500">
            Practice hours, game simulations, venues, and coach notes across disciplines.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleExportPDF('training')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" /> PDF Report
            </button>
            <button
              onClick={() => handleExportCSV('training')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> CSV Data
            </button>
          </div>
        </div>

        {/* Health & Temperature */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Medical & Temperature</h4>
            <span className="text-xs font-bold text-slate-400">{healthLogs.length} records</span>
          </div>
          <p className="text-xs text-slate-500">
            Body temperature screenings, injury severity, and competition clearances.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleExportPDF('medical')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" /> PDF Report
            </button>
            <button
              onClick={() => handleExportCSV('medical')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> CSV Data
            </button>
          </div>
        </div>

        {/* Win-Loss & Medals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Tournament Win-Loss & Medals</h4>
            <span className="text-xs font-bold text-slate-400">{winLossRecords.length} matches</span>
          </div>
          <p className="text-xs text-slate-500">
            Daily competition scores, podium medal standings, and bracket progressions.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleExportPDF('winloss')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" /> PDF Report
            </button>
            <button
              onClick={() => handleExportCSV('winloss')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> CSV Data
            </button>
          </div>
        </div>

        {/* Meal Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Meal Distribution & Claiming</h4>
            <span className="text-xs font-bold text-slate-400">{mealLogs.length} vouchers</span>
          </div>
          <p className="text-xs text-slate-500">
            Breakfast, Lunch, Dinner, and Snack distribution accountability logs.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleExportPDF('meals')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" /> PDF Report
            </button>
            <button
              onClick={() => handleExportCSV('meals')}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> CSV Data
            </button>
          </div>
        </div>

        {/* System Audit Trail Export */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Full System Audit Trail</h4>
            <span className="text-xs font-bold text-slate-400">{auditLogs.length} events</span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable log of all user logins, submissions, edits, and deletions.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleExportCSV('audit')}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Full Audit CSV
            </button>
          </div>
        </div>

      </div>

      {/* Complete Audit Trail Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Complete Security & Submission Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Automatic logging of all actions for administrative verification
          </span>
        </div>

        {/* Audit Search and Action Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit trail by user, action, or details..."
              className="w-full bg-transparent outline-hidden text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <option value="All">All Audit Actions</option>
              <option value="LOGIN">User Logins</option>
              <option value="SUBMIT_CHECKIN">Check-In Submissions</option>
              <option value="LOG_TRAINING">Training Logs</option>
              <option value="DELETE_RECORD">Data Deletions</option>
              <option value="UPDATE_RECORD">Record Updates</option>
              <option value="USER_MANAGEMENT">User Administration</option>
              <option value="EXPORT_REPORT">Report Extractions</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3">DB Env</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No audit records logged yet in this filter.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.actionType === 'DELETE_RECORD' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' 
                          : log.actionType === 'LOGIN' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      {log.targetEntity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.env === 'live' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}>
                        {log.env}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
