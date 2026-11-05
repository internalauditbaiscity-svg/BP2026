import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { AppUserRecord, UserRole, SportType } from '../types';
import { logAuditEvent } from '../utils/audit';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  sport?: SportType;
  authProvider: 'google' | 'credentials';
  canDelete?: boolean;
  canPrint?: boolean;
  canExportCsv?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (emailOrUser: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canExportCsv: boolean;
  appUsers: AppUserRecord[];
  refreshUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole, sport?: SportType) => Promise<void>;
  toggleUserDeletePermission: (userId: string, canDelete: boolean) => Promise<void>;
  toggleUserPrintPermission: (userId: string, canPrint: boolean) => Promise<void>;
  toggleUserCsvPermission: (userId: string, canExportCsv: boolean) => Promise<void>;
  addUser: (userData: Omit<AppUserRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const DEFAULT_USERS: AppUserRecord[] = [
  {
    id: 'user_admin_01',
    email: 'internalaudit.baiscity@gmail.com',
    fullName: 'Bais Internal Audit / Delegation Head',
    role: 'Administrator',
    sport: 'General',
    status: 'Active',
    canDelete: true,
    canPrint: true,
    canExportCsv: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'user_coach_01',
    email: 'coach.arnis@bais.gov.ph',
    fullName: 'Coach Roberto Aguilar',
    role: 'Coach',
    sport: 'Arnis',
    status: 'Active',
    canDelete: true,
    canPrint: true,
    canExportCsv: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'user_chap_01',
    email: 'chaperone.team@bais.gov.ph',
    fullName: 'Maria Cristina Silva',
    role: 'Chaperone',
    sport: 'General',
    status: 'Active',
    canDelete: true,
    canPrint: true,
    canExportCsv: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'user_med_01',
    email: 'medical.clinic@bais.gov.ph',
    fullName: 'Dr. Arthur Mercado',
    role: 'Medical Staff',
    sport: 'General',
    status: 'Active',
    canDelete: true,
    canPrint: true,
    canExportCsv: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'user_off_01',
    email: 'official.sports@bais.gov.ph',
    fullName: 'Hon. Sports Commissioner',
    role: 'Delegation Official',
    sport: 'General',
    status: 'Active',
    canDelete: true,
    canPrint: true,
    canExportCsv: true,
    createdAt: '2026-10-01',
  },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('bais_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [appUsers, setAppUsers] = useState<AppUserRecord[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);

  // Sync users from Firestore /app_users
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'app_users'), (snapshot) => {
        if (!snapshot.empty) {
          const list: AppUserRecord[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as AppUserRecord);
          });
          setAppUsers(list);
        } else {
          // If empty in firestore, initialize default bootstrap users
          DEFAULT_USERS.forEach((u) => {
            setDoc(doc(db, 'app_users', u.id), u).catch(() => {});
          });
        }
      }, (err) => {
        console.warn('Could not subscribe to app_users collection, using local registry:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firebase app_users init fallback:', e);
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isSuper = user.email === 'internalaudit.baiscity@gmail.com';
      
      // Look up role in appUsers
      const existing = appUsers.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
      const role: UserRole = existing ? existing.role : (isSuper ? 'Administrator' : 'Delegation Official');
      const sport: SportType = existing?.sport || 'General';

      const authUser: AuthUser = {
        id: user.uid,
        email: user.email || 'user@bais.gov.ph',
        fullName: user.displayName || user.email || 'Delegation Member',
        role,
        sport,
        authProvider: 'google',
        canDelete: isSuper ? true : (existing?.canDelete ?? true),
        canPrint: isSuper ? true : (existing?.canPrint ?? true),
        canExportCsv: isSuper ? true : (existing?.canExportCsv ?? true),
      };

      setCurrentUser(authUser);
      localStorage.setItem('bais_auth_user', JSON.stringify(authUser));
      await logAuditEvent(authUser.email, authUser.fullName, authUser.role, 'LOGIN', 'Logged in via Google Authentication', 'AUTH', 'live');
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (emailOrUser: string, pin: string): Promise<boolean> => {
    setLoading(true);
    try {
      const cleanEmail = emailOrUser.trim().toLowerCase();
      // Match against appUsers
      const found = appUsers.find(u => 
        u.email.toLowerCase() === cleanEmail || 
        u.fullName.toLowerCase().includes(cleanEmail)
      );

      // PIN logic: Admin uses 2026 or any pin, coaches/chaperones default 1234 or 2026
      if (found) {
        if (pin === '2026' || pin === '1234' || pin.length >= 4) {
          const authUser: AuthUser = {
            id: found.id,
            email: found.email,
            fullName: found.fullName,
            role: found.role,
            sport: found.sport || 'General',
            authProvider: 'credentials',
            canDelete: found.role === 'Administrator' ? true : (found.canDelete ?? true),
            canPrint: found.role === 'Administrator' ? true : (found.canPrint ?? true),
            canExportCsv: found.role === 'Administrator' ? true : (found.canExportCsv ?? true),
          };
          setCurrentUser(authUser);
          localStorage.setItem('bais_auth_user', JSON.stringify(authUser));
          await logAuditEvent(authUser.email, authUser.fullName, authUser.role, 'LOGIN', `Logged in via Secure Credentials with role ${found.role}`, 'AUTH', 'live');
          return true;
        }
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await logAuditEvent(currentUser.email, currentUser.fullName, currentUser.role, 'LOGOUT', 'User logged out', 'AUTH', 'live');
    }
    setCurrentUser(null);
    localStorage.removeItem('bais_auth_user');
    try {
      await fbSignOut(auth);
    } catch (e) {
      // Ignore
    }
  };

  const refreshUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'app_users'));
      if (!snap.empty) {
        const list: AppUserRecord[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as AppUserRecord));
        setAppUsers(list);
      }
    } catch (err) {
      console.warn('refreshUsers error:', err);
    }
  };

  const addUser = async (userData: Omit<AppUserRecord, 'id' | 'createdAt'>) => {
    const newId = 'user_' + Date.now();
    const newUser: AppUserRecord = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      await setDoc(doc(db, 'app_users', newId), newUser);
    } catch (e) {
      console.warn('Could not write user to Firestore, keeping locally:', e);
    }
    setAppUsers(prev => [newUser, ...prev]);
    if (currentUser) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `Created new user ${newUser.fullName} (${newUser.email}) with role ${newUser.role}`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole, sport?: SportType) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      await setDoc(doc(db, 'app_users', userId), { role: newRole, sport: sport || 'General' }, { merge: true });
    } catch (e) {
      console.warn('Could not update user in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, sport: sport || u.sport } : u));
    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `Updated role for ${target.fullName} to ${newRole} (Sport: ${sport || target.sport})`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const deleteUser = async (userId: string) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'app_users', userId));
    } catch (e) {
      console.warn('Could not delete user in Firestore:', e);
    }
    setAppUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `Permanently deleted user account for ${target.fullName} (${target.email})`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserDeletePermission = async (userId: string, allowDelete: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      await setDoc(doc(db, 'app_users', userId), { canDelete: allowDelete }, { merge: true });
    } catch (e) {
      console.warn('Could not update user delete permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canDelete: allowDelete } : u));
    
    // If updating currently logged in user, update session
    if (currentUser?.id === userId) {
      const updatedUser: AuthUser = { ...currentUser, canDelete: allowDelete };
      setCurrentUser(updatedUser);
      localStorage.setItem('bais_auth_user', JSON.stringify(updatedUser));
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowDelete ? 'Enabled' : 'Disabled'} delete permissions for user ${target.fullName} (${target.email})`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserPrintPermission = async (userId: string, allowPrint: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      await setDoc(doc(db, 'app_users', userId), { canPrint: allowPrint }, { merge: true });
    } catch (e) {
      console.warn('Could not update user print permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canPrint: allowPrint } : u));
    
    if (currentUser?.id === userId) {
      const updatedUser: AuthUser = { ...currentUser, canPrint: allowPrint };
      setCurrentUser(updatedUser);
      localStorage.setItem('bais_auth_user', JSON.stringify(updatedUser));
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowPrint ? 'Enabled' : 'Disabled'} Print Report permission for user ${target.fullName} (${target.email})`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserCsvPermission = async (userId: string, allowCsv: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      await setDoc(doc(db, 'app_users', userId), { canExportCsv: allowCsv }, { merge: true });
    } catch (e) {
      console.warn('Could not update user CSV export permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canExportCsv: allowCsv } : u));
    
    if (currentUser?.id === userId) {
      const updatedUser: AuthUser = { ...currentUser, canExportCsv: allowCsv };
      setCurrentUser(updatedUser);
      localStorage.setItem('bais_auth_user', JSON.stringify(updatedUser));
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowCsv ? 'Enabled' : 'Disabled'} Export to CSV permission for user ${target.fullName} (${target.email})`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const isAdmin = currentUser?.role === 'Administrator' || currentUser?.email === 'internalaudit.baiscity@gmail.com';
  // Admin always has full capabilities; otherwise respect user permissions (defaults to true)
  const canDelete = isAdmin || (currentUser?.canDelete !== false);
  const canPrint = isAdmin || (currentUser?.canPrint !== false);
  const canExportCsv = isAdmin || (currentUser?.canExportCsv !== false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithGoogle,
        loginWithCredentials,
        logout,
        isAdmin,
        canDelete,
        canPrint,
        canExportCsv,
        appUsers,
        refreshUsers,
        updateUserRole,
        toggleUserDeletePermission,
        toggleUserPrintPermission,
        toggleUserCsvPermission,
        addUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
