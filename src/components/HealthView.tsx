import React, { useState } from 'react';
import { 
  HeartPulse, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  ShieldAlert, 
  Activity, 
  X 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { HealthRecord, SportType } from '../types';

export const HealthView: React.FC = () => {
  const { members, healthLogs, logHealth, deleteHealthLog } = useData();
  const { currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState('2026-12-10');
  const [time, setTime] = useState('08:00');
  const [temperature, setTemperature] = useState(36.5);
  const [hasInjury, setHasInjury] = useState(false);
  const [injuryType, setInjuryType] = useState('Ankle Sprain');
  const [severity, setSeverity] = useState<HealthRecord['severity']>('Mild');
  const [bodyPart, setBodyPart] = useState('Right Ankle');
  const [clearedToPlay, setClearedToPlay] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Holds' | 'Cleared'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  const selectedMember = members.find(m => m.id === memberId);

  const handleOpenCreate = () => {
    if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('Please select an athlete or delegation member.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logHealth({
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        sport: selectedMember.sport,
        date,
        time,
        temperature: Number(temperature),
        hasInjury,
        injuryType: hasInjury ? injuryType : undefined,
        severity: hasInjury ? severity : 'None',
        bodyPart: hasInjury ? bodyPart : undefined,
        clearedToPlay: hasInjury ? clearedToPlay : true,
        notes: notes.trim(),
        loggedBy: currentUser?.fullName || 'Medical Staff',
      });

      setShowForm(false);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteHealthLog(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredLogs = healthLogs.filter(h => {
    if (statusFilter === 'Holds' && h.clearedToPlay) return false;
    if (statusFilter === 'Cleared' && !h.clearedToPlay) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.memberName.toLowerCase().includes(q) ||
        h.sport.toLowerCase().includes(q) ||
        (h.injuryType && h.injuryType.toLowerCase().includes(q))
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Temperature & Injury Monitoring</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
              Delegation Medical Care
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time daily temperature checks, injury assessments, and medical clearances for competition readiness.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close Health Form' : 'Log Temperature / Injury'}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-rose-500/50 dark:border-rose-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">New Health & Temperature Check</h3>
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
            
            {/* Athlete Selection */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Select Athlete / Delegation Member
              </label>
              <select
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
              >
                <option value="" disabled>Choose member from registry...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.role} - {m.sport}) - {m.billetingRoom}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date & Time
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>
            </div>

            {/* Temperature (°C) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Body Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="34"
                  max="43"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 36.5)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">°C</span>
              </div>
              <span className={`text-[10px] font-bold mt-1 block ${
                temperature >= 37.8 ? 'text-red-600' : temperature >= 37.3 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {temperature >= 37.8 ? '⚠️ High Fever Warning' : temperature >= 37.3 ? '⚠️ Elevated Temperature' : '✓ Normal Body Temperature'}
              </span>
            </div>

            {/* Injury Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Injury / Ailment Observed?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasInjury(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    !hasInjury 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  No Injury (Fit)
                </button>
                <button
                  type="button"
                  onClick={() => setHasInjury(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    hasInjury 
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Report Injury
                </button>
              </div>
            </div>

            {/* Cleared to play */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Medical Clearance Status
              </label>
              <select
                value={clearedToPlay ? 'cleared' : 'hold'}
                onChange={(e) => setClearedToPlay(e.target.value === 'cleared')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden font-bold"
              >
                <option value="cleared">✅ Cleared to Play & Compete</option>
                <option value="hold">⛔ MEDICAL HOLD (Cannot Compete)</option>
              </select>
            </div>

          </div>

          {/* Injury Specifics */}
          {hasInjury && (
            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Injury Specifics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Injury Type
                  </label>
                  <select
                    value={injuryType}
                    onChange={(e) => setInjuryType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Ankle Sprain">Ankle Sprain</option>
                    <option value="Muscle Strain">Muscle Strain / Pull</option>
                    <option value="Knee Contusion">Knee Contusion / Ligament</option>
                    <option value="Wrist / Finger Jam">Wrist / Finger Jam</option>
                    <option value="Laceration / Cut">Laceration / Cut</option>
                    <option value="Severe Cramping">Severe Cramping</option>
                    <option value="Concussion Evaluation">Concussion Evaluation</option>
                    <option value="Dehydration / Exhaustion">Dehydration / Exhaustion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mild">Mild (Can participate with tape)</option>
                    <option value="Moderate">Moderate (Requires observation)</option>
                    <option value="Severe">Severe (Strict rest / Hospital)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Body Part / Location
                  </label>
                  <input
                    type="text"
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
                    placeholder="e.g. Left Knee, Right Shoulder"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Medical Notes & Treatment Given
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Applied cold compress and compression bandage; advised 24hr rest."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden"
            />
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
              disabled={isSubmitting || !selectedMember}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Record Health Check'}
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
            placeholder="Search by athlete name, sport, or injury..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="All">All Health Logs</option>
            <option value="Holds">Medical Holds Only</option>
            <option value="Cleared">Cleared to Play Only</option>
          </select>
        </div>
      </div>

      {/* Health Records List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <HeartPulse className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Health or Temperature Records</h3>
            <p className="text-xs text-slate-400 mt-1">
              {healthLogs.length === 0 
                ? 'Clean build-up database. Click "Log Temperature / Injury" to start medical monitoring.' 
                : 'No records match your search filter.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    log.hasInjury 
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400' 
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {log.hasInjury ? <AlertTriangle className="w-5 h-5" /> : <Thermometer className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{log.memberName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.sport}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.clearedToPlay 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        {log.clearedToPlay ? 'Cleared to Play' : 'MEDICAL HOLD'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Temperature: <strong className="font-mono text-slate-800 dark:text-slate-200">{log.temperature}°C</strong>
                      {log.hasInjury && ` • Injury: ${log.injuryType} (${log.severity})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{log.date} at {log.time}</div>
                    <div className="text-[11px] text-slate-500">Logged by {log.loggedBy}</div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ id: log.id, desc: `Health record for ${log.memberName}` })}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Delete Health Record"
                    aria-label={`Delete health record for ${log.memberName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {log.notes && (
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Notes:</span> {log.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Erase Health Record"
        itemName={deleteTarget?.desc || 'Health Record'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
