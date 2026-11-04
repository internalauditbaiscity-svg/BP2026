import React, { useState } from 'react';
import { ShieldAlert, Trash2, X, KeyRound, AlertTriangle, Loader2 } from 'lucide-react';
import { useDatabaseEnv } from '../context/DatabaseEnvContext';

interface AdminDeleteAllModalProps {
  isOpen: boolean;
  moduleTitle: string;
  itemCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const AdminDeleteAllModal: React.FC<AdminDeleteAllModalProps> = ({
  isOpen,
  moduleTitle,
  itemCount,
  onConfirm,
  onClose,
}) => {
  const { env, isLive } = useDatabaseEnv();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDeleting) return;
    setPin('');
    setErrorMsg('');
    onClose();
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = pin.trim().toLowerCase();
    // Valid administrator confirmation PINs/passwords
    const isValid = 
      cleanPin === '2026' || 
      cleanPin === 'admin2026' || 
      cleanPin === '1234' || 
      cleanPin === 'bais2026';

    if (!isValid) {
      setErrorMsg('Invalid administrator password/PIN. Deletion denied.');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      console.error('Error executing delete all:', err);
      setErrorMsg('Failed to complete deletion. Please check network connection.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border-2 border-red-500/40 dark:border-red-500/50 shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-red-600 dark:bg-red-950/80 p-5 text-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0 backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-100 bg-red-700/80 px-2 py-0.5 rounded-full inline-block">
                Admin Security Clearance
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1 leading-tight">
                Delete All {moduleTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-white/70 hover:text-white p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          
          {/* Target Database warning */}
          <div className={`p-3 rounded-2xl border text-xs ${
            isLive 
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200' 
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>Target: {env.toUpperCase()} DATABASE ({itemCount} records)</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              {isLive 
                ? 'CRITICAL: You are about to purge records from the LIVE competition database. All items will be permanently erased.'
                : 'You are about to completely wipe all practice records from this module. Clean buildup live data will not be touched.'}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            To prevent accidental data loss, please enter the <strong className="text-slate-900 dark:text-white">Administrator Confirmation PIN</strong> below. This action will permanently erase the intended data and log an immutable entry in the audit trail.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Administrator Password / PIN
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                disabled={isDeleting}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Administrator PIN (e.g. 2026)"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default Admin Delegation PIN: <span className="font-mono font-bold">2026</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !pin.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Permanently Erasing Data...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Verify PIN & Delete All ({itemCount})</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
