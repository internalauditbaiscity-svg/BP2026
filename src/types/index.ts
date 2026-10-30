export type UserRole = 
  | 'Administrator' 
  | 'Coach' 
  | 'Chaperone' 
  | 'Medical Staff' 
  | 'Delegation Official';

export type SportType = 
  | 'Arnis'
  | 'Taekwondo'
  | 'Athletics'
  | 'Futsal'
  | '3x3 Basketball'
  | 'Beach Volleyball'
  | 'Badminton'
  | 'Table Tennis'
  | 'General';

export type DatabaseEnv = 'live' | 'practice';

export interface DelegationMember {
  id: string;
  fullName: string;
  role: 'Athlete' | 'Coach' | 'Chaperone' | 'Medical Staff' | 'Delegation Official' | 'Admin';
  sport: SportType;
  gender: 'Male' | 'Female';
  age: number;
  billetingRoom: string;
  emergencyContact: string;
  accreditationNumber: string;
  status: 'Active' | 'Billeted' | 'Medical Hold' | 'Disqualified';
  env: DatabaseEnv;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckInRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timeWindow: string; // e.g. "06:00 AM - 07:30 AM"
  location: string;
  activity: string;
  participantIds: string[];
  participantNames: string[];
  sport: SportType;
  remarks: string;
  submittedBy: string;
  submittedByRole: UserRole;
  env: DatabaseEnv;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  memberId: string;
  memberName: string;
  sport: SportType;
  date: string;
  time: string;
  temperature: number; // in Celsius e.g. 36.6
  hasInjury: boolean;
  injuryType?: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  bodyPart?: string;
  clearedToPlay: boolean;
  notes: string;
  loggedBy: string;
  env: DatabaseEnv;
  createdAt: string;
}

export interface WinLossRecord {
  id: string;
  date: string;
  sport: SportType;
  athleteOrTeam: string;
  opponent: string; // City / Opponent name
  roundStage: string; // e.g., "Eliminations", "Quarterfinals", "Semifinals", "Finals / Gold Match"
  score: string;
  result: 'Win' | 'Loss' | 'Draw' | 'Medal Match' | 'Gold' | 'Silver' | 'Bronze';
  remarks: string;
  loggedBy: string;
  env: DatabaseEnv;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  date: string;
  sport: SportType;
  drillFocus: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  venue: string;
  participantCount: number;
  participatingAthletes: string[];
  coachInCharge: string;
  notes: string;
  env: DatabaseEnv;
  createdAt: string;
  updatedAt?: string;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'PM Snack';
  memberId: string;
  memberName: string;
  memberRole: string;
  sport: SportType;
  claimed: boolean;
  claimedAt?: string;
  claimedBy?: string;
  dietaryNotes?: string;
  env: DatabaseEnv;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  actionType: 
    | 'LOGIN' 
    | 'LOGOUT' 
    | 'SUBMIT_CHECKIN' 
    | 'LOG_TRAINING' 
    | 'DELETE_RECORD' 
    | 'UPDATE_RECORD' 
    | 'EXPORT_REPORT' 
    | 'USER_MANAGEMENT' 
    | 'CLAIM_MEAL'
    | 'SWITCH_ENV'
    | 'SEED_DATA';
  details: string;
  targetEntity: string;
  env: DatabaseEnv;
}

export interface AppUserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  sport?: SportType;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface PushAlert {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: string;
  sender: string;
  createdAt: string;
  readBy: string[];
}
