import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  FileText, 
  Compass, 
  Clock, 
  Dumbbell, 
  HeartPulse, 
  Trophy, 
  UtensilsCrossed, 
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { exportCoachManualPDF } from '../utils/exportCoachManualPDF';

interface CoachManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachManualModal: React.FC<CoachManualModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<'all' | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'pocket'>('all');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      exportCoachManualPDF();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF directly. Please try printing or reload.');
    } finally {
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden z-10">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Official Publication • Batang Pinoy 2026
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  Dec 10 - 19, 2026
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                Coach’s Operations Manual & App Playbook
              </h2>
              <p className="text-xs text-slate-300">
                City Government of Bais • Delegation Secretariat & Internal Audit
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="Download publication-quality 6-page PDF manual"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF Manual'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
              title="Print document or save via browser PDF engine"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto text-[13px] font-bold shrink-0">
          <span className="text-slate-400 dark:text-slate-500 text-[13px] uppercase tracking-wider pr-1 hidden md:inline">
            Chapters:
          </span>
          <button
            onClick={() => setActiveChapter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Chapters (Full Manual)
          </button>
          <button
            onClick={() => setActiveChapter('ch1')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'ch1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ch. 1: Pre-Game Briefing
          </button>
          <button
            onClick={() => setActiveChapter('ch2')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'ch2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ch. 2: Daily Cadence (06:00 - 22:00)
          </button>
          <button
            onClick={() => setActiveChapter('ch3')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'ch3'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ch. 3: Module Field Guides
          </button>
          <button
            onClick={() => setActiveChapter('ch4')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'ch4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ch. 4 & 5: Scenarios & FAQ
          </button>
          <button
            onClick={() => setActiveChapter('pocket')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeChapter === 'pocket'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-200'
            }`}
          >
            Pocket Cheat Sheet
          </button>
        </div>

        {/* Modal Body / Printable Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200">
          
          {/* Quick Notice Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-[13px]">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-[13px]">Need a physical copy for your clipboard or billeting room?</p>
                <p className="text-[13px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Tap "Download PDF Manual" above to export the complete 6-page ready-to-print official tournament booklet.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shrink-0 ml-2 text-[13px]"
            >
              Get PDF
            </button>
          </div>

          {/* CHAPTER 1 */}
          {(activeChapter === 'all' || activeChapter === 'ch1') && (
            <section className="bg-white dark:bg-slate-800/80 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-[13px] flex items-center justify-center">
                    01
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-[13px] uppercase tracking-wide">
                    CHAPTER 1: PRE-GAME BRIEFING & SYSTEM SETUP
                  </h3>
                </div>
                <span className="text-[13px] text-slate-400">Page 2 of PDF</span>
              </div>

              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Coach, welcome to the digital headquarters of the <strong>Bais City Batang Pinoy 2026 Delegation Hub</strong>. Out on the floor, you manage strategy and spirit. In this app, you protect our athletes’ whereabouts, log training hours, verify physical fitness, and cement our city’s triumphs in real time.
              </p>

              {/* The Golden Rule Callout */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-[13px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>THE GOLDEN RULE: VERIFY YOUR DATABASE ENVIRONMENT TOGGLE</span>
                </div>
                <p className="text-[13px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  Before saving any record, look at the top header switcher:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[13px]">
                  <div className="p-3 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/50">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[13px] block">🛡️ [ LIVE ] (Official Competition)</span>
                    <p className="text-[13px] text-emerald-900 dark:text-emerald-200 mt-1 leading-normal">Permanent tournament records synced to City Hall, Secretariat, and Medical team.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-100/70 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/50">
                    <span className="font-bold text-amber-800 dark:text-amber-300 text-[13px] block">🧪 [ PRACTICE ] (Sandbox / Scrimmage)</span>
                    <p className="text-[13px] text-amber-900 dark:text-amber-200 mt-1 leading-normal">Dry-run testing and staff practice. Does NOT alter official city medal tallies.</p>
                  </div>
                </div>
              </div>

              {/* Login Steps */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-[13px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  First-Time Authentication
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>Open the official web link on your mobile phone browser (Chrome or Safari).</li>
                  <li>In the login modal, select or type your assigned Coach Email (e.g., <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[13px]">coach.arnis@baiscity.gov.ph</code>).</li>
                  <li>Enter your security credentials and tap <strong>[ Enter Delegation Hub ]</strong>.</li>
                  <li>Verify that your name, sport discipline, and <strong>[ COACH ]</strong> badge appear in the header.</li>
                </ol>
              </div>
            </section>
          )}

          {/* CHAPTER 2 */}
          {(activeChapter === 'all' || activeChapter === 'ch2') && (
            <section className="bg-white dark:bg-slate-800/80 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-[13px] flex items-center justify-center">
                    02
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-[13px] uppercase tracking-wide">
                    CHAPTER 2: DAILY DRILL & FIELD TIMELINE PLAYBOOK
                  </h3>
                </div>
                <span className="text-[13px] text-slate-400">Page 3 of PDF</span>
              </div>

              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-normal">
                Mandatory operational timeline enforced from December 10 through December 19, 2026.
              </p>

              {/* Timeline Cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[13px] font-black shrink-0">06:00 AM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Morning Wakeup & Breakfast Headcount</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Whereabouts tab • Billeting Quarters • Batch mark present athletes</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-blue-600 dark:text-blue-400">Whereabouts Log</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-600 text-white text-[13px] font-black shrink-0">08:30 AM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Morning Training Drills or Arena Transit</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Training Drills tab • Log drill focus, venue, hours & attending roster</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-cyan-600 dark:text-cyan-400">Training Drills</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white text-[13px] font-black shrink-0">12:00 PM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Midday Nutrition & Electrolyte Verification</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Nutrition tab • Inspect Lunch roster • Confirm athlete claims</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-orange-600 dark:text-orange-400">Nutrition Claims</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[13px] font-black shrink-0">02:00 PM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Pre-Bout Medical Clearance Check</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Medical tab • Confirm NO athlete has a pulsing red Medical Hold</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-rose-600 dark:text-rose-400">Health Check</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-[13px] font-black shrink-0">05:30 PM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Post-Bout Result & Medal Reporting</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Bouts tab • Log opponent, scores, round stage, and Win/Loss/Medal</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-amber-600 dark:text-amber-400">Match Results</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-700 text-white text-[13px] font-black shrink-0">10:00 PM</span>
                    <div>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white">Night Curfew & Billet Room Headcount</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Whereabouts tab • Physical room inspection • Child safety verification</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">Curfew Record</span>
                </div>
              </div>
            </section>
          )}

          {/* CHAPTER 3 */}
          {(activeChapter === 'all' || activeChapter === 'ch3') && (
            <section className="bg-white dark:bg-slate-800/80 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-[13px] flex items-center justify-center">
                    03
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-[13px] uppercase tracking-wide">
                    CHAPTER 3: MODULE-BY-MODULE FIELD GUIDES
                  </h3>
                </div>
                <span className="text-[13px] text-slate-400">Page 4 of PDF</span>
              </div>

              {/* 3.1 Whereabouts */}
              <div className="space-y-2">
                <h4 className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3.1 Whereabouts & Movement Logs</span>
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tap <strong>[ + Log Whereabouts ]</strong>. Choose location (Billeting Quarters, Main Stadium, Sports Complex, Coastal Court, Dining Hall) and activity. Tap <strong>[ Select All Sport Athletes ]</strong> or individual checkboxes. Add transit notes (e.g., <em>"Bus #2 with Chaperone Rosa"</em>) and tap Submit.
                </p>
              </div>

              {/* 3.2 Training */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>3.2 Training Drills & Practice Coverage</span>
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tap <strong>[ + Log Training Session ]</strong>. Specify drill focus (e.g., <em>"Tactical Counter-Attack & Set Plays"</em>), start/end times (duration calculates automatically), venue, and participating roster.
                </p>
              </div>

              {/* 3.3 Medical */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>3.3 Medical Triage & The "Medical Hold" Rule</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-[13px] space-y-1">
                  <p className="font-black text-[13px] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>ABSOLUTE PROHIBITION ON MEDICAL HOLDS</span>
                  </p>
                  <p className="text-[13px] leading-relaxed">
                    Any athlete flagged with a pulsing red <strong>MEDICAL HOLD</strong> badge cannot step onto the mat or court. Coaches cannot overrule medical triage. Return-to-play clearance must be signed off by the Bais Delegation Medical Doctor.
                  </p>
                </div>
              </div>

              {/* 3.4 Bouts */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>3.4 Tournament Bouts & Medal Outcomes</span>
                </h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tap <strong>[ + Record Bout Result ]</strong>. Enter athlete/team name, opponent city (e.g., <em>"Cebu City"</em>), round stage (Eliminations, Quarterfinals, Semifinals, Finals), score (e.g., <em>"24-18"</em>), and outcome (Win/Loss or Gold/Silver/Bronze). Real-time medal tallies update across the whole delegation instantly.
                </p>
              </div>
            </section>
          )}

          {/* CHAPTER 4 & 5 */}
          {(activeChapter === 'all' || activeChapter === 'ch4') && (
            <section className="bg-white dark:bg-slate-800/80 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-black text-[13px] flex items-center justify-center">
                    04 & 05
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white text-[13px] uppercase tracking-wide">
                    CHAPTER 4 & 5: FIELD SCENARIOS & COACH FAQ
                  </h3>
                </div>
                <span className="text-[13px] text-slate-400">Page 5 of PDF</span>
              </div>

              {/* Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-rose-600 text-[13px] block">Scenario A: Warm-up Sprain</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                    Escort athlete to Clinic. Medical logs injury and sets Cleared to Play to NO. App shows Medical Hold. Notify match officials of medical withdrawal.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-blue-600 text-[13px] block">Scenario B: Signal Drops Courtside</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                    Header switches to gray <strong>[ Offline Cache ]</strong>. Do not refresh. Continue logging. Everything queues safely and syncs when Wi-Fi/4G is restored.
                  </p>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-[13px] uppercase tracking-wider text-slate-500">Coach’s Quick FAQ</h4>
                <div className="space-y-3 text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-[13px]">Q: Why can't I delete a recorded bout?</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[13px] mt-1 leading-relaxed">
                      To preserve internal audit transparency, permanent deletion is restricted to Admins. Contact the Delegation Secretariat if a correction is needed.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-[13px]">Q: How do I filter to only see my athletes?</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[13px] mt-1 leading-relaxed">
                      Use the Sport Filter dropdown at the top of any view (Arnis, Taekwondo, Athletics, etc.).
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* POCKET CHEAT SHEET */}
          {(activeChapter === 'all' || activeChapter === 'pocket') && (
            <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 sm:p-7 rounded-2xl border-2 border-amber-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-white text-[13px] uppercase tracking-wide">
                    TEAR-OUT POCKET QUICK-REFERENCE CARD
                  </h3>
                </div>
                <span className="text-[13px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Page 6 of PDF
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-[13px] uppercase tracking-wider">Daily Must-Do Deadlines</h4>
                  <ul className="space-y-1.5 text-slate-300 text-[13px]">
                    <li>• <strong className="text-white">06:00 AM:</strong> Whereabouts & Breakfast Call</li>
                    <li>• <strong className="text-white">08:30 AM:</strong> Practice Drills & Hours</li>
                    <li>• <strong className="text-white">12:00 PM:</strong> Nutrition Lunch Verification</li>
                    <li>• <strong className="text-white">02:00 PM:</strong> Check Medical Holds</li>
                    <li>• <strong className="text-white">05:30 PM:</strong> Log Bouts & Medal Outcomes</li>
                    <li>• <strong className="text-white">10:00 PM:</strong> Mandatory Night Curfew</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-[13px] uppercase tracking-wider">Delegation Standards</h4>
                  <ul className="space-y-1.5 text-slate-300 text-[13px]">
                    <li>• Accreditation badges mandatory at all venues</li>
                    <li>• Bracket disputes routed via Secretariat</li>
                    <li>• Medical clearance strictly under Clinic authority</li>
                    <li>• Adhere strictly to 10:00 PM curfew headcount</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-900/50 border border-blue-500/40 text-center">
                <p className="text-[13px] font-black text-amber-300">
                  LAKANG BAISANON! DAD-A ANG KADAUGAN ALANG SA BAIS CITY!
                </p>
                <p className="text-[13px] text-slate-300 mt-1">
                  City Government of Bais • Batang Pinoy National Championships 2026
                </p>
              </div>
            </section>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
          <div className="text-[13px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Document Ref: <strong>BC-BP2026-MANUAL-REV1</strong> (Approved for Distribution)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[13px] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-[13px] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Preparing PDF...' : 'Download Official PDF (6 Pages)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
