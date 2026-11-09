import React from 'react';
import { Plus, Smartphone, Layers, Columns2, Maximize2 } from 'lucide-react';
import { DeviceMode } from '../../types';

interface WorkspaceHeaderProps {
  deviceMode: DeviceMode;
  onSelectDeviceMode: (mode: DeviceMode) => void;
  onOpenAddExpense: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  deviceMode,
  onSelectDeviceMode,
  onOpenAddExpense,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 shrink-0 z-30 select-none">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectDeviceMode('iphone');
        }}
        className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
          $
        </span>
        <span>SpendWise</span>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-neutral-400">
        <button
          onClick={() => onSelectDeviceMode('iphone')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            deviceMode === 'iphone' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone 16</span>
        </button>

        <button
          onClick={() => onSelectDeviceMode('kmp-split')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            deviceMode === 'kmp-split' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>KMP Architecture</span>
        </button>

        <button
          onClick={() => onSelectDeviceMode('dual')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            deviceMode === 'dual' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>Dual iOS & Android</span>
        </button>

        <button
          onClick={() => onSelectDeviceMode('fullscreen')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            deviceMode === 'fullscreen' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Full App Canvas</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenAddExpense}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Record Expense</span>
        </button>
      </div>
    </header>
  );
};
