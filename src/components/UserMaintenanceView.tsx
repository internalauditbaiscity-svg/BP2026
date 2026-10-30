import React, { useState } from 'react';
import { 
  UserCog, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  ShieldAlert, 
  Check, 
  X, 
  Users, 
  KeyRound, 
  Pencil, 
  Mail, 
  Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { UserRole, SportType, AppUserRecord } from '../types';

export const UserMaintenanceView: React.FC = () => {
  const { currentUser, isAdmin, appUsers, addUser, deleteUser, updateUserRole } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Coach');
  const [sport, setSport] = useState<SportType>('Arnis');
  const [status, setStatus] = useState<AppUserRecord['status']>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit role modal state
  const [editingUser, setEditingUser] = useState<AppUserRecord | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Coach');
  const [editSport, setEditSport] = useState<SportType>('General');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Administrator only access guard
  if (!isAdmin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-3">
        <div className="p-4 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Access Only</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          User Maintenance, credential issuance, and role definitions are restricted exclusively to the App Administrator.
        </p>
      </div>
    );
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      alert('Please provide full name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser({
        email: email.trim(),
        fullName: fullName.trim(),
        role,
        sport,
        status,
      });

      setShowAddForm(false);
      setEmail('');
      setFullName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (u: AppUserRecord) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditSport(u.sport || 'General');
  };

  const handleSaveEditRole = async () => {
    if (!editingUser) return;
    await updateUserRole(editingUser.id, editRole, editSport);
    setEditingUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Maintenance & Role Management</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create user access, configure authentication credentials, and assign role definitions for delegation staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showAddForm ? 'Cancel Creation' : 'Create New User Access'}
        </button>
      </div>

      {/* Role Definitions Architecture Card */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Role Definitions & Permission Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">Administrator</span>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Full privileges: User maintenance, role management, daily CSV/PDF report extraction, audit trail review, and delete authorizations.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-purple-600 dark:text-purple-400 uppercase text-[11px]">Coach</span>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Whereabouts check-in for team, practice drills and duration logging, match results, and athlete registration.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase text-[11px]">Chaperone</span>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Curfew check-in, billeting room headcounts, meal distribution and claiming, and athlete welfare reporting.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-rose-600 dark:text-rose-400 uppercase text-[11px]">Medical Staff</span>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Daily temperature logging (°C), injury reporting, treatment notes, and medical clearance/holds.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[11px]">Delegation Official</span>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Read-only and monitoring oversight of delegation schedule, medal standings, and roster status.
            </p>
          </div>
        </div>
      </div>

      {/* User Creation Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Provision New User Access & Credentials
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Coach Roberto Aguilar"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Authorized Email / Username
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. coach.taekwondo@bais.gov.ph"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
              >
                <option value="Administrator">Administrator</option>
                <option value="Coach">Coach</option>
                <option value="Chaperone">Chaperone</option>
                <option value="Medical Staff">Medical Staff</option>
                <option value="Delegation Official">Delegation Official</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Assigned Sport Discipline
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="General">General / All Delegation</option>
                <option value="Arnis">Arnis</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Athletics">Athletics</option>
                <option value="Futsal">Futsal</option>
                <option value="3x3 Basketball">3x3 Basketball</option>
                <option value="Beach Volleyball">Beach Volleyball</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
              >
                <option value="Active">🟢 Active</option>
                <option value="Inactive">🟡 Inactive</option>
                <option value="Suspended">🔴 Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Default Access PIN
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold flex items-center justify-between">
                <span>Default: 1234 (or 2026 for Admin)</span>
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Provisioning...' : 'Save User Access'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Authorized App User Credentials ({appUsers.length})
          </h3>
          <span className="text-xs text-slate-500">
            Stored in cloud authentication & database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {appUsers.map((u) => {
                const isCurrent = currentUser?.email.toLowerCase() === u.email.toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {u.fullName}
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Administrator' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                          : u.role === 'Coach' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' 
                          : u.role === 'Medical Staff'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{u.sport || 'General'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {u.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit User Role"
                          aria-label={`Edit ${u.fullName}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Protect self-deletion */}
                        {!isCurrent && (
                          <button
                            onClick={() => setDeleteTarget({ id: u.id, name: `${u.fullName} (${u.email})` })}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                            title="Delete User Credentials"
                            aria-label={`Delete ${u.fullName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Update Role for {editingUser.fullName}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Select Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="Administrator">Administrator</option>
                <option value="Coach">Coach</option>
                <option value="Chaperone">Chaperone</option>
                <option value="Medical Staff">Medical Staff</option>
                <option value="Delegation Official">Delegation Official</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Assigned Sport
              </label>
              <select
                value={editSport}
                onChange={(e) => setEditSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="General">General</option>
                <option value="Arnis">Arnis</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Athletics">Athletics</option>
                <option value="Futsal">Futsal</option>
                <option value="3x3 Basketball">3x3 Basketball</option>
                <option value="Beach Volleyball">Beach Volleyball</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditRole}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Erase User Account"
        itemName={deleteTarget?.name || 'User Account'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
