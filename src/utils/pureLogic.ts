import { DelegationMember, MealRecord, WinLossRecord, CheckInRecord, TrainingRecord } from '../types';

/**
 * Calculates duration in minutes from HH:MM start and end times.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  const startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;
  
  // If practice spans past midnight
  if (endTotal < startTotal) {
    endTotal += 24 * 60;
  }
  
  return Math.max(0, endTotal - startTotal);
}

/**
 * Validates if a date falls within the 2026 Batang Pinoy tournament window (Dec 10 - 19, 2026)
 * Or general test dates in practice mode.
 */
export function isWithinBatangPinoyWindow(dateStr: string): boolean {
  if (!dateStr) return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  if (year !== 2026 || month !== 12) return false;
  return day >= 10 && day <= 19;
}

/**
 * Computes medal and win-loss statistics for Bais City delegation
 */
export function computeTournamentTally(records: WinLossRecord[]) {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let gold = 0;
  let silver = 0;
  let bronze = 0;

  for (const r of records) {
    if (r.result === 'Win') wins++;
    else if (r.result === 'Loss') losses++;
    else if (r.result === 'Draw') draws++;
    else if (r.result === 'Gold') { gold++; wins++; }
    else if (r.result === 'Silver') { silver++; }
    else if (r.result === 'Bronze') { bronze++; }
  }

  const totalMatches = wins + losses + draws;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const totalMedals = gold + silver + bronze;

  return { wins, losses, draws, gold, silver, bronze, totalMatches, winRate, totalMedals };
}

/**
 * Computes meal claiming statistics by meal type
 */
export function computeMealStats(meals: MealRecord[], targetRole?: string) {
  const filtered = targetRole ? meals.filter(m => m.memberRole === targetRole) : meals;
  const total = filtered.length;
  const claimed = filtered.filter(m => m.claimed).length;
  const pending = total - claimed;
  const claimRate = total > 0 ? Math.round((claimed / total) * 100) : 0;

  const byType: Record<string, { total: number; claimed: number; pending: number }> = {
    Breakfast: { total: 0, claimed: 0, pending: 0 },
    Lunch: { total: 0, claimed: 0, pending: 0 },
    Dinner: { total: 0, claimed: 0, pending: 0 },
    'PM Snack': { total: 0, claimed: 0, pending: 0 },
  };

  for (const m of filtered) {
    if (byType[m.mealType]) {
      byType[m.mealType].total++;
      if (m.claimed) {
        byType[m.mealType].claimed++;
      } else {
        byType[m.mealType].pending++;
      }
    }
  }

  return { total, claimed, pending, claimRate, byType };
}

/**
 * Filter members based on a search query across name, sport, role, room, accreditation
 */
export function searchMembers(members: DelegationMember[], query: string, sportFilter?: string, roleFilter?: string): DelegationMember[] {
  const q = query.trim().toLowerCase();
  return members.filter(m => {
    if (sportFilter && sportFilter !== 'All' && m.sport !== sportFilter) return false;
    if (roleFilter && roleFilter !== 'All' && m.role !== roleFilter) return false;
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.sport.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.billetingRoom.toLowerCase().includes(q) ||
      m.accreditationNumber.toLowerCase().includes(q)
    );
  });
}

/**
 * Calculate total training coverage hours and drills count
 */
export function computeTrainingSummary(trainings: TrainingRecord[]) {
  const totalMinutes = trainings.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const sessionsCount = trainings.length;

  const hoursBySport: Record<string, number> = {};
  for (const t of trainings) {
    hoursBySport[t.sport] = (hoursBySport[t.sport] || 0) + (t.durationMinutes || 0) / 60;
  }

  return { totalMinutes, totalHours, sessionsCount, hoursBySport };
}
