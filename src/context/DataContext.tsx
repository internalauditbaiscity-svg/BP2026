import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs,
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useDatabaseEnv } from './DatabaseEnvContext';
import { useAuth } from './AuthContext';
import { logAuditEvent } from '../utils/audit';
import { 
  DelegationMember, 
  CheckInRecord, 
  HealthRecord, 
  WinLossRecord, 
  TrainingRecord, 
  MealRecord, 
  AuditRecord, 
  PushAlert, 
  SportType 
} from '../types';

interface DataContextType {
  members: DelegationMember[];
  checkins: CheckInRecord[];
  healthLogs: HealthRecord[];
  winLossRecords: WinLossRecord[];
  trainingLogs: TrainingRecord[];
  mealLogs: MealRecord[];
  auditLogs: AuditRecord[];
  notifications: PushAlert[];
  syncStatus: 'synced' | 'syncing' | 'offline';
  
  // Member actions
  saveMember: (member: Omit<DelegationMember, 'id' | 'createdAt' | 'env'>, id?: string) => Promise<void>;
  deleteMember: (id: string, name: string) => Promise<void>;
  deleteAllMembers: () => Promise<void>;

  // Check-in actions (Multi-athlete entry)
  submitCheckIn: (data: Omit<CheckInRecord, 'id' | 'createdAt' | 'env'>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  deleteAllCheckIns: () => Promise<void>;

  // Health actions
  logHealth: (data: Omit<HealthRecord, 'id' | 'createdAt' | 'env'>) => Promise<void>;
  deleteHealthLog: (id: string) => Promise<void>;
  deleteAllHealthLogs: () => Promise<void>;

  // Win/Loss actions
  saveWinLoss: (data: Omit<WinLossRecord, 'id' | 'createdAt' | 'env'>, id?: string) => Promise<void>;
  deleteWinLoss: (id: string) => Promise<void>;
  deleteAllWinLossRecords: () => Promise<void>;

  // Training actions (with Cancel, Edit, Delete)
  saveTraining: (data: Omit<TrainingRecord, 'id' | 'createdAt' | 'env'>, id?: string) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  deleteAllTrainingLogs: () => Promise<void>;

  // Meal distribution actions
  claimMeal: (mealId: string, claimed: boolean, claimedBy: string) => Promise<void>;
  batchCreateMealsForDate: (date: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'PM Snack') => Promise<number>;
  deleteMealRecord: (id: string) => Promise<void>;
  deleteAllMealLogs: () => Promise<void>;

  // Notifications
  broadcastNotification: (title: string, message: string, priority?: PushAlert['priority']) => Promise<void>;
  markNotificationRead: (id: string) => void;

  // Practice Database helpers
  seedPracticeData: () => Promise<void>;
  clearPracticeData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { env } = useDatabaseEnv();
  const { currentUser } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Datasets filtered by active environment
  const [members, setMembers] = useState<DelegationMember[]>([]);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthRecord[]>([]);
  const [winLossRecords, setWinLossRecords] = useState<WinLossRecord[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingRecord[]>([]);
  const [mealLogs, setMealLogs] = useState<MealRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [notifications, setNotifications] = useState<PushAlert[]>([]);

  // Local storage cache keys
  const cacheKey = (name: string) => `bais_${env}_${name}`;

  // Attach Firestore real-time listeners for the active environment
  useEffect(() => {
    setSyncStatus('syncing');

    // Subscribe to Firestore collections
    const unsubs: (() => void)[] = [];

    const subscribe = (colName: string, setter: (items: any[]) => void) => {
      try {
        const q = query(collection(db, colName));
        const unsub = onSnapshot(q, (snapshot) => {
          const list: any[] = [];
          const seen = new Set<string>();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Strictly check environment: default to 'live' if omitted
            const docEnv = data.env || 'live';
            if (docEnv === env && !seen.has(docSnap.id)) {
              seen.add(docSnap.id);
              list.push({ id: docSnap.id, ...data, env: docEnv });
            }
          });
          setter(list);
          setSyncStatus('synced');
          // Cache locally
          localStorage.setItem(cacheKey(colName), JSON.stringify(list));
        }, (err) => {
          console.warn(`Firestore read warning for ${colName}:`, err.message);
          setSyncStatus('offline');
          // Load from local storage cache
          const cached = localStorage.getItem(cacheKey(colName));
          if (cached) {
            setter(JSON.parse(cached));
          }
        });
        unsubs.push(unsub);
      } catch (err) {
        console.warn(`Init subscription error for ${colName}:`, err);
      }
    };

    subscribe('members', setMembers);
    subscribe('checkins', setCheckins);
    subscribe('health_logs', setHealthLogs);
    subscribe('win_loss_records', setWinLossRecords);
    subscribe('training_logs', setTrainingLogs);
    subscribe('meal_logs', setMealLogs);
    subscribe('audit_logs', (list) => {
      // Sort newest first
      const sorted = [...list].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setAuditLogs(sorted);
    });
    subscribe('notifications', (list) => {
      const sorted = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setNotifications(sorted);
    });

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, [env]);

  // MEMBER MANAGEMENT
  const saveMember = async (memberData: Omit<DelegationMember, 'id' | 'createdAt' | 'env'>, id?: string) => {
    const memberId = id || 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const docData: DelegationMember = {
      ...memberData,
      id: memberId,
      env,
      createdAt: id ? (members.find(m => m.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'members', memberId), docData);
    } catch (e) {
      console.warn('Saving member to local state:', e);
    }
    // Optimistic local update
    setMembers(prev => {
      const exists = prev.some(m => m.id === memberId);
      return exists ? prev.map(m => m.id === memberId ? docData : m) : [docData, ...prev];
    });

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        id ? 'UPDATE_RECORD' : 'USER_MANAGEMENT',
        `${id ? 'Updated' : 'Registered'} member: ${docData.fullName} (${docData.role} - ${docData.sport})`,
        'MEMBERS',
        env
      );
    }
  };

  const deleteMember = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (e) {
      console.warn('Deleting member locally:', e);
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Permanently erased member record: ${name} (ID: ${id})`,
        'MEMBERS',
        env
      );
    }
  };

  const deleteAllMembers = async () => {
    const toDeleteCount = members.length;
    setMembers([]);
    localStorage.removeItem(cacheKey('members'));

    try {
      const snap = await getDocs(collection(db, 'members'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all members from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Delegation Registry (${toDeleteCount} members erased) in ${env.toUpperCase()} database.`,
        'MEMBERS',
        env
      );
    }
  };

  // CHECK-IN (WHEREABOUTS)
  const submitCheckIn = async (data: Omit<CheckInRecord, 'id' | 'createdAt' | 'env'>) => {
    const checkinId = 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const record: CheckInRecord = {
      ...data,
      id: checkinId,
      env,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'checkins', checkinId), record);
    } catch (e) {
      console.warn('Saving checkin locally:', e);
    }
    setCheckins(prev => {
      const exists = prev.some(c => c.id === checkinId);
      return exists ? prev.map(c => c.id === checkinId ? record : c) : [record, ...prev];
    });

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'SUBMIT_CHECKIN',
        `Logged whereabouts at ${record.location} for ${record.participantNames.length} members (${record.sport}) - Window: ${record.timeWindow}`,
        'CHECKINS',
        env
      );
    }
  };

  const deleteCheckIn = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'checkins', id));
    } catch (e) {
      console.warn('Deleting checkin locally:', e);
    }
    setCheckins(prev => prev.filter(c => c.id !== id));
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Erased check-in log ID: ${id}`,
        'CHECKINS',
        env
      );
    }
  };

  const deleteAllCheckIns = async () => {
    const toDeleteCount = checkins.length;
    setCheckins([]);
    localStorage.removeItem(cacheKey('checkins'));

    try {
      const snap = await getDocs(collection(db, 'checkins'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all checkins from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Whereabouts Check-Ins (${toDeleteCount} records erased) in ${env.toUpperCase()} database.`,
        'CHECKINS',
        env
      );
    }
  };

  // HEALTH & TEMPERATURE
  const logHealth = async (data: Omit<HealthRecord, 'id' | 'createdAt' | 'env'>) => {
    const healthId = 'hlt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const record: HealthRecord = {
      ...data,
      id: healthId,
      env,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'health_logs', healthId), record);
    } catch (e) {
      console.warn('Saving health log locally:', e);
    }
    setHealthLogs(prev => [record, ...prev]);

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'UPDATE_RECORD',
        `Health log for ${record.memberName}: Temp ${record.temperature}°C, Injury: ${record.hasInjury ? record.injuryType : 'None'}`,
        'HEALTH',
        env
      );
    }
  };

  const deleteHealthLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'health_logs', id));
    } catch (e) {
      console.warn('Deleting health log locally:', e);
    }
    setHealthLogs(prev => prev.filter(h => h.id !== id));
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Erased health check record ID: ${id}`,
        'HEALTH',
        env
      );
    }
  };

  const deleteAllHealthLogs = async () => {
    const toDeleteCount = healthLogs.length;
    setHealthLogs([]);
    localStorage.removeItem(cacheKey('health_logs'));

    try {
      const snap = await getDocs(collection(db, 'health_logs'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all health logs from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Medical & Health Logs (${toDeleteCount} records erased) in ${env.toUpperCase()} database.`,
        'HEALTH',
        env
      );
    }
  };

  // WIN-LOSS TOURNAMENT
  const saveWinLoss = async (data: Omit<WinLossRecord, 'id' | 'createdAt' | 'env'>, id?: string) => {
    const recordId = id || 'wnl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const record: WinLossRecord = {
      ...data,
      id: recordId,
      env,
      createdAt: id ? (winLossRecords.find(w => w.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'win_loss_records', recordId), record);
    } catch (e) {
      console.warn('Saving win/loss locally:', e);
    }
    setWinLossRecords(prev => {
      const exists = prev.some(w => w.id === recordId);
      return exists ? prev.map(w => w.id === recordId ? record : w) : [record, ...prev];
    });

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        id ? 'UPDATE_RECORD' : 'UPDATE_RECORD',
        `Recorded Match Result [${record.result}] for ${record.sport} - ${record.athleteOrTeam} vs ${record.opponent} (${record.score})`,
        'WIN_LOSS',
        env
      );
    }
  };

  const deleteWinLoss = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'win_loss_records', id));
    } catch (e) {
      console.warn('Deleting win/loss locally:', e);
    }
    setWinLossRecords(prev => prev.filter(w => w.id !== id));
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Erased match result record ID: ${id}`,
        'WIN_LOSS',
        env
      );
    }
  };

  const deleteAllWinLossRecords = async () => {
    const toDeleteCount = winLossRecords.length;
    setWinLossRecords([]);
    localStorage.removeItem(cacheKey('win_loss_records'));

    try {
      const snap = await getDocs(collection(db, 'win_loss_records'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all win-loss records from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Tournament Match Records (${toDeleteCount} records erased) in ${env.toUpperCase()} database.`,
        'WIN_LOSS',
        env
      );
    }
  };

  // TRAINING MONITORING (Cancel, Edit, Delete)
  const saveTraining = async (data: Omit<TrainingRecord, 'id' | 'createdAt' | 'env'>, id?: string) => {
    const trainingId = id || 'trn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const record: TrainingRecord = {
      ...data,
      id: trainingId,
      env,
      createdAt: id ? (trainingLogs.find(t => t.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'training_logs', trainingId), record);
    } catch (e) {
      console.warn('Saving training log locally:', e);
    }
    setTrainingLogs(prev => {
      const exists = prev.some(t => t.id === trainingId);
      return exists ? prev.map(t => t.id === trainingId ? record : t) : [record, ...prev];
    });

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'LOG_TRAINING',
        `${id ? 'Updated' : 'Logged'} training drill: ${record.drillFocus} (${record.sport}) - Coverage: ${record.startTime} to ${record.endTime} (${record.durationMinutes} mins)`,
        'TRAINING',
        env
      );
    }
  };

  const deleteTraining = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'training_logs', id));
    } catch (e) {
      console.warn('Deleting training locally:', e);
    }
    setTrainingLogs(prev => prev.filter(t => t.id !== id));
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Permanently erased training log ID: ${id}`,
        'TRAINING',
        env
      );
    }
  };

  const deleteAllTrainingLogs = async () => {
    const toDeleteCount = trainingLogs.length;
    setTrainingLogs([]);
    localStorage.removeItem(cacheKey('training_logs'));

    try {
      const snap = await getDocs(collection(db, 'training_logs'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all training logs from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Training Logs (${toDeleteCount} sessions erased) in ${env.toUpperCase()} database.`,
        'TRAINING',
        env
      );
    }
  };

  // MEAL DISTRIBUTION & CLAIMING
  const claimMeal = async (mealId: string, claimed: boolean, claimedBy: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updateData = {
      claimed,
      claimedAt: claimed ? nowStr : undefined,
      claimedBy: claimed ? claimedBy : undefined,
    };

    try {
      await updateDoc(doc(db, 'meal_logs', mealId), updateData);
    } catch (e) {
      console.warn('Updating meal log locally:', e);
    }
    setMealLogs(prev => prev.map(m => m.id === mealId ? { ...m, ...updateData } : m));

    if (currentUser) {
      const meal = mealLogs.find(m => m.id === mealId);
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'CLAIM_MEAL',
        `${claimed ? 'Claimed' : 'Unclaimed'} ${meal?.mealType || 'Meal'} for ${meal?.memberName || 'Member'}`,
        'MEALS',
        env
      );
    }
  };

  const batchCreateMealsForDate = async (date: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'PM Snack') => {
    // Generate meal voucher records for all active members in this environment
    let count = 0;
    const newRecords: MealRecord[] = [];

    for (const mem of members) {
      // Check if meal already exists for this member on this date & mealType
      const existing = mealLogs.some(m => m.date === date && m.mealType === mealType && m.memberId === mem.id);
      if (!existing) {
        const id = `meal_${date}_${mealType}_${mem.id}`;
        const record: MealRecord = {
          id,
          date,
          mealType,
          memberId: mem.id,
          memberName: mem.fullName,
          memberRole: mem.role,
          sport: mem.sport,
          claimed: false,
          env,
        };
        newRecords.push(record);
        count++;
        setDoc(doc(db, 'meal_logs', id), record).catch(() => {});
      }
    }

    if (newRecords.length > 0) {
      setMealLogs(prev => [...newRecords, ...prev]);
    }
    return count;
  };

  const deleteMealRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'meal_logs', id));
    } catch (e) {
      console.warn('Deleting meal log locally:', e);
    }
    setMealLogs(prev => prev.filter(m => m.id !== id));
  };

  const deleteAllMealLogs = async () => {
    const toDeleteCount = mealLogs.length;
    setMealLogs([]);
    localStorage.removeItem(cacheKey('meal_logs'));

    try {
      const snap = await getDocs(collection(db, 'meal_logs'));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((d) => {
        const docData = d.data();
        const docEnv = docData.env || 'live';
        if (docEnv === env) {
          deletePromises.push(deleteDoc(d.ref));
        }
      });
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting all meal records from Firestore:', e);
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        `Administrator executed DELETE ALL on Meal Claiming Logs (${toDeleteCount} vouchers erased) in ${env.toUpperCase()} database.`,
        'MEALS',
        env
      );
    }
  };

  // BROADCAST NOTIFICATION & PUSH ALERTS
  const broadcastNotification = async (title: string, message: string, priority: PushAlert['priority'] = 'normal') => {
    const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const alert: PushAlert = {
      id: alertId,
      title,
      message,
      priority,
      targetAudience: 'All Bais City Delegation',
      sender: currentUser?.fullName || 'Delegation Secretariat',
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    try {
      await setDoc(doc(db, 'notifications', alertId), alert);
    } catch (e) {
      console.warn('Saving alert locally:', e);
    }
    setNotifications(prev => [alert, ...prev]);

    // Native browser push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        // Ignore
      }
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `Broadcast push notification [${priority.toUpperCase()}]: "${title}" - ${message}`,
        'NOTIFICATIONS',
        env
      );
    }
  };

  const markNotificationRead = (id: string) => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === id && !n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  // PRACTICE DATABASE SEEDER (Only in Practice Mode)
  const seedPracticeData = async () => {
    if (env !== 'practice') return;

    // First purge any existing practice data completely so multiple seedings/resets are always 100% clean
    await clearPracticeData();

    // Realistic demo roster for Bais City
    const sampleMembers: Omit<DelegationMember, 'id' | 'createdAt' | 'env'>[] = [
      { fullName: 'John Mark Cabanlit', role: 'Athlete', sport: 'Arnis', gender: 'Male', age: 14, billetingRoom: 'Billet Room 101', emergencyContact: '0917-123-4567', accreditationNumber: 'BP-BAIS-ARN-01', status: 'Active' },
      { fullName: 'Princess Diane Real', role: 'Athlete', sport: 'Arnis', gender: 'Female', age: 15, billetingRoom: 'Billet Room 102', emergencyContact: '0918-234-5678', accreditationNumber: 'BP-BAIS-ARN-02', status: 'Active' },
      { fullName: 'Kenji Kyle Ramirez', role: 'Athlete', sport: 'Taekwondo', gender: 'Male', age: 15, billetingRoom: 'Billet Room 103', emergencyContact: '0919-345-6789', accreditationNumber: 'BP-BAIS-TKD-01', status: 'Active' },
      { fullName: 'Sophia Isabel Torres', role: 'Athlete', sport: 'Taekwondo', gender: 'Female', age: 13, billetingRoom: 'Billet Room 104', emergencyContact: '0920-456-7890', accreditationNumber: 'BP-BAIS-TKD-02', status: 'Active' },
      { fullName: 'Lance Andrei Gomez', role: 'Athlete', sport: 'Athletics', gender: 'Male', age: 15, billetingRoom: 'Billet Room 105', emergencyContact: '0921-567-8901', accreditationNumber: 'BP-BAIS-ATH-01', status: 'Active' },
      { fullName: 'Jasmine Rose Flores', role: 'Athlete', sport: 'Athletics', gender: 'Female', age: 14, billetingRoom: 'Billet Room 106', emergencyContact: '0922-678-9012', accreditationNumber: 'BP-BAIS-ATH-02', status: 'Active' },
      { fullName: 'Bais United Futsal Team (Cap. Rico)', role: 'Athlete', sport: 'Futsal', gender: 'Male', age: 15, billetingRoom: 'Billet Dorm A', emergencyContact: '0923-789-0123', accreditationNumber: 'BP-BAIS-FUT-01', status: 'Active' },
      { fullName: 'Bais 3x3 Ballers (Cap. Dave)', role: 'Athlete', sport: '3x3 Basketball', gender: 'Male', age: 15, billetingRoom: 'Billet Dorm B', emergencyContact: '0924-890-1234', accreditationNumber: 'BP-BAIS-B3X3-01', status: 'Active' },
      { fullName: 'Bea & Nicole Pair', role: 'Athlete', sport: 'Beach Volleyball', gender: 'Female', age: 15, billetingRoom: 'Billet Room 201', emergencyContact: '0925-901-2345', accreditationNumber: 'BP-BAIS-BVB-01', status: 'Active' },
      { fullName: 'Gabriel Lim', role: 'Athlete', sport: 'Badminton', gender: 'Male', age: 14, billetingRoom: 'Billet Room 202', emergencyContact: '0926-012-3456', accreditationNumber: 'BP-BAIS-BAD-01', status: 'Active' },
      { fullName: 'Chloe Mae Villanueva', role: 'Athlete', sport: 'Table Tennis', gender: 'Female', age: 13, billetingRoom: 'Billet Room 203', emergencyContact: '0927-123-4567', accreditationNumber: 'BP-BAIS-TT-01', status: 'Active' },
      // Coaches & Chaperones
      { fullName: 'Elena Toribio', role: 'Coach', sport: 'Arnis', gender: 'Female', age: 36, billetingRoom: 'Coaches Room 1', emergencyContact: '0917-888-9999', accreditationNumber: 'BP-BAIS-CCH-01', status: 'Active' },
      { fullName: 'Mark Anthony Diaz', role: 'Coach', sport: 'Taekwondo', gender: 'Male', age: 34, billetingRoom: 'Coaches Room 2', emergencyContact: '0918-777-6666', accreditationNumber: 'BP-BAIS-CCH-02', status: 'Active' },
      { fullName: 'Cora Alcantara', role: 'Chaperone', sport: 'General', gender: 'Female', age: 45, billetingRoom: 'Chaperone Quarters', emergencyContact: '0919-555-4444', accreditationNumber: 'BP-BAIS-CHP-01', status: 'Active' },
      { fullName: 'Dr. Roberto Cruz', role: 'Medical Staff', sport: 'General', gender: 'Male', age: 43, billetingRoom: 'Delegation Clinic', emergencyContact: '0920-333-2222', accreditationNumber: 'BP-BAIS-MED-01', status: 'Active' },
    ];

    for (const m of sampleMembers) {
      await saveMember(m);
    }

    // Sample Training Log
    await saveTraining({
      date: '2026-12-10',
      sport: 'Arnis',
      drillFocus: 'Anyo Form & Double Baston Sparring',
      startTime: '07:00',
      endTime: '09:00',
      durationMinutes: 120,
      venue: 'Main Sports Complex Hall B',
      participantCount: 2,
      participatingAthletes: ['John Mark Cabanlit', 'Princess Diane Real'],
      coachInCharge: 'Coach Elena Toribio',
      notes: 'Morning warm-up and cadence drills prior to weigh-in.',
    });

    // Sample Whereabouts Check-in
    await submitCheckIn({
      date: '2026-12-10',
      timeWindow: '06:30 AM - 08:00 AM',
      location: 'Delegation Mess Hall',
      activity: 'Breakfast & Morning Headcount',
      sport: 'General',
      participantIds: [],
      participantNames: ['John Mark Cabanlit', 'Princess Diane Real', 'Kenji Kyle Ramirez', 'Elena Toribio'],
      remarks: 'All present and in high spirits for day 1 orientation.',
      submittedBy: 'Cora Alcantara',
      submittedByRole: 'Chaperone',
    });

    // Sample Match Win
    await saveWinLoss({
      date: '2026-12-11',
      sport: 'Arnis',
      athleteOrTeam: 'John Mark Cabanlit',
      opponent: 'Bacolod City',
      roundStage: 'Preliminary Round 1',
      score: '5 - 1',
      result: 'Win',
      remarks: 'Decisive strikes in 2nd round, advanced to quarterfinals.',
      loggedBy: 'Coach Elena Toribio',
    });

    // Sample Notification
    await broadcastNotification(
      'Practice Rehearsal Initialized',
      'Practice database seeded successfully for dry-run trials. Live competition database remains 100% clean.',
      'normal'
    );
  };

  const clearPracticeData = async () => {
    if (env !== 'practice') return;

    // 1. Immediately wipe local state
    setMembers([]);
    setCheckins([]);
    setHealthLogs([]);
    setWinLossRecords([]);
    setTrainingLogs([]);
    setMealLogs([]);
    localStorage.removeItem(cacheKey('members'));
    localStorage.removeItem(cacheKey('checkins'));
    localStorage.removeItem(cacheKey('health_logs'));
    localStorage.removeItem(cacheKey('win_loss_records'));
    localStorage.removeItem(cacheKey('training_logs'));
    localStorage.removeItem(cacheKey('meal_logs'));

    // 2. Query Firestore and physically delete all practice documents from cloud collections
    const collectionsToPurge = ['members', 'checkins', 'health_logs', 'win_loss_records', 'training_logs', 'meal_logs'];
    for (const col of collectionsToPurge) {
      try {
        const snap = await getDocs(collection(db, col));
        const deletePromises: Promise<void>[] = [];
        snap.forEach((d) => {
          const docData = d.data();
          if (docData.env === 'practice') {
            deletePromises.push(deleteDoc(d.ref));
          }
        });
        await Promise.all(deletePromises);
      } catch (e) {
        console.warn(`Could not purge practice docs from ${col}:`, e);
      }
    }

    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'DELETE_RECORD',
        'Cleared practice database dry-run records from cloud database and local cache.',
        'PRACTICE_DB',
        'practice'
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        members,
        checkins,
        healthLogs,
        winLossRecords,
        trainingLogs,
        mealLogs,
        auditLogs,
        notifications,
        syncStatus,
        saveMember,
        deleteMember,
        deleteAllMembers,
        submitCheckIn,
        deleteCheckIn,
        deleteAllCheckIns,
        logHealth,
        deleteHealthLog,
        deleteAllHealthLogs,
        saveWinLoss,
        deleteWinLoss,
        deleteAllWinLossRecords,
        saveTraining,
        deleteTraining,
        deleteAllTrainingLogs,
        claimMeal,
        batchCreateMealsForDate,
        deleteMealRecord,
        deleteAllMealLogs,
        broadcastNotification,
        markNotificationRead,
        seedPracticeData,
        clearPracticeData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
