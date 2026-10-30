import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Check, 
  X,
  Send,
  Building,
  Activity
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SportType } from '../types';

const COMMON_LOCATIONS = [
  'Billeting Quarters (Bais Delegation Hotel)',
  'Main Stadium & Track Oval',
  'Multi-Purpose Sports Complex (Arnis / Taekwondo)',
  'Beach Volleyball Coastal Court',
  'Basketball 3x3 Outdoor Arena',
  'Futsal Arena',
  'Badminton Hall',
  'Delegation Dining & Mess Hall',
  'Delegation Medical Clinic',
  'Transit Bus / Delegation Transport',
  'Opening / Closing Ceremony Grounds',
];

const COMMON_ACTIVITIES = [
  'Morning Call & Breakfast Headcount',
  'Morning Warm-up & Cadence Drills',
  'Tournament Bout / Competition Match',
  'Post-Match Recovery & Ice Bath',
  'Lunch Claiming & Midday Rest',
  'PM Conditioning & Tactical Drills',
  'Dinner Claiming & Delegation Debrief',
  'Evening Team Meeting',
  'Night Curfew & Billet Headcount (10:00 PM)',
];

export const CheckInView: React.FC = () => {
  const { members, checkins, submitCheckIn, deleteCheckIn } = useData();
  const { currentUser, isAdmin } = useAuth();
  const { env } = useDatabaseEnv();

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('2026-12-10');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:30');
  const [timeWindowStr, setTimeWindowStr] = useState('06:00 AM - 07:30 AM');
  const [location, setLocation] = useState(COMMON_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [activity, setActivity] = useState(COMMON_ACTIVITIES[0]);
  const [customActivity, setCustomActivity] = useState('');
  const [sport, setSport] = useState<SportType>(
    currentUser?.sport && currentUser.sport !== 'General' ? currentUser.sport : 'Arnis'
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters for timeline
  const [dateFilter, setDateFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  // Filter members available for the selected sport or all
  const availableMembers = members.filter(m => {
    if (sport === 'General') return true;
    return m.sport === sport || m.role === 'Coach' || m.role === 'Chaperone';
  });

  const handleSelectAllSportMembers = () => {
    const ids = availableMembers.map(m => m.id);
    setSelectedMemberIds(ids);
  };

  const handleDeselectAll = () => {
    setSelectedMemberIds([]);
  };

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setTimeWindowStr(`${newStart} - ${endTime}`);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    setTimeWindowStr(`${startTime} - ${newEnd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one athlete or delegation member for this check-in.');
      return;
    }

    const selectedMembers = members.filter(m => selectedMemberIds.includes(m.id));
    const participantNames = selectedMembers.map(m => m.fullName);

    setIsSubmitting(true);
    try {
      await submitCheckIn({
        date,
        timeWindow: timeWindowStr || `${startTime} - ${endTime}`,
        location: location === 'Other / Custom Location' ? customLocation : location,
        activity: activity === 'Other / Custom Activity' ? customActivity : activity,
        participantIds: selectedMemberIds,
        participantNames,
        sport,
        remarks,
        submittedBy: currentUser?.fullName || 'Delegation Staff',
        submittedByRole: currentUser?.role || 'Coach',
      });

      // Reset form
      setSelectedMemberIds([]);
      setRemarks('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCheckIn(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Filtered checkins
  const filteredCheckins = checkins.filter(c => {
    if (dateFilter && c.date !== dateFilter) return false;
    if (sportFilter !== 'All' && c.sport !== sportFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchLoc = c.location.toLowerCase().includes(q);
      const matchAct = c.activity.toLowerCase().includes(q);
      const matchSubmit = c.submittedBy.toLowerCase().includes(q);
      const matchAthletes = c.participantNames?.some(name => name.toLowerCase().includes(q));
      if (!matchLoc && !matchAct && !matchSubmit && !matchAthletes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Whereabouts & Check-In Log</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log athlete whereabouts, activity windows, and locations across Dec 10-19, 2026.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close Entry Form' : 'New Whereabouts Check-In'}
        </button>
      </div>

      {/* Check-In Submission Form (Multi-Athlete Entry) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              New Whereabouts Check-In Submission
            </h3>
            <span className="text-xs text-slate-500">Multiple athlete batch entry supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Date Window */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Batang Pinoy: Dec 10-19, 2026</span>
            </div>

            {/* Time Window */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Time Window (Start & End)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <input
                type="text"
                value={timeWindowStr}
                onChange={(e) => setTimeWindowStr(e.target.value)}
                placeholder="e.g. 06:00 AM - 07:30 AM"
                className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300"
              />
            </div>

            {/* Sport Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sport / Team
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="Arnis">Arnis</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Athletics">Athletics</option>
                <option value="Futsal">Futsal</option>
                <option value="3x3 Basketball">3x3 Basketball</option>
                <option value="Beach Volleyball">Beach Volleyball</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="General">General Delegation</option>
              </select>
            </div>

            {/* Location */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Location / Facility
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                {COMMON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other / Custom Location">Other / Custom Location...</option>
              </select>

              {location === 'Other / Custom Location' && (
                <input
                  type="text"
                  required
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Specify venue or location name..."
                  className="mt-2 w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              )}
            </div>

            {/* Activity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Activity
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                {COMMON_ACTIVITIES.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
                <option value="Other / Custom Activity">Other / Custom Activity...</option>
              </select>

              {activity === 'Other / Custom Activity' && (
                <input
                  type="text"
                  required
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="Specify activity..."
                  className="mt-2 w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              )}
            </div>

          </div>

          {/* Multiple Athlete Entry Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Athletes & Members to Check In ({selectedMemberIds.length} selected)
                </label>
                <p className="text-[11px] text-slate-500">Tick multiple athletes for a single check-in submission</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllSportMembers}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  Select All ({availableMembers.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {availableMembers.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500">
                No members found for {sport}. Please register athletes in the Registry tab first or switch sport.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                {availableMembers.map((m) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMemberSelection(m.id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{m.fullName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal ml-1">
                        {m.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Whereabouts Notes & Status Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. All arrived on time, no injuries, hydrated and in uniform."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Action buttons */}
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
              disabled={isSubmitting || selectedMemberIds.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting to Cloud...' : `Submit Check-In (${selectedMemberIds.length} Athletes)`}
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by venue, activity, athlete name, or submitter..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="All">All Sports</option>
            <option value="Arnis">Arnis</option>
            <option value="Taekwondo">Taekwondo</option>
            <option value="Athletics">Athletics</option>
            <option value="Futsal">Futsal</option>
            <option value="3x3 Basketball">3x3 Basketball</option>
            <option value="Beach Volleyball">Beach Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="General">General</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Whereabouts Submissions Timeline */}
      <div className="space-y-3">
        {filteredCheckins.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Whereabouts Records Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {checkins.length === 0 
                ? 'The database is currently clean. Click "New Whereabouts Check-In" to log team locations.' 
                : 'No check-ins match your current filters.'}
            </p>
          </div>
        ) : (
          filteredCheckins.map((chk) => (
            <div
              key={chk.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{chk.location}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {chk.sport}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{chk.activity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{chk.timeWindow}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{chk.date}</div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ id: chk.id, desc: `${chk.location} (${chk.timeWindow})` })}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                    title="Delete Check-In Record"
                    aria-label={`Delete check-in at ${chk.location}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Athletes checked in */}
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Checked-in Athletes & Staff ({chk.participantNames?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {chk.participantNames?.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Remarks & Submitter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60 gap-1">
                <div>
                  {chk.remarks ? (
                    <span className="italic text-slate-700 dark:text-slate-300">"{chk.remarks}"</span>
                  ) : (
                    <span>No additional remarks.</span>
                  )}
                </div>
                <div className="text-[11px]">
                  Submitted by: <strong className="text-slate-700 dark:text-slate-200">{chk.submittedBy}</strong> ({chk.submittedByRole})
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Erase Whereabouts Check-In"
        itemName={deleteTarget?.desc || 'Check-in'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
