import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Swords, 
  Check, 
  X 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { computeTournamentTally } from '../utils/pureLogic';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SportType, WinLossRecord } from '../types';

export const WinLossView: React.FC = () => {
  const { winLossRecords, saveWinLoss, deleteWinLoss, members } = useData();
  const { currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('2026-12-11');
  const [sport, setSport] = useState<SportType>('Arnis');
  const [athleteOrTeam, setAthleteOrTeam] = useState('');
  const [opponent, setOpponent] = useState('');
  const [roundStage, setRoundStage] = useState('Eliminations');
  const [score, setScore] = useState('');
  const [result, setResult] = useState<WinLossRecord['result']>('Win');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [sportFilter, setSportFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  const tally = computeTournamentTally(winLossRecords);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteOrTeam.trim() || !opponent.trim()) {
      alert('Please fill out athlete/team and opponent names.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveWinLoss({
        date,
        sport,
        athleteOrTeam: athleteOrTeam.trim(),
        opponent: opponent.trim(),
        roundStage,
        score: score.trim() || 'N/A',
        result,
        remarks: remarks.trim(),
        loggedBy: currentUser?.fullName || 'Coach',
      });

      setShowForm(false);
      setAthleteOrTeam('');
      setOpponent('');
      setScore('');
      setRemarks('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteWinLoss(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredRecords = winLossRecords.filter(r => {
    if (sportFilter !== 'All' && r.sport !== sportFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.athleteOrTeam.toLowerCase().includes(q) ||
        r.opponent.toLowerCase().includes(q) ||
        r.sport.toLowerCase().includes(q) ||
        r.roundStage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Win-Loss Updates</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
              Tournament Standings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily match scores, tournament bracket progressions, and medals won by Bais City athletes.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close Entry Form' : 'Record New Match Result'}
        </button>
      </div>

      {/* Official Medal & Standing Board */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-300 dark:border-amber-700/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
            <span>Gold Medals</span>
            <span className="text-lg">🥇</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-200 mt-1">
            {tally.gold}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Champions</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-400/20 border border-slate-300 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
            <span>Silver Medals</span>
            <span className="text-lg">🥈</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
            {tally.silver}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">1st Runners Up</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-400/20 to-amber-600/10 border border-orange-300 dark:border-orange-800/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-orange-800 dark:text-orange-300 uppercase">
            <span>Bronze Medals</span>
            <span className="text-lg">🥉</span>
          </div>
          <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-200 mt-1">
            {tally.bronze}
          </div>
          <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">Podium Finishers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Win Rate</span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {tally.winRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {tally.wins}W - {tally.losses}L - {tally.draws}D
          </p>
        </div>
      </div>

      {/* Match Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-amber-500/50 dark:border-amber-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Tournament Result</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Match Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sport
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value="Arnis">Arnis</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Athletics">Athletics</option>
                <option value="Futsal">Futsal</option>
                <option value="3x3 Basketball">3x3 Basketball</option>
                <option value="Beach Volleyball">Beach Volleyball</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Round / Tournament Stage
              </label>
              <select
                value={roundStage}
                onChange={(e) => setRoundStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value="Eliminations">Eliminations / Preliminaries</option>
                <option value="Quarterfinals">Quarterfinals</option>
                <option value="Semifinals">Semifinals</option>
                <option value="Finals / Gold Match">Finals / Gold Match</option>
                <option value="Bronze Medal Match">Bronze Medal Match</option>
                <option value="Ranking Round">Ranking Round / Heats</option>
              </select>
            </div>

            {/* Bais Athlete or Team */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Bais City Athlete / Team
              </label>
              <input
                type="text"
                required
                value={athleteOrTeam}
                onChange={(e) => setAthleteOrTeam(e.target.value)}
                placeholder="e.g. John Mark Cabanlit or Bais 3x3 Team A"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Opponent Delegation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Opponent LGU / Athlete
              </label>
              <input
                type="text"
                required
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="e.g. Cebu City, Davao City, Bacolod"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Score / Points
              </label>
              <input
                type="text"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 5 - 2, 21-17 / 21-19, 10.84s"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
              />
            </div>

            {/* Result */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Match Result
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
              >
                <option value="Win">🏆 Win (Victory)</option>
                <option value="Loss">Loss</option>
                <option value="Draw">Draw / Tie</option>
                <option value="Gold">🥇 GOLD MEDAL (Champion)</option>
                <option value="Silver">🥈 SILVER MEDAL</option>
                <option value="Bronze">🥉 BRONZE MEDAL</option>
                <option value="Medal Match">Medal Match</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Match Highlights / Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Dominant performance in 3rd round, qualified for national finals."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Submit Match Result'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by athlete, opponent, or tournament round..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="All">All Disciplines</option>
            <option value="Arnis">Arnis</option>
            <option value="Taekwondo">Taekwondo</option>
            <option value="Athletics">Athletics</option>
            <option value="Futsal">Futsal</option>
            <option value="3x3 Basketball">3x3 Basketball</option>
            <option value="Beach Volleyball">Beach Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
          </select>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Match Results Recorded</h3>
            <p className="text-xs text-slate-400 mt-1">
              {winLossRecords.length === 0 
                ? 'Clean build-up database. Click "Record New Match Result" to log daily competition outcomes.' 
                : 'No results match your filter.'}
            </p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const isWin = r.result === 'Win' || r.result === 'Gold';
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      r.result === 'Gold' 
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600' 
                        : isWin 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {r.athleteOrTeam} <span className="font-normal text-slate-400">vs</span> {r.opponent}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {r.sport}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.result === 'Gold' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                          r.result === 'Silver' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                          r.result === 'Bronze' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300' :
                          isWin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                        }`}>
                          {r.result.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Stage: <strong className="text-slate-700 dark:text-slate-300">{r.roundStage}</strong> • Final Score: <strong className="font-mono text-slate-800 dark:text-slate-200">{r.score}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{r.date}</div>
                      <div className="text-[11px] text-slate-500">Logged by {r.loggedBy}</div>
                    </div>

                    <button
                      onClick={() => setDeleteTarget({ id: r.id, desc: `${r.athleteOrTeam} vs ${r.opponent}` })}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                      title="Delete Match Record"
                      aria-label={`Delete match ${r.athleteOrTeam} vs ${r.opponent}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {r.remarks && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Remarks:</span> {r.remarks}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Erase Tournament Match Result"
        itemName={deleteTarget?.desc || 'Match'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
