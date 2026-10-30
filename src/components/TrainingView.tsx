import React, { useState } from 'react';
import { 
  Dumbbell, 
  Clock, 
  Calendar, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  Award, 
  Timer 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { calculateDurationMinutes, computeTrainingSummary } from '../utils/pureLogic';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SportType, TrainingRecord } from '../types';

export const TrainingView: React.FC = () => {
  const { members, trainingLogs, saveTraining, deleteTraining } = useData();
  const { currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState('2026-12-10');
  const [sport, setSport] = useState<SportType>(
    currentUser?.sport && currentUser.sport !== 'General' ? currentUser.sport : 'Arnis'
  );
  const [drillFocus, setDrillFocus] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('09:00');
  const [venue, setVenue] = useState('Main Sports Complex Hall B');
  const [coachInCharge, setCoachInCharge] = useState(currentUser?.fullName || 'Coach Roberto Aguilar');
  const [notes, setNotes] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filters
  const [sportFilter, setSportFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  // Computed duration
  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const durationHours = (durationMinutes / 60).toFixed(1);

  // Athletes for the current sport
  const sportAthletes = members.filter(m => m.role === 'Athlete' && (m.sport === sport || sport === 'General'));

  const handleOpenCreate = () => {
    setEditingId(null);
    setDrillFocus('');
    setStartTime('07:00');
    setEndTime('09:00');
    setNotes('');
    setSelectedAthletes([]);
    setShowForm(true);
  };

  const handleOpenEdit = (t: TrainingRecord) => {
    setEditingId(t.id);
    setDate(t.date);
    setSport(t.sport);
    setDrillFocus(t.drillFocus);
    setStartTime(t.startTime);
    setEndTime(t.endTime);
    setVenue(t.venue);
    setCoachInCharge(t.coachInCharge);
    setNotes(t.notes);
    setSelectedAthletes(t.participatingAthletes || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillFocus.trim()) {
      alert('Please specify the drill focus or training game.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveTraining({
        date,
        sport,
        drillFocus: drillFocus.trim(),
        startTime,
        endTime,
        durationMinutes,
        venue: venue.trim(),
        participantCount: selectedAthletes.length || 1,
        participatingAthletes: selectedAthletes,
        coachInCharge: coachInCharge.trim(),
        notes: notes.trim(),
      }, editingId || undefined);

      handleCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTraining(deleteTarget.id);
    setDeleteTarget(null);
  };

  const summary = computeTrainingSummary(trainingLogs);

  // Filtered logs
  const filteredLogs = trainingLogs.filter(t => {
    if (sportFilter !== 'All' && t.sport !== sportFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.drillFocus.toLowerCase().includes(q) ||
        t.coachInCharge.toLowerCase().includes(q) ||
        t.venue.toLowerCase().includes(q) ||
        t.sport.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Training & Practice Monitoring</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              Coverage & Drills
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track athlete drills, practice time coverage, and training duration with full edit, cancel, and delete controls.
          </p>
        </div>

        <button
          onClick={showForm ? handleCancel : handleOpenCreate}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel Entry' : 'Log New Training Session'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Practice Hours</span>
            <Timer className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.totalHours} <span className="text-xs font-normal text-slate-500">hours</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">({summary.totalMinutes} total minutes)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sessions Completed</span>
            <Dumbbell className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {summary.sessionsCount} <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded and verified by coaches</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Disciplines Active</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {Object.keys(summary.hoursBySport).length} / 8 <span className="text-xs font-normal text-slate-500">sports</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Batang Pinoy 2026 Sports</p>
        </div>
      </div>

      {/* Training Submission & Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-purple-500/50 dark:border-purple-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingId ? 'Edit Practice Session' : 'Record New Practice & Drill Session'}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Practice Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sport / Discipline
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
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

            {/* Drill Focus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Drill Focus / Game Simulation
              </label>
              <input
                type="text"
                required
                value={drillFocus}
                onChange={(e) => setDrillFocus(e.target.value)}
                placeholder="e.g. Anyo Cadence, Counter Kicking, 3v3 Sets"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            {/* Time Coverage (Start and End) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Time Coverage (Start - End)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1 block">
                Calculated Duration: {durationMinutes} mins ({durationHours} hrs)
              </span>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Practice Venue / Facility
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Sports Complex Hall B, Track Oval"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            {/* Coach in Charge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Coach in Charge
              </label>
              <input
                type="text"
                required
                value={coachInCharge}
                onChange={(e) => setCoachInCharge(e.target.value)}
                placeholder="Coach Full Name"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

          </div>

          {/* Participating Athletes Multi-Select */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Participating Athletes ({selectedAthletes.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setSelectedAthletes(sportAthletes.map(a => a.fullName))}
                className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
              >
                Select All {sport} Athletes
              </button>
            </div>

            {sportAthletes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No registered athletes found for {sport}.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                {sportAthletes.map(athlete => {
                  const isChecked = selectedAthletes.includes(athlete.fullName);
                  return (
                    <label
                      key={athlete.id}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2 select-none ${
                        isChecked 
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-900 dark:text-purple-200 font-bold' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedAthletes(prev =>
                            prev.includes(athlete.fullName)
                              ? prev.filter(x => x !== athlete.fullName)
                              : [...prev, athlete.fullName]
                          );
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="truncate">{athlete.fullName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Drill Execution Notes & Coach Feedback
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record drill performance, physical conditioning status, or points of improvement..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden resize-none"
            />
          </div>

          {/* Action buttons (Cancel, Save/Submit) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving Session...' : editingId ? 'Update Session' : 'Submit & Record Session'}
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
            placeholder="Search drills, sport, coach, or venue..."
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

      {/* Recorded Training Sessions List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Training Sessions Recorded</h3>
            <p className="text-xs text-slate-400 mt-1">
              {trainingLogs.length === 0 
                ? 'Clean build-up database. Click "Log New Training Session" to record practice drills and duration.' 
                : 'No training logs match the selected filter.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{item.drillFocus}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        {item.sport}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {item.venue}
                    </p>
                  </div>
                </div>

                {/* Time Coverage & Buttons (Edit & Delete) */}
                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{item.startTime} - {item.endTime} ({item.durationMinutes} mins)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{item.date}</div>
                  </div>

                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors"
                      title="Edit Training Log"
                      aria-label={`Edit ${item.drillFocus}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => setDeleteTarget({ id: item.id, desc: `${item.drillFocus} (${item.sport})` })}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                      title="Delete Training Log"
                      aria-label={`Delete ${item.drillFocus}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Athletes & Coach */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Coach in charge: <strong className="text-slate-800 dark:text-slate-200">{item.coachInCharge}</strong></span>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Participants ({item.participantCount || (item.participatingAthletes?.length || 0)}):
                  </span>{' '}
                  <span className="text-slate-500">
                    {item.participatingAthletes && item.participatingAthletes.length > 0 
                      ? item.participatingAthletes.join(', ') 
                      : 'All team athletes'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Coach Feedback:</span> {item.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Erase Training Session"
        itemName={deleteTarget?.desc || 'Training Session'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
