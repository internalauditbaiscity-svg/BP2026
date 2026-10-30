import React, { useState } from 'react';
import { Shield, KeyRound, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { currentUser, loginWithCredentials, loginWithGoogle, loading } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (currentUser) return null; // Already logged in

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailInput || !pinInput) {
      setErrorMsg('Please enter your authorized email or username and credential PIN.');
      return;
    }
    const success = await loginWithCredentials(emailInput, pinInput);
    if (!success) {
      setErrorMsg('Invalid login credentials or PIN. Please verify your authorized credentials with the Delegation Administrator.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex p-3 bg-white/15 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <Shield className="w-8 h-8 text-emerald-200" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">CITY OF BAIS</h1>
          <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold mt-0.5">
            2026 Batang Pinoy Delegation Hub
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-emerald-500/25 border border-emerald-400/30 rounded-full text-[11px] font-medium text-emerald-100">
            Dec 10 - 19, 2026 • Official Delegation Portal
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Secure Delegation Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please enter your authorized credentials to access attendance, training & reporting.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Authorized Email / Username
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. internalaudit.baiscity@gmail.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Access Credential PIN / Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter credential PIN"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
            </button>
          </form>

          {/* Google Auth Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              OR SINGLE SIGN-ON
            </span>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
