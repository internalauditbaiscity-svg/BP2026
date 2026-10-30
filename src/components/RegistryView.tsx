import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Shield, 
  Phone, 
  Building, 
  IdCard, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { searchMembers } from '../utils/pureLogic';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { DelegationMember, SportType } from '../types';

export const RegistryView: React.FC = () => {
  const { members, saveMember, deleteMember } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<DelegationMember['role']>('Athlete');
  const [sport, setSport] = useState<SportType>('Arnis');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState(15);
  const [billetingRoom, setBilletingRoom] = useState('Room 101');
  const [emergencyContact, setEmergencyContact] = useState('0917-000-0000');
  const [accreditationNumber, setAccreditationNumber] = useState('BP-BAIS-001');
  const [status, setStatus] = useState<DelegationMember['status']>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFullName('');
    setRole('Athlete');
    setSport('Arnis');
    setGender('Male');
    setAge(15);
    setBilletingRoom('Billet Room 101');
    setEmergencyContact('0917-123-4567');
    setAccreditationNumber(`BP-BAIS-${Date.now().toString().slice(-4)}`);
    setStatus('Active');
    setShowForm(true);
  };

  const handleOpenEdit = (m: DelegationMember) => {
    setEditingId(m.id);
    setFullName(m.fullName);
    setRole(m.role);
    setSport(m.sport);
    setGender(m.gender);
    setAge(m.age);
    setBilletingRoom(m.billetingRoom);
    setEmergencyContact(m.emergencyContact);
    setAccreditationNumber(m.accreditationNumber);
    setStatus(m.status);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter member full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveMember({
        fullName: fullName.trim(),
        role,
        sport,
        gender,
        age: Number(age) || 15,
        billetingRoom: billetingRoom.trim(),
        emergencyContact: emergencyContact.trim(),
        accreditationNumber: accreditationNumber.trim(),
        status,
      }, editingId || undefined);

      handleCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMember(deleteTarget.id, deleteTarget.name);
    setDeleteTarget(null);
  };

  const filteredMembers = searchMembers(members, searchQuery, sportFilter, roleFilter);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delegation Masterlist & Registry</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              {members.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register and manage official athletes, coaches, chaperones, and delegation members.
          </p>
        </div>

        <button
          onClick={showForm ? handleCancel : handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? 'Cancel Entry' : 'Register New Member'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingId ? 'Edit Delegation Member' : 'Register New Delegation Entry'}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First Name, Middle Name, Surname"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Delegation Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
              >
                <option value="Athlete">Athlete</option>
                <option value="Coach">Coach</option>
                <option value="Chaperone">Chaperone</option>
                <option value="Medical Staff">Medical Staff</option>
                <option value="Delegation Official">Delegation Official</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sport Discipline
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-semibold"
              >
                <option value="Arnis">Arnis</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Athletics">Athletics</option>
                <option value="Futsal">Futsal</option>
                <option value="3x3 Basketball">3x3 Basketball</option>
                <option value="Beach Volleyball">Beach Volleyball</option>
                <option value="Badminton">Badminton</option>
                <option value="Table Tennis">Table Tennis</option>
                <option value="General">General / All-Delegation</option>
              </select>
            </div>

            {/* Gender & Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Gender & Age
              </label>
              <div className="flex gap-2">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="number"
                  min="8"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 15)}
                  className="w-1/2 px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  placeholder="Age"
                />
              </div>
            </div>

            {/* Billeting Room */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Billeting Room / Quarters
              </label>
              <input
                type="text"
                required
                value={billetingRoom}
                onChange={(e) => setBilletingRoom(e.target.value)}
                placeholder="e.g. Room 204 or Dorm Hall B"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. 0917-123-4567"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Accreditation Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Accreditation ID #
              </label>
              <input
                type="text"
                required
                value={accreditationNumber}
                onChange={(e) => setAccreditationNumber(e.target.value)}
                placeholder="e.g. BP-BAIS-ARN-01"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
              >
                <option value="Active">🟢 Active & In Competition</option>
                <option value="Billeted">🟡 Billeted in Quarters</option>
                <option value="Medical Hold">🔴 Medical Hold</option>
                <option value="Disqualified">⛔ Disqualified</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
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
              {isSubmitting ? 'Saving to Database...' : editingId ? 'Update Member' : 'Save New Member'}
            </button>
          </div>
        </form>
      )}

      {/* Robust Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rapid lookup by name, room, sport, or ID..."
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
            <option value="All">All Roles</option>
            <option value="Athlete">Athletes</option>
            <option value="Coach">Coaches</option>
            <option value="Chaperone">Chaperones</option>
            <option value="Medical Staff">Medical Staff</option>
            <option value="Delegation Official">Delegation Officials</option>
          </select>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="All">All Sports</option>
            <option value="Arnis">Arnis</option>
            <option value="Taekwondo">Taekwondo</option>
            <option value="Athletics">Athletics</option>
            <option value="Futsal">Futsal</option>
            <option value="3x3 Basketball">3x3 Basketball</option>
            <option value="Beach Volleyball">Beach Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Members in Registry</h3>
            <p className="text-xs text-slate-400 mt-1">
              {members.length === 0 
                ? 'The database is clean. Click "Register New Member" to add athletes, coaches, and staff.' 
                : 'No members match the search query.'}
            </p>
          </div>
        ) : (
          filteredMembers.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {m.fullName}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {m.accreditationNumber}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    m.status === 'Active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                      : m.status === 'Medical Hold' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {m.role}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                    {m.sport}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                    {m.gender}, {m.age} yrs
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quarters: <strong className="text-slate-700 dark:text-slate-200">{m.billetingRoom}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Emergency: <strong className="font-mono text-slate-700 dark:text-slate-200">{m.emergencyContact}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(m)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: m.id, name: m.fullName })}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Erase Delegation Member"
        itemName={deleteTarget?.name || 'Member'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
