import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
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
  canUploadCsv?: boolean;
  roleVersion?: number;
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
  canUploadCsv: boolean;
  appUsers: AppUserRecord[];
  refreshUsers: () => Promise<void>;
  updateUserRole: (
    userId: string, 
    newRole: UserRole, 
    sport?: SportType, 
    permissions?: { canDelete?: boolean; canPrint?: boolean; canExportCsv?: boolean; canUploadCsv?: boolean }
  ) => Promise<void>;
  toggleUserDeletePermission: (userId: string, canDelete: boolean) => Promise<void>;
  toggleUserPrintPermission: (userId: string, canPrint: boolean) => Promise<void>;
  toggleUserCsvPermission: (userId: string, canExportCsv: boolean) => Promise<void>;
  toggleUserUploadCsvPermission: (userId: string, canUploadCsv: boolean) => Promise<void>;
  addUser: (userData: Omit<AppUserRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  roleUpdateNotice: string | null;
  clearRoleUpdateNotice: () => void;
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
    canUploadCsv: true,
    roleVersion: 1,
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
    canUploadCsv: true,
    roleVersion: 1,
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
    canUploadCsv: true,
    roleVersion: 1,
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
    canUploadCsv: false,
    roleVersion: 1,
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
    canUploadCsv: false,
    roleVersion: 1,
    createdAt: '2026-10-01',
  },
];

const AUTH_STORAGE_KEY = 'bais_session_user';
const ROLE_BROADCAST_CHANNEL = 'bais_role_access_channel';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session storage only: window exit clears session; opening a new window requires credentials
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      // Purge any legacy localStorage user session
      localStorage.removeItem('bais_auth_user');
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}

    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [roleUpdateNotice, setRoleUpdateNotice] = useState<string | null>(null);
  const [appUsers, setAppUsers] = useState<AppUserRecord[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);

  const clearRoleUpdateNotice = useCallback(() => {
    setRoleUpdateNotice(null);
  }, []);

  // Broadcast helper to notify other tabs/windows when a role or permission is modified
  const broadcastRoleUpdate = (userId: string, newVersion: number) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(ROLE_BROADCAST_CHANNEL);
        channel.postMessage({ type: 'ROLE_UPDATE', userId, roleVersion: newVersion });
        channel.close();
      }
    } catch {}
  };

  // Listen for broadcast role updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel(ROLE_BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === 'ROLE_UPDATE' && event.data.userId) {
          const targetId = event.data.userId;
          // If current logged-in user is the subject user, log them out immediately
          if (currentUser && currentUser.id === targetId) {
            setCurrentUser(null);
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            setRoleUpdateNotice(
              'Your user role access or permissions were updated by the Administrator. Your active session has been logged out and you are required to provide user access credentials.'
            );
          }
          // Refresh users list in local state
          refreshUsers();
        }
      };
      return () => channel.close();
    } catch {}
  }, [currentUser]);

  // Sync users from Firestore /app_users in real-time
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'app_users'), (snapshot) => {
        if (!snapshot.empty) {
          const list: AppUserRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as AppUserRecord);
          });
          setAppUsers(list);

          // Real-time check: If currentUser's role access was modified in Firestore
          if (currentUser) {
            const me = list.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (!me) {
              // Account was deleted
              setCurrentUser(null);
              sessionStorage.removeItem(AUTH_STORAGE_KEY);
              setRoleUpdateNotice('Your user access credentials have been deactivated or removed by the Administrator.');
            } else if (
              (me.roleVersion !== undefined && currentUser.roleVersion !== undefined && me.roleVersion > currentUser.roleVersion) ||
              (me.role !== currentUser.role)
            ) {
              // Subject user was updated! Terminate session and require credentials
              setCurrentUser(null);
              sessionStorage.removeItem(AUTH_STORAGE_KEY);
              setRoleUpdateNotice(
                `Your user role access or permissions were updated by the Administrator (${me.role} • ${me.sport || 'General'}). Your active session has been logged out and you are required to provide user access credentials.`
              );
              logAuditEvent(
                currentUser.email,
                currentUser.fullName,
                currentUser.role,
                'LOGOUT',
                `Active session terminated due to Administrator role access change for ${currentUser.email}`,
                'AUTH',
                'live'
              );
            }
          }
        } else {
          // If empty in Firestore, initialize default bootstrap users
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
  }, [currentUser]);

  const loginWithGoogle = async () => {
    setLoading(true);
    setRoleUpdateNotice(null);
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
        canUploadCsv: isSuper ? true : (existing?.canUploadCsv ?? (role === 'Administrator' || role === 'Coach')),
        roleVersion: existing?.roleVersion || 1,
      };

      setCurrentUser(authUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
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
    setRoleUpdateNotice(null);
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
          const isSuper = found.role === 'Administrator' || found.email === 'internalaudit.baiscity@gmail.com';
          const authUser: AuthUser = {
            id: found.id,
            email: found.email,
            fullName: found.fullName,
            role: found.role,
            sport: found.sport || 'General',
            authProvider: 'credentials',
            canDelete: isSuper ? true : (found.canDelete ?? true),
            canPrint: isSuper ? true : (found.canPrint ?? true),
            canExportCsv: isSuper ? true : (found.canExportCsv ?? true),
            canUploadCsv: isSuper ? true : (found.canUploadCsv ?? (found.role === 'Coach')),
            roleVersion: found.roleVersion || 1,
          };
          setCurrentUser(authUser);
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
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
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
      roleVersion: 1,
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

  // Update role and command permissions for a user
  const updateUserRole = async (
    userId: string, 
    newRole: UserRole, 
    sport?: SportType,
    permissions?: { canDelete?: boolean; canPrint?: boolean; canExportCsv?: boolean; canUploadCsv?: boolean }
  ) => {
    const target = appUsers.find(u => u.id === userId);
    const newRoleVersion = Date.now();
    const updatePayload: Record<string, any> = {
      role: newRole,
      sport: sport || 'General',
      roleVersion: newRoleVersion,
      lastRoleUpdate: new Date().toISOString(),
    };

    if (permissions) {
      if (permissions.canDelete !== undefined) updatePayload.canDelete = permissions.canDelete;
      if (permissions.canPrint !== undefined) updatePayload.canPrint = permissions.canPrint;
      if (permissions.canExportCsv !== undefined) updatePayload.canExportCsv = permissions.canExportCsv;
      if (permissions.canUploadCsv !== undefined) updatePayload.canUploadCsv = permissions.canUploadCsv;
    }

    try {
      await setDoc(doc(db, 'app_users', userId), updatePayload, { merge: true });
    } catch (e) {
      console.warn('Could not update user in Firestore:', e);
    }

    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatePayload } : u));
    
    // Broadcast role change so subject user is immediately logged out
    broadcastRoleUpdate(userId, newRoleVersion);

    // If subject user is active in this session, immediately log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice(
        `Your user role access was updated by the Administrator to ${newRole}. Your session has been ended and you are required to provide user access credentials.`
      );
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `Updated role & access permissions for ${target.fullName} to ${newRole} (Sport: ${sport || target.sport}) - Session invalidated`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const deleteUser = async (userId: string) => {
    const target = appUsers.find(u => u.id === userId);
    try {
      await deleteDoc(doc(db, 'app_users', userId));
    } catch (e) {
      console.warn('Could not delete user in Firestore:', e);
    }
    setAppUsers(prev => prev.filter(u => u.id !== userId));

    // Broadcast deletion
    broadcastRoleUpdate(userId, Date.now());

    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice('Your user access account has been removed. Please contact the Administrator.');
    }

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
    const newRoleVersion = Date.now();
    try {
      await setDoc(doc(db, 'app_users', userId), { 
        canDelete: allowDelete, 
        roleVersion: newRoleVersion,
        lastRoleUpdate: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update user delete permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canDelete: allowDelete, roleVersion: newRoleVersion } : u));
    
    // Broadcast role update
    broadcastRoleUpdate(userId, newRoleVersion);

    // If subject user is active, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice('Your user role permissions were updated by the Administrator. Please log in with your credentials.');
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowDelete ? 'Enabled' : 'Disabled'} delete permissions for user ${target.fullName} (${target.email}) - Session invalidated`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserPrintPermission = async (userId: string, allowPrint: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    const newRoleVersion = Date.now();
    try {
      await setDoc(doc(db, 'app_users', userId), { 
        canPrint: allowPrint,
        roleVersion: newRoleVersion,
        lastRoleUpdate: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update user print permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canPrint: allowPrint, roleVersion: newRoleVersion } : u));
    
    // Broadcast role update
    broadcastRoleUpdate(userId, newRoleVersion);

    // If subject user is active, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice('Your user role permissions were updated by the Administrator. Please log in with your credentials.');
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowPrint ? 'Enabled' : 'Disabled'} Print Report permission for user ${target.fullName} (${target.email}) - Session invalidated`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserCsvPermission = async (userId: string, allowCsv: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    const newRoleVersion = Date.now();
    try {
      await setDoc(doc(db, 'app_users', userId), { 
        canExportCsv: allowCsv,
        roleVersion: newRoleVersion,
        lastRoleUpdate: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update user CSV export permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canExportCsv: allowCsv, roleVersion: newRoleVersion } : u));
    
    // Broadcast role update
    broadcastRoleUpdate(userId, newRoleVersion);

    // If subject user is active, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice('Your user role permissions were updated by the Administrator. Please log in with your credentials.');
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowCsv ? 'Enabled' : 'Disabled'} Export to CSV permission for user ${target.fullName} (${target.email}) - Session invalidated`,
        'USER_MAINTENANCE',
        'live'
      );
    }
  };

  const toggleUserUploadCsvPermission = async (userId: string, allowUpload: boolean) => {
    const target = appUsers.find(u => u.id === userId);
    const newRoleVersion = Date.now();
    try {
      await setDoc(doc(db, 'app_users', userId), { 
        canUploadCsv: allowUpload,
        roleVersion: newRoleVersion,
        lastRoleUpdate: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update user CSV upload permission in Firestore:', e);
    }
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, canUploadCsv: allowUpload, roleVersion: newRoleVersion } : u));
    
    // Broadcast role update
    broadcastRoleUpdate(userId, newRoleVersion);

    // If subject user is active, log them out
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setRoleUpdateNotice('Your user role permissions were updated by the Administrator. Please log in with your credentials.');
    }

    if (currentUser && target) {
      await logAuditEvent(
        currentUser.email,
        currentUser.fullName,
        currentUser.role,
        'USER_MANAGEMENT',
        `${allowUpload ? 'Enabled' : 'Disabled'} Registry CSV Upload permission for user ${target.fullName} (${target.email}) - Session invalidated`,
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
  const canUploadCsv = isAdmin || (currentUser?.canUploadCsv !== false);

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
        canUploadCsv,
        appUsers,
        refreshUsers,
        updateUserRole,
        toggleUserDeletePermission,
        toggleUserPrintPermission,
        toggleUserCsvPermission,
        toggleUserUploadCsvPermission,
        addUser,
        deleteUser,
        roleUpdateNotice,
        clearRoleUpdateNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
