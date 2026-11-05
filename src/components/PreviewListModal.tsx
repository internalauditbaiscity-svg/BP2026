import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Table, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SportType } from '../types';

export interface PreviewColumn<T = any> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  csvAccessor?: (item: T) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface PreviewListModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  data: T[];
  columns: PreviewColumn<T>[];
  getItemSport?: (item: T) => string | undefined;
  getItemId?: (item: T) => string;
  categoryName?: string;
  canPrint?: boolean;
  canExportCsv?: boolean;
}

const ALL_SPORTS: SportType[] = [
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

export function PreviewListModal<T = any>({
  isOpen,
  onClose,
  moduleTitle,
  data,
  columns,
  getItemSport,
  getItemId,
  categoryName = 'Record',
  canPrint: canPrintProp,
  canExportCsv: canExportCsvProp,
}: PreviewListModalProps<T>) {
  if (!isOpen) return null;

  const auth = useAuth();
  const effectiveCanPrint = canPrintProp !== undefined ? canPrintProp : (auth?.canPrint ?? true);
  const effectiveCanExportCsv = canExportCsvProp !== undefined ? canExportCsvProp : (auth?.canExportCsv ?? true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'All' | 'Sports' | 'General'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Derive unique ID for an item
  const getId = (item: T, idx: number): string => {
    if (getItemId) return getItemId(item);
    if ((item as any).id) return (item as any).id;
    return `item_${idx}`;
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item, idx) => {
      const sport = getItemSport ? getItemSport(item) : (item as any).sport;

      // Scope filter: Sports vs General
      if (scopeFilter === 'Sports' && (!sport || sport === 'General')) {
        return false;
      }
      if (scopeFilter === 'General' && sport && sport !== 'General') {
        return false;
      }

      // Sport filter
      if (sportFilter !== 'All' && sport !== sportFilter) {
        return false;
      }

      // Search query across all column string values
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const rowText = Object.values(item as any)
          .map(v => typeof v === 'object' ? JSON.stringify(v) : String(v))
          .join(' ')
          .toLowerCase();
        if (!rowText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [data, sportFilter, scopeFilter, searchQuery, getItemSport]);

  // Checkbox multi-select logic
  const allFilteredSelected = filteredData.length > 0 && filteredData.every((item, idx) => selectedIds.has(getId(item, idx)));
  const someFilteredSelected = filteredData.some((item, idx) => selectedIds.has(getId(item, idx)));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredData.forEach((item, idx) => next.add(getId(item, idx)));
      setSelectedIds(next);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export selected / filtered to CSV
  const handleExportCSV = () => {
    if (!effectiveCanExportCsv) {
      alert('Export to CSV function has been restricted by the Administrator for your user account.');
      return;
    }

    const exportItems = selectedIds.size > 0 
      ? filteredData.filter((item, idx) => selectedIds.has(getId(item, idx)))
      : filteredData;

    if (exportItems.length === 0) {
      alert('No records to export.');
      return;
    }

    const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = exportItems.map(item => {
      return columns.map(col => {
        let val = '';
        if (col.csvAccessor) {
          val = col.csvAccessor(item);
        } else {
          const rendered = col.accessor(item);
          val = typeof rendered === 'string' || typeof rendered === 'number' 
            ? String(rendered) 
            : '';
        }
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bais_batang_pinoy_${moduleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_preview.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!effectiveCanPrint) {
      alert('Print Report function has been restricted by the Administrator for your user account.');
      return;
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[92vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 text-emerald-400 rounded-2xl shrink-0 border border-emerald-500/30">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/90 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  Display Only Tabular Report
                </span>
                <span className="text-xs text-slate-400">
                  {filteredData.length} {filteredData.length === 1 ? categoryName : `${categoryName}s`}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1">
                {moduleTitle} • Master Report Preview
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!effectiveCanPrint && !effectiveCanExportCsv && (
              <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                Print & Export restricted
              </span>
            )}
            {effectiveCanPrint && (
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Print display report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}
            {effectiveCanExportCsv && (
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
                {selectedIds.size > 0 && <span className="bg-emerald-800 px-1.5 py-0.2 rounded-full text-[10px]">({selectedIds.size})</span>}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across records..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Scope Toggle: All vs Sports vs General Delegation */}
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
              {(['All', 'Sports', 'General'] as const).map(scope => (
                <button
                  key={scope}
                  onClick={() => setScopeFilter(scope)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    scopeFilter === scope
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {scope === 'General' ? 'General Delegation' : scope}
                </button>
              ))}
            </div>

            {/* Sport Discipline Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="All">All Disciplines & Sports</option>
                {ALL_SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiple Selection Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{allFilteredSelected ? 'Deselect All' : 'Select All Filtered'}</span>
            </button>
            {selectedIds.size > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {selectedIds.size} selected
              </span>
            )}
          </div>

        </div>

        {/* Tabular Body (Scrollable) */}
        <div className="overflow-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {filteredData.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Table className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Matching Records</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items match the selected sport filter, general delegation scope, or search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold sticky top-0 z-10 shadow-xs backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-500 hover:text-emerald-600"
                      aria-label="Toggle all rows"
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-12 text-center text-slate-400 font-mono">#</th>
                  {columns.map((col, cIdx) => (
                    <th 
                      key={cIdx} 
                      className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                      style={{ width: col.width }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((item, rIdx) => {
                  const id = getId(item, rIdx);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr 
                      key={id}
                      onClick={() => handleToggleRow(id)}
                      className={`transition-colors cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30' 
                          : rIdx % 2 === 0 
                            ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40' 
                            : 'bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(id)}
                          className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {rIdx + 1}
                      </td>
                      {columns.map((col, cIdx) => (
                        <td 
                          key={cIdx} 
                          className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                        >
                          {col.accessor(item)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 px-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>Total records in module: <strong className="text-slate-900 dark:text-white">{data.length}</strong></span>
            <span>•</span>
            <span>Filtered report view: <strong className="text-emerald-600 dark:text-emerald-400">{filteredData.length}</strong></span>
            {selectedIds.size > 0 && (
              <>
                <span>•</span>
                <span>Selected: <strong className="text-emerald-600 dark:text-emerald-400">{selectedIds.size}</strong></span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Bais City Delegation Hub • Batang Pinoy 2026 Tabular Audit View
          </div>
        </div>

      </div>
    </div>
  );
}
