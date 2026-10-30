import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditRecord, DatabaseEnv, UserRole } from '../types';

export async function logAuditEvent(
  userEmail: string,
  userName: string,
  userRole: UserRole,
  actionType: AuditRecord['actionType'],
  details: string,
  targetEntity: string,
  env: DatabaseEnv
): Promise<void> {
  const auditData: Omit<AuditRecord, 'id'> = {
    timestamp: new Date().toISOString(),
    userEmail: userEmail || 'system',
    userName: userName || 'Anonymous',
    userRole: userRole || 'Delegation Official',
    actionType,
    details,
    targetEntity,
    env,
  };

  try {
    await addDoc(collection(db, 'audit_logs'), auditData);
  } catch (error) {
    console.warn('Logging audit event to local storage fallback:', error);
    const existing = JSON.parse(localStorage.getItem('bais_local_audit') || '[]');
    existing.unshift({ ...auditData, id: 'local_' + Date.now() });
    localStorage.setItem('bais_local_audit', JSON.stringify(existing.slice(0, 100)));
  }
}
