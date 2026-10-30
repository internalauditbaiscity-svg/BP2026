import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { computeMealStats } from '../utils/pureLogic';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export const MealView: React.FC = () => {
  const { members, mealLogs, claimMeal, batchCreateMealsForDate, deleteMealRecord } = useData();
  const { currentUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState('2026-12-10');
  const [activeMealType, setActiveMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'PM Snack'>('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string } | null>(null);

  // Meals for this date & type
  const currentMeals = mealLogs.filter(m => m.date === selectedDate && m.mealType === activeMealType);
  const stats = computeMealStats(currentMeals);

  const handleGenerateRoster = async () => {
    setIsGenerating(true);
    try {
      const count = await batchCreateMealsForDate(selectedDate, activeMealType);
      alert(`Generated ${count} meal claiming records for active delegation members.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleClaim = async (id: string, currentClaimed: boolean) => {
    await claimMeal(id, !currentClaimed, currentUser?.fullName || 'Mess Hall Staff');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMealRecord(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredMeals = currentMeals.filter(m => {
    if (roleFilter !== 'All' && m.memberRole !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.memberName.toLowerCase().includes(q) ||
        m.sport.toLowerCase().includes(q) ||
        m.memberRole.toLowerCase().includes(q)
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Meal Distribution & Claiming</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
              Catering & Mess Hall
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily meal claiming of athletes, coaches, chaperones, and delegation officials.
          </p>
        </div>

        <button
          onClick={handleGenerateRoster}
          disabled={isGenerating || members.length === 0}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Generating...' : `Generate Roster for ${activeMealType}`}
        </button>
      </div>

      {/* Date & Meal Type Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['Breakfast', 'Lunch', 'Dinner', 'PM Snack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveMealType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeMealType === type
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Meals Claimed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.claimed} / {stats.total}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.claimRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Unclaimed / Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {stats.pending}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting meal collection</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Claim Percentage</span>
            <UtensilsCrossed className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats.claimRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Overall distribution completion</p>
        </div>
      </div>

      {/* Search and Role Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name or sport..."
            className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="All">All Delegation Roles</option>
            <option value="Athlete">Athletes</option>
            <option value="Coach">Coaches</option>
            <option value="Chaperone">Chaperones</option>
            <option value="Medical Staff">Medical Staff</option>
            <option value="Delegation Official">Delegation Officials</option>
          </select>
        </div>
      </div>

      {/* Claiming Cards */}
      <div className="space-y-2">
        {filteredMeals.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No Meal Records for {activeMealType} on {selectedDate}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click "Generate Roster for {activeMealType}" above to instantly populate meal claiming vouchers for the delegation.
            </p>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                meal.claimed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleClaim(meal.id, meal.claimed)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    meal.claimed 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                  }`}
                  aria-label={`Toggle claim for ${meal.memberName}`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{meal.memberName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {meal.memberRole}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {meal.sport}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {meal.claimed ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        ✓ Claimed at {meal.claimedAt} {meal.claimedBy ? `(by ${meal.claimedBy})` : ''}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Awaiting Claim / Voucher Active
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleClaim(meal.id, meal.claimed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    meal.claimed
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {meal.claimed ? 'Mark Unclaimed' : 'Claim Meal'}
                </button>

                <button
                  onClick={() => setDeleteTarget({ id: meal.id, desc: `${meal.memberName}'s ${meal.mealType}` })}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  title="Delete Meal Record"
                  aria-label={`Delete meal for ${meal.memberName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Erase Meal Record"
        itemName={deleteTarget?.desc || 'Meal'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
