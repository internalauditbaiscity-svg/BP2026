import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Check, 
  AlertTriangle, 
  Loader2, 
  FileText,
  Users
} from 'lucide-react';
import { DelegationMember, SportType } from '../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (members: Omit<DelegationMember, 'id' | 'createdAt' | 'env'>[]) => Promise<number>;
}

interface ParsedEntry {
  fullName: string;
  role: DelegationMember['role'];
  sport: SportType;
  gender: 'Male' | 'Female';
  age: number;
  billetingRoom: string;
  emergencyContact: string;
  accreditationNumber: string;
  status: DelegationMember['status'];
  isValid: boolean;
  validationError?: string;
}

const AUTHORIZED_SPORTS: SportType[] = [
  'Arnis',
  'Taekwondo',
  'Athletics',
  'Futsal',
  '3x3 Basketball',
  'Beach Volleyball',
  'Badminton',
  'Table Tennis',
  'General',
];

const VALID_ROLES = ['Athlete', 'Coach', 'Chaperone', 'Medical Staff', 'Delegation Official', 'Admin'] as const;

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download a sample CSV template
  const handleDownloadTemplate = () => {
    const templateContent = [
      'Full Name,Role,Sport,Gender,Age,Billeting Room,Emergency Contact,Accreditation Number,Status',
      '"Juan Carlos Dela Cruz","Athlete","Arnis","Male",15,"Billet Room 101","0917-123-4567","BP-BAIS-ARN-01","Active"',
      '"Maria Clara Santos","Athlete","Taekwondo","Female",14,"Billet Room 102","0918-234-5678","BP-BAIS-TKD-01","Active"',
      '"Danilo Gomez","Athlete","Athletics","Male",15,"Billet Room 103","0919-345-6789","BP-BAIS-ATH-01","Active"',
      '"Coach Roberto Aguilar","Coach","Arnis","Male",38,"Coaches Quarters","0920-456-7890","BP-BAIS-CCH-01","Active"',
      '"Maria Cristina Silva","Chaperone","General","Female",42,"Chaperone Quarters","0921-567-8901","BP-BAIS-CHP-01","Active"'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bais_delegation_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV line handling quotes and commas
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const processCsvText = (text: string) => {
    setErrorMsg('');
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check header
    const firstLine = parseCsvLine(lines[0]);
    const isHeader = firstLine.some(c => 
      c.toLowerCase().includes('name') || 
      c.toLowerCase().includes('role') || 
      c.toLowerCase().includes('sport')
    );

    const dataLines = isHeader ? lines.slice(1) : lines;
    const parsed: ParsedEntry[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const cols = parseCsvLine(dataLines[i]);
      if (cols.length === 0 || cols.every(c => !c)) continue;

      const fullName = cols[0] || '';
      let roleRaw = cols[1] || 'Athlete';
      let sportRaw = cols[2] || 'Arnis';
      let genderRaw = (cols[3] || 'Male').toLowerCase();
      let ageRaw = parseInt(cols[4] || '15', 10);
      let billetingRoom = cols[5] || 'Billet Room 101';
      let emergencyContact = cols[6] || '0917-000-0000';
      let accreditationNumber = cols[7] || `BP-BAIS-${Math.floor(1000 + Math.random() * 9000)}`;
      let statusRaw = cols[8] || 'Active';

      // Normalize role
      let role: DelegationMember['role'] = 'Athlete';
      const matchedRole = VALID_ROLES.find(r => r.toLowerCase() === roleRaw.toLowerCase());
      if (matchedRole) role = matchedRole;

      // Normalize sport
      let sport: SportType = 'General';
      const matchedSport = AUTHORIZED_SPORTS.find(s => s.toLowerCase() === sportRaw.toLowerCase());
      if (matchedSport) {
        sport = matchedSport;
      } else if (sportRaw.toLowerCase().includes('3x3') || sportRaw.toLowerCase().includes('basket')) {
        sport = '3x3 Basketball';
      } else if (sportRaw.toLowerCase().includes('beach') || sportRaw.toLowerCase().includes('volley')) {
        sport = 'Beach Volleyball';
      } else if (sportRaw.toLowerCase().includes('table') || sportRaw.toLowerCase().includes('ping')) {
        sport = 'Table Tennis';
      }

      // Normalize gender
      const gender: 'Male' | 'Female' = genderRaw.startsWith('f') ? 'Female' : 'Male';
      const age = isNaN(ageRaw) || ageRaw < 5 || ageRaw > 80 ? 15 : ageRaw;

      // Normalize status
      let status: DelegationMember['status'] = 'Active';
      if (statusRaw.toLowerCase().includes('billet')) status = 'Billeted';
      else if (statusRaw.toLowerCase().includes('hold') || statusRaw.toLowerCase().includes('med')) status = 'Medical Hold';
      else if (statusRaw.toLowerCase().includes('disqual')) status = 'Disqualified';

      const isValid = Boolean(fullName.trim());
      parsed.push({
        fullName: fullName.trim(),
        role,
        sport,
        gender,
        age,
        billetingRoom,
        emergencyContact,
        accreditationNumber,
        status,
        isValid,
        validationError: !isValid ? 'Missing full name' : undefined,
      });
    }

    setParsedRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      processCsvText(text);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please ensure it is a valid CSV.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('No valid rows found to import.');
      return;
    }

    setIsImporting(true);
    try {
      const payload: Omit<DelegationMember, 'id' | 'createdAt' | 'env'>[] = validRows.map(r => ({
        fullName: r.fullName,
        role: r.role,
        sport: r.sport,
        gender: r.gender,
        age: r.age,
        billetingRoom: r.billetingRoom,
        emergencyContact: r.emergencyContact,
        accreditationNumber: r.accreditationNumber,
        status: r.status,
      }));

      const count = await onImport(payload);
      alert(`Successfully imported ${count} delegation members into the registry!`);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg('Failed to batch import members. Please verify connection.');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-700 dark:bg-emerald-950/90 text-white p-5 flex items-center justify-between gap-4 border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0 backdrop-blur-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-100 bg-emerald-800/80 px-2 py-0.5 rounded-full inline-block">
                Batch Import Tool
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                Upload CSV Roster to Delegation Registry
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-emerald-100 font-bold text-xs rounded-xl border border-emerald-600/40 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Template</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-auto flex-1">
          
          {/* File Picker / Drag Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-colors"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv,text/csv" 
              className="hidden" 
            />
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
              {fileName ? fileName : 'Click or drag a CSV roster file here'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports columns: Full Name, Role, Sport, Gender, Age, Billeting Room, Emergency Contact, Accreditation ID, Status
            </p>
          </div>

          {/* Quick Paste Alternate */}
          <details className="text-xs text-slate-500 group">
            <summary className="font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline mb-2">
              Or paste raw CSV text directly...
            </summary>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                processCsvText(e.target.value);
              }}
              placeholder={`"Carlos Gomez","Athlete","Arnis","Male",15,"Room 101","0917-123-4567","BP-BAIS-01","Active"`}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </details>

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Parsed {parsedRows.length} entries ({validCount} valid)</span>
                </span>
                <span className="text-slate-400 font-normal">Review before uploading to database</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Sport</th>
                      <th className="py-2.5 px-3">Gender/Age</th>
                      <th className="py-2.5 px-3">Accreditation</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={row.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-red-50/50 dark:bg-red-950/20 text-red-700'}
                      >
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {row.fullName || <span className="italic text-red-500">Missing Name</span>}
                        </td>
                        <td className="py-2 px-3">{row.role}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {row.sport}
                          </span>
                        </td>
                        <td className="py-2 px-3">{row.gender}, {row.age}y</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{row.accreditationNumber}</td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                              <AlertTriangle className="w-3 h-3" /> Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={isImporting || validCount === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Roster...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Commit & Populate {validCount} Entries</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
