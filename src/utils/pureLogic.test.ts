import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDurationMinutes,
  isWithinBatangPinoyWindow,
  computeTournamentTally,
  computeMealStats,
  searchMembers,
  computeTrainingSummary
} from './pureLogic';
import { DelegationMember, WinLossRecord, MealRecord, TrainingRecord } from '../types';

test('calculateDurationMinutes calculates correct duration', () => {
  assert.equal(calculateDurationMinutes('08:00', '10:30'), 150);
  assert.equal(calculateDurationMinutes('14:15', '15:45'), 90);
  assert.equal(calculateDurationMinutes('09:00', '09:00'), 0);
  assert.equal(calculateDurationMinutes('23:00', '01:00'), 120); // Spans midnight
  assert.equal(calculateDurationMinutes('', '10:00'), 0);
});

test('isWithinBatangPinoyWindow correctly validates tournament dates (Dec 10-19 2026)', () => {
  assert.equal(isWithinBatangPinoyWindow('2026-12-10'), true);
  assert.equal(isWithinBatangPinoyWindow('2026-12-15'), true);
  assert.equal(isWithinBatangPinoyWindow('2026-12-19'), true);
  assert.equal(isWithinBatangPinoyWindow('2026-12-09'), false);
  assert.equal(isWithinBatangPinoyWindow('2026-12-20'), false);
  assert.equal(isWithinBatangPinoyWindow('2025-12-15'), false);
});

test('computeTournamentTally correctly aggregates medals and wins', () => {
  const records: WinLossRecord[] = [
    { id: '1', date: '2026-12-11', sport: 'Arnis', athleteOrTeam: 'Juan Santos', opponent: 'Cebu City', roundStage: 'Finals', score: '5-2', result: 'Gold', remarks: 'Champion', loggedBy: 'Coach', env: 'live', createdAt: '' },
    { id: '2', date: '2026-12-12', sport: 'Taekwondo', athleteOrTeam: 'Maria Clara', opponent: 'Iloilo City', roundStage: 'Finals', score: '12-14', result: 'Silver', remarks: 'Silver medal', loggedBy: 'Coach', env: 'live', createdAt: '' },
    { id: '3', date: '2026-12-13', sport: 'Athletics', athleteOrTeam: 'Pedro Penduko', opponent: 'Bacolod', roundStage: 'Prelims', score: '1st', result: 'Win', remarks: '', loggedBy: 'Coach', env: 'live', createdAt: '' },
    { id: '4', date: '2026-12-14', sport: 'Futsal', athleteOrTeam: 'Bais Team A', opponent: 'Davao City', roundStage: 'Group', score: '1-3', result: 'Loss', remarks: '', loggedBy: 'Coach', env: 'live', createdAt: '' },
  ];

  const tally = computeTournamentTally(records);
  assert.equal(tally.gold, 1);
  assert.equal(tally.silver, 1);
  assert.equal(tally.bronze, 0);
  assert.equal(tally.totalMedals, 2);
  assert.equal(tally.wins, 2); // Gold counts as win + Win
  assert.equal(tally.losses, 1);
});

test('computeMealStats calculates claiming percentages', () => {
  const meals: MealRecord[] = [
    { id: '1', date: '2026-12-10', mealType: 'Breakfast', memberId: 'm1', memberName: 'Athlete 1', memberRole: 'Athlete', sport: 'Arnis', claimed: true, env: 'live' },
    { id: '2', date: '2026-12-10', mealType: 'Breakfast', memberId: 'm2', memberName: 'Athlete 2', memberRole: 'Athlete', sport: 'Arnis', claimed: false, env: 'live' },
    { id: '3', date: '2026-12-10', mealType: 'Lunch', memberId: 'm1', memberName: 'Athlete 1', memberRole: 'Athlete', sport: 'Arnis', claimed: true, env: 'live' },
  ];

  const stats = computeMealStats(meals);
  assert.equal(stats.total, 3);
  assert.equal(stats.claimed, 2);
  assert.equal(stats.pending, 1);
  assert.equal(stats.claimRate, 67);
  assert.equal(stats.byType['Breakfast'].claimed, 1);
  assert.equal(stats.byType['Breakfast'].pending, 1);
});

test('searchMembers filters properly by term, sport, and role', () => {
  const members: DelegationMember[] = [
    { id: '1', fullName: 'Carlos Yulo Jr', role: 'Athlete', sport: 'Taekwondo', gender: 'Male', age: 15, billetingRoom: 'Room 204', emergencyContact: '09123456789', accreditationNumber: 'BP-BAIS-001', status: 'Active', env: 'live', createdAt: '' },
    { id: '2', fullName: 'Elena Toribio', role: 'Coach', sport: 'Arnis', gender: 'Female', age: 34, billetingRoom: 'Room 101', emergencyContact: '09187654321', accreditationNumber: 'BP-BAIS-002', status: 'Active', env: 'live', createdAt: '' },
    { id: '3', fullName: 'Dr. Roberto Cruz', role: 'Medical Staff', sport: 'General', gender: 'Male', age: 42, billetingRoom: 'Clinic Station', emergencyContact: '09171112233', accreditationNumber: 'BP-BAIS-003', status: 'Active', env: 'live', createdAt: '' },
  ];

  // Search by name
  assert.equal(searchMembers(members, 'Carlos').length, 1);
  // Search by room
  assert.equal(searchMembers(members, '204').length, 1);
  // Search by sport
  assert.equal(searchMembers(members, '', 'Arnis').length, 1);
  // Search by role
  assert.equal(searchMembers(members, '', 'All', 'Medical Staff').length, 1);
});

test('computeTrainingSummary calculates hours and sessions', () => {
  const trainings: TrainingRecord[] = [
    { id: '1', date: '2026-12-10', sport: 'Arnis', drillFocus: 'Anyo Drills', startTime: '06:00', endTime: '08:00', durationMinutes: 120, venue: 'Gym', participantCount: 6, participatingAthletes: [], coachInCharge: 'Coach Elena', notes: '', env: 'live', createdAt: '' },
    { id: '2', date: '2026-12-10', sport: 'Taekwondo', drillFocus: 'Kicking Combos', startTime: '15:00', endTime: '16:30', durationMinutes: 90, venue: 'Arena', participantCount: 4, participatingAthletes: [], coachInCharge: 'Coach Mark', notes: '', env: 'live', createdAt: '' }
  ];

  const summary = computeTrainingSummary(trainings);
  assert.equal(summary.sessionsCount, 2);
  assert.equal(summary.totalMinutes, 210);
  assert.equal(summary.totalHours, '3.5');
  assert.equal(summary.hoursBySport['Arnis'], 2);
  assert.equal(summary.hoursBySport['Taekwondo'], 1.5);
});
